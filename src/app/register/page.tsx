"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";
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
      // E-Mail-Bestätigung ist aktiviert
      setInfo(t("checkEmail"));
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    if (!configured) return;
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
    });
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10">
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <Link href="/" className="text-lg font-bold text-petrol">
          KS Data
        </Link>
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-bold text-petrol">{t("registerTitle")}</h1>
        {!configured && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Supabase ist noch nicht konfiguriert (.env.local fehlt).
          </p>
        )}
        {info ? (
          <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            {info}
          </p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <Field label={t("fullName")}>
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label={t("phone")}>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+383 4x xxx xxx"
                />
              </Field>
              <Field label={t("email")}>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field label={t("password")}>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !configured}
              >
                {loading ? tc("loading") : t("submitRegister")}
              </Button>
            </form>
            <div className="my-4 flex items-center gap-3 text-xs text-foreground/40">
              <span className="h-px flex-1 bg-petrol/10" />
              {t("or")}
              <span className="h-px flex-1 bg-petrol/10" />
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleGoogle}
              disabled={!configured}
            >
              {t("google")}
            </Button>
          </>
        )}
        <p className="mt-5 text-center text-sm text-foreground/60">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-petrol underline">
            {t("submitLogin")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
