"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function FFLogout() {
  const router = useRouter();
  const t = useTranslations("auth");

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/app");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border-[1.5px] border-line-strong bg-white text-[15px] font-bold text-ink hover:bg-surface"
    >
      <LogOut className="h-[18px] w-[18px]" />
      {t("logout")}
    </button>
  );
}
