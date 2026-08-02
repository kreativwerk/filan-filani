import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getCities, getCategories } from "@/lib/ff-data";
import { FFAddBusinessClient } from "./add-business-client";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("addBusiness")} | Filan Filani` };
}

/** Betrieb in der FF-App einreichen — für Inhaber und Community (ohne Vergütung). */
export default async function FFAddBusinessPage({
  searchParams,
}: {
  searchParams: Promise<{ imi?: string }>;
}) {
  const t = await getTranslations("ff");
  const { imi } = await searchParams;

  let signedIn = false;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  }

  if (!signedIn) {
    return (
      <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          {t("addBusiness")}
        </h1>
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
      </main>
    );
  }

  const [cities, categories] = await Promise.all([
    getCities(),
    getCategories(),
  ]);

  return (
    <main className="ff-brand flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
        {t("addBusiness")}
      </h1>
      <FFAddBusinessClient
        cities={cities}
        categories={categories}
        defaultMine={imi === "1"}
      />
    </main>
  );
}
