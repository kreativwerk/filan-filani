"use client";

/* Filan-Filani-App-Rahmen (Design 1a):
   mobil vier Bottom-Tabs, ab lg die 260px-Sidebar mit Logo, Suche, Nav und
   orangenem CTA — Inhalt bleibt identisch. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FileText,
  Heart,
  Home,
  Plus,
  Search,
  Store,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { FFLogo } from "@/components/ff-logo";
import { cn } from "@/components/ui";

export function FFShell({
  citySlug,
  children,
}: {
  citySlug: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("ff");
  const pathname = usePathname();

  const onHome = pathname === "/app" || pathname.startsWith("/preview");
  const onSearch = pathname.startsWith("/app/kerko");
  const onDiscover =
    !onHome && !onSearch && !pathname.startsWith("/app/login");

  const tabs = [
    { href: "/app", icon: Home, label: t("tabHome"), active: onHome },
    { href: "/app/kerko", icon: Search, label: t("tabSearch"), active: onSearch },
    { href: "/app/login", icon: Heart, label: t("tabSaved"), active: false },
    { href: "/app/login", icon: Store, label: t("tabBusiness"), active: false },
  ];

  const sidebar = [
    { href: "/app", icon: Home, label: t("tabHome"), active: onHome },
    {
      href: `/app/${citySlug}`,
      icon: Compass,
      label: t("navDiscover"),
      active: onDiscover,
    },
    { href: "/app/login", icon: Heart, label: t("tabSaved"), active: false },
    { href: "/app/login", icon: FileText, label: t("navRequests"), active: false },
    { href: "/app/login", icon: Store, label: t("tabBusiness"), active: false },
  ];

  return (
    <div className="flex w-full flex-1 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar (Desktop) */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-[22px] border-r border-line bg-[#FBFCFC] px-4 py-[22px] lg:flex">
        <Link href="/app" className="flex items-center gap-2.5 px-1.5">
          <FFLogo className="h-9 w-9 flex-none" />
          <span className="text-[15px] font-extrabold tracking-[-0.01em] text-ink">
            Filan Filani
          </span>
        </Link>
        <Link
          href="/app/kerko"
          className="flex h-11 items-center gap-2 rounded-[14px] border-[1.5px] border-line bg-surface px-3 text-[14.5px] text-muted"
        >
          <Search className="h-[18px] w-[18px]" />
          {t("tabSearch")}
        </Link>
        <nav className="flex flex-col gap-0.5">
          {sidebar.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-3 py-[11px] text-[15px]",
                item.active
                  ? "bg-ff-mint font-extrabold text-ff-primary-dark"
                  : "font-semibold text-ink-2 hover:bg-surface",
              )}
            >
              <item.icon className="h-[21px] w-[21px]" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/app/login"
          className="mt-auto flex h-12 items-center justify-center gap-2 rounded-full bg-ff-accent text-[17px] font-extrabold text-white hover:opacity-90"
        >
          <Plus className="h-[19px] w-[19px]" />
          {t("addBusiness")}
        </Link>
      </aside>

      {/* Inhalt */}
      <div className="flex min-w-0 flex-1 flex-col pb-[76px] lg:pb-0">
        {children}
      </div>

      {/* Bottom-Tabs (mobil) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white/95 px-1 pb-[22px] pt-[9px] backdrop-blur-xl lg:hidden">
        {tabs.map((tab, i) => (
          <Link
            key={i}
            href={tab.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1",
              tab.active ? "text-ff-primary" : "text-muted",
            )}
          >
            <tab.icon className="h-[27px] w-[27px]" />
            <span
              className={cn(
                "text-[11px]",
                tab.active ? "font-extrabold" : "font-semibold",
              )}
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
