"use client";

/* Filan-Filani-App-Rahmen (Design 1a):
   mobil vier Bottom-Tabs, ab lg die 260px-Sidebar mit Logo, Suche, Nav und
   orangenem CTA — Inhalt bleibt identisch. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Compass,
  FileText,
  Globe,
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
  // Erst nach dem ersten Frame aufklappen, damit der Titel sichtbar animiert
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onHome = pathname === "/app" || pathname.startsWith("/preview");
  const onSearch = pathname.startsWith("/app/kerko");
  const onBusiness = pathname.startsWith("/app/biznesi");
  const onSaved = pathname.startsWith("/app/ruajtura");
  const onB2B = pathname.startsWith("/app/b2b");
  const onDiscover =
    !onHome &&
    !onSearch &&
    !onBusiness &&
    !onSaved &&
    !onB2B &&
    !pathname.startsWith("/app/login");

  const tabs = [
    { href: "/app", icon: Home, label: t("tabHome"), active: onHome },
    { href: "/app/kerko", icon: Search, label: t("tabSearch"), active: onSearch },
    {
      href: "/app/ruajtura",
      icon: Heart,
      label: t("tabSaved"),
      active: onSaved,
    },
    {
      href: "/app/biznesi",
      icon: Store,
      label: t("tabBusiness"),
      active: onBusiness,
    },
  ];

  const sidebar = [
    { href: "/app", icon: Home, label: t("tabHome"), active: onHome },
    {
      href: `/app/${citySlug}`,
      icon: Compass,
      label: t("navDiscover"),
      active: onDiscover,
    },
    {
      href: "/app/ruajtura",
      icon: Heart,
      label: t("tabSaved"),
      active: onSaved,
    },
    { href: "/app/b2b", icon: Globe, label: t("b2bNav"), active: onB2B },
    // "Kërkesat" (Anfragen) kommt zurück, sobald das Feature gebaut ist
    {
      href: "/app/biznesi",
      icon: Store,
      label: t("tabBusiness"),
      active: onBusiness,
    },
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
          href="/app/shto"
          className="mt-auto flex h-12 items-center justify-center gap-2 rounded-full bg-ff-accent text-[17px] font-extrabold text-white hover:opacity-90"
        >
          <Plus className="h-[19px] w-[19px]" />
          {t("addBusiness")}
        </Link>
      </aside>

      {/* Inhalt */}
      <div className="flex min-w-0 flex-1 flex-col pb-[104px] lg:pb-0">
        {children}
      </div>

      {/* Schwebende Bottom-Pille (mobil): aktiver Tab klappt mit Titel auf */}
      <nav
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 lg:hidden"
        style={{ paddingBottom: "max(18px, env(safe-area-inset-bottom))" }}
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-[#101917]/95 p-1.5 shadow-[0_10px_36px_rgba(16,25,23,0.38)] backdrop-blur-xl">
          {tabs.map((tab, i) => {
            const open = tab.active && mounted;
            return (
              <Link
                key={i}
                href={tab.href}
                aria-label={tab.label}
                className={cn(
                  "flex h-12 items-center rounded-full transition-all duration-300 ease-out",
                  tab.active
                    ? "bg-white/[0.16] px-4 text-white"
                    : "px-3.5 text-white/60 hover:text-white/90 active:text-white",
                )}
              >
                <tab.icon className="h-6 w-6 flex-none" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap text-[13.5px] font-extrabold transition-all duration-300 ease-out",
                    open ? "ml-2 max-w-[120px] opacity-100" : "ml-0 max-w-0 opacity-0",
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
