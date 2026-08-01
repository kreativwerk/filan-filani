"use client";

/* Neues Passwort setzen — Ziel des "Passwort vergessen"-Links aus der E-Mail.
   Der Auth-Callback hat die Sitzung bereits hergestellt. */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { FFLogo } from "@/components/ff-logo";

export default function FFNewPasswordPage() {
  const t = useTranslations("ff");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setError(null);
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setDone(true);
    setTimeout(() => window.location.assign("/app"), 1200);
  }

  return (
    <main className="flex flex-1 flex-col items-center bg-surface px-5 pb-8">
      <div className="flex flex-col items-center gap-4 pb-6 pt-14">
        <FFLogo className="h-24 w-24" />
      </div>
      <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-[0_8px_32px_rgba(16,25,23,0.08)]">
        {done ? (
          <p className="rounded-[14px] bg-ff-mint p-4 text-sm font-semibold text-ff-primary-dark">
            {t("passwordSaved")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-extrabold text-ink">
                {t("passwordNew")}
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="flex h-14 w-full items-center justify-center rounded-full bg-ff-accent text-[19px] font-bold text-white hover:opacity-90 disabled:opacity-50"
            >
              {t("passwordSave")}
            </button>
            {error && <p className="text-sm text-alert">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
