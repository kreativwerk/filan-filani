"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "./ui";

export function BottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const onHome = pathname === "/dashboard";
  const onList = pathname === "/businesses";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-line bg-white/95 px-10 pb-5 pt-2.5 backdrop-blur-xl sm:hidden">
      <Link
        href="/dashboard"
        className={cn(
          "flex w-16 flex-col items-center gap-1",
          onHome ? "text-primary" : "text-muted",
        )}
      >
        <Home className="h-[26px] w-[26px]" />
        <span className={cn("text-[11px]", onHome ? "font-extrabold" : "font-semibold")}>
          {t("home")}
        </span>
      </Link>
      <Link
        href="/businesses/new"
        aria-label={t("newEntry")}
        className="-mt-8 grid h-16 w-16 place-items-center rounded-full bg-primary text-white shadow-[0_8px_24px_rgba(34,34,221,0.32)]"
      >
        <Plus className="h-[30px] w-[30px]" />
      </Link>
      <Link
        href="/businesses"
        className={cn(
          "flex w-16 flex-col items-center gap-1",
          onList ? "text-primary" : "text-muted",
        )}
      >
        <List className="h-[26px] w-[26px]" />
        <span className={cn("text-[11px]", onList ? "font-extrabold" : "font-semibold")}>
          {t("entries")}
        </span>
      </Link>
    </nav>
  );
}
