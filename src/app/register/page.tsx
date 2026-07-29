"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Wordmark } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: "scout", locale },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data.session) {
      setInfo(t("checkEmail"));
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const field = (
    label: string,
    input: React.ReactNode,
  ): React.ReactNode => (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-ink-2">{label}</span>
      {input}
    </label>
  );

  return (
    <main className="flex flex-1 flex-col items-center bg-surface px-5 pb-8">
      <div className="flex w-full max-w-md justify-end pt-4">
        <LanguageSwitcher />
      </div>

      <Link href="/" className="pb-8 pt-8">
        <Wordmark size="lg" />
      </Link>

      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_8px_32px_rgba(16,25,23,0.08)]">
        <h1 className="text-center text-[22px] font-extrabold tracking-[-0.015em] text-ink">
          {t("registerTitle")}
        </h1>
        {!configured && (
          <p className="mt-3 rounded-[14px] bg-amber-50 p-3 text-sm text-amber-800">
            Supabase ist noch nicht konfiguriert (.env.local fehlt).
          </p>
        )}
        {info ? (
          <p className="mt-5 rounded-[14px] bg-primary-light p-4 text-sm text-primary-dark">
            {info}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3.5">
            {field(
              t("fullName"),
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="h-[52px]"
              />,
            )}
            {field(
              t("phone"),
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+383 4x xxx xxx"
                className="h-[52px]"
              />,
            )}
            {field(
              t("email"),
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-[52px]"
              />,
            )}
            {field(
              t("password"),
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-[52px]"
              />,
            )}
            {error && <p className="text-sm text-alert">{error}</p>}
            <Button
              type="submit"
              className="mt-1 h-14 w-full text-[19px]"
              disabled={loading || !configured}
            >
              {loading ? tc("loading") : t("submitRegister")}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {t("hasAccount")}{" "}
        <Link href="/login" className="font-bold text-primary">
          {t("submitLogin")}
        </Link>
      </p>
    </main>
  );
}
