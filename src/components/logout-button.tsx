"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("auth");

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label={t("logout")}
      className="grid h-11 w-11 flex-none place-items-center rounded-full text-muted hover:bg-surface hover:text-ink"
    >
      <LogOut className="h-[20px] w-[20px]" />
    </button>
  );
}
