import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronLeft, Lock, MessageSquare, Pencil } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { localizedName, one, type City } from "@/lib/types";
import { ClaimForm } from "../claim-form";

type Props = { params: Promise<{ slug: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BizRow = {
  id: string;
  name: string;
  slug: string | null;
  owner_id: string | null;
  cities: City | City[] | null;
};

async function getBusiness(slug: string): Promise<BizRow | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const select = "id, name, slug, owner_id, cities(*)";
  const { data } = await supabase
    .from("businesses")
    .select(select)
    .eq("slug", slug)
    .maybeSingle();
  if (data) return data as BizRow;
  if (UUID_RE.test(slug)) {
    const { data: byId } = await supabase
      .from("businesses")
      .select(select)
      .eq("id", slug)
      .maybeSingle();
    return (byId as BizRow) ?? null;
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("ff");
  const biz = await getBusiness(slug);
  return { title: biz ? `${t("claimPageTitle")} — ${biz.name}` : t("claimPageTitle") };
}

/** Eigene Seite für den Inhaberschafts-Antrag: erst erklären, dann Formular. */
export default async function ClaimPage({ params }: Props) {
  const { slug } = await params;
  const biz = await getBusiness(slug);
  if (!biz) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const city = one(biz.cities);
  const backHref = `/app/biz/${biz.slug ?? biz.id}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let state: "taken" | "login" | "exists" | "form" = "form";
  if (biz.owner_id) state = "taken";
  else if (!user) state = "login";
  else {
    const { data: existing } = await supabase
      .from("business_claims")
      .select("id")
      .eq("business_id", biz.id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing) state = "exists";
  }

  const benefits = [
    { icon: Pencil, h: t("claimWhy1Title"), p: t("claimWhy1") },
    { icon: BadgeCheck, h: t("claimWhy2Title"), p: t("claimWhy2") },
    { icon: MessageSquare, h: t("claimWhy3Title"), p: t("claimWhy3") },
  ];

  return (
    <main className="flex flex-1 flex-col bg-surface pb-8">
      <header className="flex items-center gap-2 bg-white px-3 py-3">
        <Link
          href={backHref}
          aria-label={t("claimBack")}
          className="grid h-10 w-10 flex-none place-items-center rounded-full text-ink hover:bg-surface"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 leading-tight">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {biz.name}
            {city ? ` · ${localizedName(city, locale)}` : ""}
          </div>
          <h1 className="truncate text-[19px] font-extrabold tracking-[-0.015em] text-ink">
            {t("claimPageTitle")}
          </h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4">
        {/* Warum übernehmen */}
        <section className="flex flex-col gap-3.5 rounded-[18px] border border-line bg-white p-5">
          <p className="text-[14.5px] leading-relaxed text-ink-2">
            {t("claimIntro")}
          </p>
          {benefits.map((b, i) => (
            <div key={i} className="flex gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ff-mint text-ff-primary">
                <b.icon className="h-5 w-5" />
              </span>
              <span className="leading-snug">
                <span className="block text-[15px] font-extrabold text-ink">
                  {b.h}
                </span>
                <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">
                  {b.p}
                </span>
              </span>
            </div>
          ))}
        </section>

        {/* Ablauf */}
        <section className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {t("claimHowTitle")}
          </h2>
          {[t("claimStep1"), t("claimStep2"), t("claimStep3")].map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-ff-primary text-[12px] font-extrabold text-white">
                {i + 1}
              </span>
              <span className="text-[14px] leading-relaxed text-ink-2">{s}</span>
            </div>
          ))}
          <p className="mt-1 flex gap-2 rounded-[14px] bg-surface p-3 text-[12.5px] leading-relaxed text-muted">
            <Lock className="mt-0.5 h-4 w-4 flex-none text-ff-primary" />
            {t("claimPrivacy")}
          </p>
        </section>

        {/* Antrag */}
        {state === "taken" && (
          <p className="rounded-[18px] bg-ff-mint-light p-4 text-[14px] font-semibold text-ff-primary-dark">
            {t("claimExists")}
          </p>
        )}
        {state === "exists" && (
          <p className="rounded-[18px] bg-ff-mint-light p-4 text-[14px] font-semibold text-ff-primary-dark">
            {t("claimExists")}
          </p>
        )}
        {state === "login" && (
          <Link
            href="/app/login"
            className="flex h-13 items-center justify-center rounded-full bg-ff-accent py-3.5 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            {t("claimLoginCta")}
          </Link>
        )}
        {state === "form" && (
          <section className="rounded-[18px] border border-line bg-white p-5">
            <ClaimForm businessId={biz.id} />
          </section>
        )}
      </div>
    </main>
  );
}
