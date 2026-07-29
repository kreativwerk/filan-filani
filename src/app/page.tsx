import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UserPlus, Store, Euro, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Wordmark } from "@/components/ui";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const ta = await getTranslations("auth");

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/dashboard");
  }

  const steps = [
    { icon: UserPlus, title: t("how1Title"), text: t("how1Text") },
    { icon: Store, title: t("how2Title"), text: t("how2Text") },
    { icon: Euro, title: t("how3Title"), text: t("how3Text") },
  ];

  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Wordmark size="sm" />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="flex h-11 items-center rounded-full border-[1.5px] border-line-strong bg-white px-5 text-sm font-bold text-ink hover:bg-surface"
          >
            {t("login")}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-14 pt-12 text-center">
        <span className="inline-block rounded-full bg-primary-light px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-primary-dark">
          0,50 € / +1
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
          {t("heroText")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="flex h-14 items-center rounded-full bg-primary px-8 text-[17px] font-bold text-white hover:bg-primary-dark"
          >
            {t("cta")}
          </Link>
          <Link
            href="/login"
            className="flex h-14 items-center rounded-full border-[1.5px] border-primary bg-white px-8 text-[17px] font-bold text-primary-dark hover:bg-primary-light/40"
          >
            {t("login")}
          </Link>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-[12.5px] text-muted">
          <ShieldCheck className="h-[15px] w-[15px]" />
          {ta("runnersOnly")}
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 pb-20 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-[18px] border border-line bg-white p-5"
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary-light text-primary-dark">
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-extrabold tracking-[-0.015em] text-ink">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {step.text}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
