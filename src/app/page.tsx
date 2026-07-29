import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UserPlus, Store, Euro } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function LandingPage() {
  const t = await getTranslations("landing");

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
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-petrol">KS Data</span>
          <span className="text-xs text-petrol/50">by Filan Filani</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="rounded-full border border-petrol/20 px-4 py-1.5 text-sm font-semibold text-petrol hover:bg-petrol/5"
          >
            {t("login")}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-16 pt-14 text-center">
        <span className="inline-block rounded-full bg-lime px-3 py-1 text-xs font-bold uppercase tracking-wide text-petrol-dark">
          0,50 € / +1
        </span>
        <h1 className="mt-5 text-4xl font-bold leading-tight text-petrol sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-foreground/70">
          {t("heroText")}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-petrol px-7 py-3 text-sm font-semibold text-white hover:bg-petrol-dark"
          >
            {t("cta")}
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-petrol/20 px-7 py-3 text-sm font-semibold text-petrol hover:bg-petrol/5"
          >
            {t("login")}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-4 pb-20 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-2xl border border-petrol/10 bg-white p-6 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime">
              <step.icon className="h-5 w-5 text-petrol-dark" />
            </div>
            <h3 className="mt-4 font-semibold text-petrol">{step.title}</h3>
            <p className="mt-1.5 text-sm text-foreground/70">{step.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
