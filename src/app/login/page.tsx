"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Wordmark } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(t("invalidCredentials"));
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleForgotPassword() {
    if (!configured || !email) return;
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/dashboard`,
    });
    setInfo(t("resetSent"));
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-surface px-5 pb-8">
      <div className="flex w-full max-w-md justify-end pt-4">
        <LanguageSwitcher />
      </div>

      <Link href="/" className="pb-10 pt-10">
        <Wordmark size="lg" />
      </Link>

      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(16,25,23,0.08)]">
        <h1 className="text-center text-[22px] font-extrabold tracking-[0.06em] text-ink">
          {t("loginTitle")}
        </h1>
        {!configured && (
          <p className="mt-3 rounded-[14px] bg-amber-50 p-3 text-sm text-amber-800">
            Supabase ist noch nicht konfiguriert (.env.local fehlt).
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-2">{t("email")}</span>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-[52px]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-ink-2">{t("password")}</span>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="h-[52px]"
            />
          </label>
          {error && <p className="text-sm text-alert">{error}</p>}
          {info && (
            <p className="rounded-[14px] bg-primary-light p-3 text-sm text-primary-dark">
              {info}
            </p>
          )}
          <Button
            type="submit"
            className="mt-1 h-14 w-full text-[19px]"
            disabled={loading || !configured}
          >
            {loading ? tc("loading") : t("submitLogin")}
          </Button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="py-2 text-center text-sm font-bold text-primary hover:text-primary-dark"
          >
            {t("forgotPassword")}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {t("noAccount")}{" "}
        <Link href="/register" className="font-bold text-primary">
          {t("registerTitle")}
        </Link>
      </p>

      <p className="mt-auto flex items-center gap-2 pt-8 text-[12.5px] text-muted">
        <ShieldCheck className="h-[15px] w-[15px]" />
        {t("runnersOnly")}
      </p>
    </main>
  );
}
