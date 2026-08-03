"use client";

/* Bewertung schreiben: 1–5 Sterne (Pflicht) + optionaler Text.
   Ein Nutzer = eine Bewertung pro Betrieb (unique business_id+user_id):
   upsert aktualisiert die bestehende Bewertung statt zu duplizieren. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { FFStar } from "@/components/ff/star";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function ReviewForm({
  businessId,
  initialRating,
  initialBody,
}: {
  businessId: string;
  initialRating: number | null;
  initialBody: string;
}) {
  const t = useTranslations("ff");
  const tc = useTranslations("common");
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [body, setBody] = useState(initialBody);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError(t("reviewChoose"));
      return;
    }
    setSending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not signed in");

      const { error: upsertError } = await supabase.from("reviews").upsert(
        {
          business_id: businessId,
          user_id: user.id,
          rating,
          body: body.trim() || null,
        },
        { onConflict: "business_id,user_id" },
      );
      if (upsertError) throw upsertError;
      setDone(true);
      router.refresh();
    } catch {
      setError(tc("error"));
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2.5 rounded-[14px] bg-ff-mint p-4">
        <CheckCircle2 className="h-6 w-6 flex-none text-ff-primary" />
        <p className="text-[14.5px] font-bold text-ff-primary-dark">
          {t("reviewThanks")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="text-[14px] font-bold text-ink">
        {initialRating ? t("reviewYours") : t("reviewWrite")}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={t("reviewStars", { n })}
            aria-pressed={rating >= n}
            onClick={() => setRating(n)}
            className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface"
          >
            <FFStar
              filled={rating >= n}
              className="h-7 w-7 text-line-strong transition-transform active:scale-90"
            />
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("reviewPlaceholder")}
        rows={3}
        className="w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
      />
      {error && <p className="text-[14px] font-semibold text-alert">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="flex h-12 items-center justify-center rounded-full bg-ff-primary text-[15px] font-extrabold text-white hover:opacity-90 disabled:opacity-50"
      >
        {sending ? tc("loading") : t("reviewSend")}
      </button>
    </form>
  );
}
