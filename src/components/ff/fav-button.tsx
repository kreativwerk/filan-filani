"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/components/ui";

/** Herz-Knopf auf dem Betriebsprofil: Betrieb merken / vergessen */
export function FavButton({
  businessId,
  initialSaved,
  signedIn,
}: {
  businessId: string;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const t = useTranslations("ff");
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/app/login");
      return;
    }
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/app/login");
      setBusy(false);
      return;
    }
    if (saved) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("business_id", businessId);
      if (!error) setSaved(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, business_id: businessId });
      if (!error) setSaved(true);
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? t("savedBiz") : t("saveBiz")}
      aria-pressed={saved}
      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-ink shadow-sm"
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          saved ? "fill-ff-accent text-ff-accent" : "",
        )}
      />
    </button>
  );
}
