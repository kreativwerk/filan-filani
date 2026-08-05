"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, HandCoins } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

/** „Interesse melden" — legt den Betrieb als Empfänger an und schaltet die
 *  Kundendaten frei (MyHammer-Prinzip). */
export function ClaimButton({
  requestId,
  businesses,
  disabled,
}: {
  requestId: string;
  businesses: { id: string; name: string }[];
  disabled?: boolean;
}) {
  const t = useTranslations("ff");
  const tc = useTranslations("common");
  const router = useRouter();
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    if (busy || !businessId) return;
    setBusy(true);
    setError(null);
    const { data, error: rpcError } = await createClient().rpc("claim_request", {
      p_request: requestId,
      p_business: businessId,
    });
    setBusy(false);
    if (rpcError) {
      setError(tc("error"));
      return;
    }
    if (data === "ok") {
      router.refresh();
      return;
    }
    setError(
      data === "full"
        ? t("poolErrFull")
        : data === "requests-off"
          ? t("poolErrOff")
          : tc("error"),
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      {businesses.length > 1 && (
        <label className="flex flex-col gap-1">
          <span className="text-[12.5px] font-bold text-muted">
            {t("poolPickBiz")}
          </span>
          <select
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            className="h-11 rounded-[12px] border-[1.5px] border-line bg-white px-3 text-[14.5px] font-semibold text-ink"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        onClick={claim}
        disabled={busy || disabled}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-ff-accent text-[15.5px] font-extrabold text-white hover:opacity-90 disabled:opacity-40"
      >
        {busy ? (
          t("poolClaiming")
        ) : (
          <>
            <HandCoins className="h-[18px] w-[18px]" />
            {t("poolClaim")}
          </>
        )}
      </button>
      <p className="flex items-start gap-1.5 text-[12px] leading-relaxed text-muted">
        <Check className="mt-0.5 h-3.5 w-3.5 flex-none text-ff-primary" />
        {t("poolWhy")}
      </p>
      {error && (
        <p className="text-[13.5px] font-semibold text-alert">{error}</p>
      )}
    </div>
  );
}
