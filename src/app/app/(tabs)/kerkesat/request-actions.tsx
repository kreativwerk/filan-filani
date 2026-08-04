"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Phone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

/** Statuspflege einer erhaltenen Anfrage durch den Betrieb */
export function RequestActions({
  requestId,
  businessId,
  status,
  phone,
}: {
  requestId: string;
  businessId: string;
  status: "new" | "viewed" | "responded" | "declined";
  phone: string | null;
}) {
  const t = useTranslations("ff");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(next: "responded" | "declined") {
    if (busy) return;
    setBusy(true);
    await createClient()
      .from("request_recipients")
      .update({ status: next, responded_at: new Date().toISOString() })
      .eq("request_id", requestId)
      .eq("business_id", businessId);
    setBusy(false);
    router.refresh();
  }

  if (status === "responded" || status === "declined") return null;

  return (
    <div className="flex flex-wrap gap-2 border-t border-line pt-3">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ff-primary px-4 text-[14.5px] font-extrabold text-white hover:opacity-90"
        >
          <Phone className="h-[18px] w-[18px]" />
          {t("reqCall")}
        </a>
      )}
      <button
        type="button"
        onClick={() => setStatus("responded")}
        disabled={busy}
        className="flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-4 text-[14px] font-bold text-ink hover:bg-surface disabled:opacity-50"
      >
        <Check className="h-4 w-4 text-ff-primary" />
        {t("reqMarkResponded")}
      </button>
      <button
        type="button"
        onClick={() => setStatus("declined")}
        disabled={busy}
        className="flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line bg-white px-4 text-[14px] font-bold text-muted hover:bg-surface disabled:opacity-50"
      >
        <X className="h-4 w-4" />
        {t("reqDecline")}
      </button>
    </div>
  );
}
