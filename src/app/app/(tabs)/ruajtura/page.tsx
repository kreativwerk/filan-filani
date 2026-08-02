import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { one } from "@/lib/types";
import { getCities, toFFBiz, type FFBizRow } from "@/lib/ff-data";
import { FFBusinessList } from "@/components/ff/business-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("tabSaved")} | Filan Filani` };
}

/** "Të ruajtura": die gemerkten Betriebe des Nutzers */
export default async function FFSavedPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");

  let signedIn = false;
  let items: ReturnType<typeof toFFBiz>[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);

    if (user) {
      const [cities, { data: favs }] = await Promise.all([
        getCities(),
        supabase
          .from("favorites")
          .select(
            "created_at, businesses(*, business_categories(categories(*)), reviews(rating))",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      const cityById = new Map(cities.map((c) => [c.id, c]));
      items = (favs ?? [])
        .map((f) => one(f.businesses) as FFBizRow | null)
        .filter((b): b is FFBizRow => Boolean(b && b.status === "approved"))
        .map((row) =>
          toFFBiz(row, locale, { city: cityById.get(row.city_id) ?? null }),
        );
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
        {t("tabSaved")}
      </h1>

      {!signedIn ? (
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
            <Heart className="h-8 w-8" />
          </div>
          <p className="text-[15px] leading-relaxed text-ink-2">
            {t("savedHint")}
          </p>
          <Link
            href="/app/login"
            className="flex h-12 items-center justify-center rounded-full bg-ff-accent px-8 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            {t("claimLoginCta")}
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
            <Heart className="h-8 w-8" />
          </div>
          <p className="text-[15px] font-bold text-ink">{t("savedEmpty")}</p>
          <p className="text-[14px] leading-relaxed text-muted">
            {t("savedHint")}
          </p>
          <Link
            href="/app/kerko"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-ff-primary px-8 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            <Search className="h-[18px] w-[18px]" />
            {t("tabSearch")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <FFBusinessList items={items} />
        </div>
      )}
    </main>
  );
}
