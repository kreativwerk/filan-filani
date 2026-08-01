"use client";

/* Filan Filani — Splash (Screen 2b) + Anmeldung (Screen 2a)
   aus design/filan-filani-screens.html */

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FFLogo } from "@/components/ff-logo";
import { cn } from "@/components/ui";
import { LanguageSwitcher } from "@/components/language-switcher";

const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

const providerBtn =
  "flex h-14 w-full items-center gap-3.5 rounded-full border-[1.5px] border-line-strong bg-white px-[18px] text-[17px] font-bold text-ink disabled:opacity-50";

export function FFLogin() {
  const t = useTranslations("ff");
  const ta = useTranslations("auth");
  const [splash, setSplash] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured || !email || !password) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(ta("invalidCredentials"));
        setLoading(false);
        return;
      }
      window.location.assign("/app");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=/app`,
          data: { full_name: fullName.trim() || undefined },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setInfo(ta("checkEmail"));
    }
  }

  async function handleMagic() {
    if (!configured) return;
    if (!email) {
      setError(t("enterEmail"));
      return;
    }
    setError(null);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/app` },
    });
    if (error) setError(error.message);
    else setInfo(t("magicSent"));
  }

  async function handleForgot() {
    if (!configured) return;
    if (!email) {
      setError(t("enterEmail"));
      return;
    }
    setError(null);
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/app/fjalekalimi`,
    });
    setInfo(ta("resetSent"));
  }

  async function handleOAuth(provider: "google" | "facebook" | "apple") {
    if (!configured) return;
    await createClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback?next=/app` },
    });
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Splash (2b): Petrol-Fläche, weißes Signet, blendet nach 1,4 s aus */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col items-center justify-center gap-[22px] bg-ff-primary transition-opacity duration-500",
          splash ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <FFLogo variant="dark" className="h-28 w-28" />
        <div className="flex flex-col items-center gap-2">
          <div className="text-[26px] font-extrabold tracking-[-0.03em] text-white">
            filan-filani.com
          </div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-ff-teal-soft">
            Connect Kosovo
          </div>
        </div>
      </div>

      {/* Anmeldung (2a) */}
      <div
        className="flex flex-1 flex-col items-center px-5 pb-8"
        style={{
          background:
            "repeating-radial-gradient(circle at 50% 160px, #EAEEED 0 1px, transparent 1px 30px), linear-gradient(#FBFCFC, #F4F6F5)",
        }}
      >
        <div className="flex w-full max-w-md justify-end pt-4">
          <LanguageSwitcher />
        </div>

        <div className="flex flex-col items-center gap-5 pb-7 pt-8">
          <FFLogo className="h-[148px] w-[148px]" />
          <div className="flex flex-col items-center gap-2">
            <div className="text-[30px] font-extrabold tracking-[-0.02em] text-ink">
              FILAN-FILANI.COM
            </div>
            <div className="text-[13px] font-bold tracking-[0.22em] text-muted">
              CONNECT KOSOVO
            </div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-[0_8px_32px_rgba(16,25,23,0.08)]">
          {!configured && (
            <p className="mb-3 rounded-[14px] bg-amber-50 p-3 text-sm text-amber-800">
              Supabase ist noch nicht konfiguriert (.env.local fehlt).
            </p>
          )}
          {info ? (
            <p className="rounded-[14px] bg-ff-mint p-4 text-sm font-semibold text-ff-primary-dark">
              {info}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {mode === "register" && (
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-extrabold text-ink">
                      {ta("fullName")}
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      className="h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
                    />
                  </label>
                )}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-extrabold text-ink">
                    {ta("email")}
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Adresa juaj e email-it"
                    autoComplete="email"
                    className="h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-extrabold text-ink">
                    {ta("password")}
                  </span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    className="h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!configured || loading}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-ff-accent text-[19px] font-bold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {mode === "login" ? ta("submitLogin") : ta("submitRegister")}
                </button>
              </form>

              <div className="flex items-center justify-between text-[13.5px] font-semibold">
                {mode === "login" ? (
                  <>
                    <button
                      type="button"
                      onClick={handleForgot}
                      className="text-muted hover:text-ink"
                    >
                      {ta("forgotPassword")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        setError(null);
                      }}
                      className="font-extrabold text-ff-primary"
                    >
                      {ta("noAccount")} {ta("submitRegister")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="ml-auto font-extrabold text-ff-primary"
                  >
                    {ta("hasAccount")} {ta("submitLogin")}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3.5 py-1">
                <div className="h-px flex-1 bg-line" />
                <span className="text-[13px] font-semibold text-muted">
                  {ta("or")}
                </span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={handleMagic}
                disabled={!configured}
                className={providerBtn}
              >
                <Mail className="h-6 w-6 flex-none text-ff-primary" />
                <span className="flex-1 pr-6 text-center">
                  {t("continueEmail")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!configured}
                className={providerBtn}
              >
                <Image
                  src="/brand/google-logo.svg"
                  alt="Google"
                  width={24}
                  height={24}
                  className="flex-none"
                />
                <span className="flex-1 pr-6 text-center">{t("google")}</span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("facebook")}
                disabled={!configured}
                className={providerBtn}
              >
                <span className="grid h-[26px] w-[26px] flex-none place-items-center overflow-hidden rounded-full bg-[#1877F2]">
                  <Image
                    src="/brand/facebook-logo.svg"
                    alt="Facebook"
                    width={26}
                    height={26}
                  />
                </span>
                <span className="flex-1 pr-[26px] text-center">
                  {t("facebook")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                disabled={!configured}
                className="flex h-14 w-full items-center gap-3.5 rounded-full bg-ink px-[18px] text-[17px] font-bold text-white disabled:opacity-50"
              >
                <Image
                  src="/brand/apple-logo.svg"
                  alt="Apple"
                  width={22}
                  height={22}
                  className="flex-none"
                />
                <span className="flex-1 pr-[22px] text-center">
                  {t("apple")}
                </span>
              </button>

              {error && <p className="text-sm text-alert">{error}</p>}
              <p className="mt-0.5 text-center text-[12.5px] leading-relaxed text-muted">
                {t("terms")}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
