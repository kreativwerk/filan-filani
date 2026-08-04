import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ALL_CITIES, getCategories, getCities, getCookieCitySlug } from "@/lib/ff-data";
import { RequestForm } from "./request-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("reqNew")} | Filan Filani` };
}

type Props = { searchParams: Promise<{ kategoria?: string }> };

/** Kunde beschreibt seinen Auftrag — er geht an alle passenden Betriebe. */
export default async function FFRequestPage({ searchParams }: Props) {
  const t = await getTranslations("ff");
  const { kategoria } = await searchParams;

  if (!hasSupabaseEnv()) {
    return (
      <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
        <h1 className="text-[24px] font-extrabold text-ink">{t("reqNew")}</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const [{ data: userData }, cities, categories, citySlug] = await Promise.all([
    supabase.auth.getUser(),
    getCities(),
    getCategories(),
    getCookieCitySlug(),
  ]);
  const user = userData.user;

  let profileName = "";
  let profilePhone = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();
    profileName = profile?.full_name ?? "";
    profilePhone = profile?.phone ?? "";
  }

  const defaultCity =
    citySlug === ALL_CITIES
      ? ""
      : String(cities.find((c) => c.slug === citySlug)?.id ?? "");
  const defaultCategory = kategoria
    ? String(categories.find((c) => c.slug === kategoria)?.id ?? "")
    : "";

  return (
    <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-ff-mint text-ff-primary">
          <FileText className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink lg:text-[30px]">
            {t("reqNew")}
          </h1>
        </div>
      </div>
      <p className="max-w-2xl text-[14.5px] leading-relaxed text-ink-2">
        {t("reqIntro")}
      </p>

      <div className="max-w-2xl">
        {user ? (
          <RequestForm
            cities={cities}
            categories={categories}
            defaultCityId={defaultCity}
            defaultCategoryId={defaultCategory}
            defaultName={profileName}
            defaultPhone={profilePhone}
            defaultEmail={user.email ?? ""}
          />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center">
            <p className="text-[15px] leading-relaxed text-ink-2">
              {t("reqLogin")}
            </p>
            <Link
              href="/app/login"
              className="flex h-12 items-center justify-center rounded-full bg-ff-accent px-8 text-[16px] font-extrabold text-white hover:opacity-90"
            >
              {t("claimLoginCta")}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
