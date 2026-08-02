"use client";

/* Inhaberschafts-Antrag: Nachricht, Rückrufnummer und zwei Pflicht-Uploads
   (Gewerbenachweis + Ausweis) → Bucket "claim-documents", dann Insert in
   business_claims. Doppelter Antrag (unique) → verständliche Fehlermeldung. */

import { useState } from "react";
import { CheckCircle2, FileUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/components/ui";

function FileField({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] border-dashed px-4 py-3",
        file ? "border-ff-primary bg-ff-mint-light" : "border-line-strong bg-white",
      )}
    >
      <FileUp
        className={cn(
          "h-5 w-5 flex-none",
          file ? "text-ff-primary" : "text-muted",
        )}
      />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[14px] font-bold text-ink">{label}</span>
        <span className="block truncate text-[12.5px] text-muted">
          {file ? file.name : hint}
        </span>
      </span>
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

export function ClaimForm({ businessId }: { businessId: string }) {
  const t = useTranslations("ff");
  const tc = useTranslations("common");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [docBusiness, setDocBusiness] = useState<File | null>(null);
  const [docId, setDocId] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!message.trim() || !phone.trim() || !docBusiness || !docId) {
      setError(t("claimRequired"));
      return;
    }
    setSending(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not signed in");

      const ts = Date.now();
      const ext = (f: File) => f.name.split(".").pop() || "bin";
      const base = `${user.id}/${businessId}`;
      const paths = [
        `${base}/gewerbenachweis-${ts}.${ext(docBusiness)}`,
        `${base}/ausweis-${ts}.${ext(docId)}`,
      ];

      for (const [i, file] of [docBusiness, docId].entries()) {
        const { error: upErr } = await supabase.storage
          .from("claim-documents")
          .upload(paths[i], file);
        if (upErr) throw upErr;
      }

      const { error: insErr } = await supabase.from("business_claims").insert({
        business_id: businessId,
        user_id: user.id,
        message: message.trim(),
        contact_phone: phone.trim(),
        document_paths: paths,
        status: "pending",
      });
      if (insErr) {
        if (insErr.code === "23505") {
          setError(t("claimExists"));
          return;
        }
        throw insErr;
      }
      setDone(true);
    } catch {
      setError(tc("error"));
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[18px] bg-ff-mint p-5 text-center">
        <CheckCircle2 className="h-8 w-8 text-ff-primary" />
        <div className="text-[17px] font-extrabold text-ff-primary-dark">
          {t("claimSuccess")}
        </div>
        <p className="text-[14px] text-ff-primary-dark">
          {t("claimSuccessText")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-[13.5px] leading-relaxed text-muted">
        {t("claimIntro")}
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-[14px] font-bold text-ink">
          {t("claimMessage")}
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("claimMessagePh")}
          required
          rows={3}
          className="w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[14px] font-bold text-ink">
          {t("claimPhone")}
        </span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+383 4x xxx xxx"
          required
          className="h-[50px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
        />
      </label>
      <FileField
        label={t("claimDocBusiness")}
        hint={t("claimDocHint")}
        file={docBusiness}
        onChange={setDocBusiness}
      />
      <FileField
        label={t("claimDocId")}
        hint={t("claimDocHint")}
        file={docId}
        onChange={setDocId}
      />
      {error && <p className="text-[14px] font-semibold text-alert">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="flex h-[52px] items-center justify-center rounded-full bg-ff-primary text-[16px] font-extrabold text-white hover:opacity-90 disabled:opacity-50"
      >
        {sending ? t("claimSending") : t("claimSubmit")}
      </button>
    </form>
  );
}
