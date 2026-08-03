import type { Metadata } from "next";
import Link from "next/link";
import { Package, Pencil, Plus, Search, Store } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { getCities, getCategories, toFFBiz, type FFBizRow } from "@/lib/ff-data";
import { FFBusinessCard } from "@/components/ff/business-card";
import { CompletenessBar } from "@/components/ff/completeness-bar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("tabBusiness")} | Filan Filani` };
}

/** "Biznesi im": Gäste sehen die Login-Aufforderung, Inhaber ihre Betriebe. */
export default async function FFMyBusinessPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");

  const tf = await getTranslations("form");
  let signedIn = false;
  let items: ReturnType<typeof toFFBiz>[] = [];
  const scores = new Map<string, { score: number; missing: string[] }>();

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);

    if (user) {
      const [cities, { data: rows }] = await Promise.all([
        getCities(),
        supabase
          .from("businesses")
          .select("*, business_categories(categories(*)), reviews(rating)")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      const cityById = new Map(cities.map((c) => [c.id, c]));
      await getCategories(); // Cache für localizedName-Fallbacks warmhalten
      const list = (rows ?? []) as FFBizRow[];
      items = list.map((row) =>
        toFFBiz(row, locale, { city: cityById.get(row.city_id) ?? null }),
      );
      // Vollständigkeit je Betrieb (für den Fortschrittsbalken)
      for (const row of list) {
        const r = row as FFBizRow & { completeness?: number };
        const missing: string[] = [];
        if (!row.cover_url) missing.push(tf("photos"));
        if (!row.phone) missing.push(tf("phone").replace(" *", ""));
        if (!row.opening_hours) missing.push(tf("hours"));
        if (!row.description) missing.push(tf("description"));
        if (!row.email) missing.push(tf("email"));
        if (!row.website) missing.push(tf("website"));
        scores.set(row.id, { score: r.completeness ?? 0, missing });
      }
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
        {t("tabBusiness")}
      </h1>

      {!signedIn ? (
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
            <Store className="h-8 w-8" />
          </div>
          <p className="text-[15px] leading-relaxed text-ink-2">
            {t("myBizLogin")}
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
            <Store className="h-8 w-8" />
          </div>
          <p className="text-[15px] font-bold text-ink">{t("myBizEmpty")}</p>
          <p className="text-[14px] leading-relaxed text-muted">
            {t("myBizHint")}
          </p>
          <Link
            href="/app/shto?imi=1"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-ff-accent px-8 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            <Plus className="h-[18px] w-[18px]" />
            {t("addMine")}
          </Link>
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
          <div className="text-[13.5px] font-semibold text-muted">
            {t("myBizYours")}
          </div>
          {/* Eigene Betriebe: Karte + Inhaber-Aktionen (Bearbeiten, Produkte) */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {items.map((b) => (
              <div key={b.key} className="flex flex-col gap-1.5">
                <FFBusinessCard biz={b} />
                {scores.has(b.key) && (
                  <CompletenessBar
                    score={scores.get(b.key)!.score}
                    missing={scores.get(b.key)!.missing}
                  />
                )}
                <div className="grid grid-cols-2 gap-1.5">
                  <Link
                    href={`/app/biznesi/${b.key}/edit`}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line bg-white text-[13.5px] font-bold text-ink hover:bg-surface"
                  >
                    <Pencil className="h-4 w-4 text-ff-primary" />
                    {t("manageEdit")}
                  </Link>
                  <Link
                    href={`/app/biznesi/${b.key}/produkte`}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line bg-white text-[13.5px] font-bold text-ink hover:bg-surface"
                  >
                    <Package className="h-4 w-4 text-ff-primary" />
                    {t("manageProducts")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/app/shto?imi=1"
            className="mt-2 flex h-12 w-fit items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-6 text-[15px] font-extrabold text-ink hover:bg-surface"
          >
            <Plus className="h-[18px] w-[18px]" />
            {t("addMine")}
          </Link>
        </div>
      )}
    </main>
  );
}
