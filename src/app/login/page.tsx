"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Field, Input } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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
        <h1 className="text-xl font-bold text-petrol">{t("loginTitle")}</h1>
        {!configured && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Supabase ist noch nicht konfiguriert (.env.local fehlt).
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !configured}>
            {loading ? tc("loading") : t("submitLogin")}
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
        <p className="mt-5 text-center text-sm text-foreground/60">
          {t("noAccount")}{" "}
          <Link href="/register" className="font-semibold text-petrol underline">
            {t("registerTitle")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
