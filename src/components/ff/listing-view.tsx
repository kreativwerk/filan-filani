/* Listen-Ansicht für Stadt-/Kategorie-Seiten und die Suche:
   Kopf mit Zurück-Pfeil (mobil) bzw. großer Überschrift (Desktop),
   Filter-Pills, Betriebskarten. */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";
import { FFBusinessList, type FFBiz } from "./business-card";

export type FFPill = { href: string; label: string; active: boolean };

export function FFListingView({
  eyebrow,
  title,
  count,
  pills,
  items,
  emptyLabel,
  secondaryLabel,
  secondaryItems,
  children,
}: {
  eyebrow: string;
  title: string;
  count?: number;
  pills?: FFPill[];
  items: FFBiz[];
  emptyLabel?: string;
  /** Zweiter Abschnitt, z. B. "Aus anderen Städten" */
  secondaryLabel?: string;
  secondaryItems?: FFBiz[];
  children?: React.ReactNode;
}) {
  const t = useTranslations("ff");

  return (
    <>
      <header className="flex items-center gap-2 bg-white px-3 py-3 lg:hidden">
        <Link
          href="/app"
          aria-label={t("backHome")}
          className="grid h-10 w-10 flex-none place-items-center rounded-full text-ink hover:bg-surface"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 leading-tight">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {eyebrow}
          </div>
          <h1 className="truncate text-[19px] font-extrabold tracking-[-0.015em] text-ink">
            {title}
          </h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 bg-surface py-4 lg:gap-6 lg:p-8">
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {eyebrow}
          </div>
          <h1 className="mt-1.5 text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            {title}
          </h1>
        </div>

        {children}

        {pills && pills.length > 0 && (
          <div className="no-scrollbar sticky top-0 z-20 -my-2 flex gap-2 overflow-x-auto bg-surface/95 px-4 py-2 backdrop-blur-md lg:flex-wrap lg:px-0">
            {pills.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={cn(
                  "flex h-9 flex-none items-center rounded-full px-3.5 text-[13.5px] font-bold",
                  p.active
                    ? "bg-ff-primary text-white"
                    : "border-[1.5px] border-line bg-white text-ink-2",
                )}
              >
                {p.label}
              </Link>
            ))}
          </div>
        )}

        {(count !== undefined || items.length > 0) && (
          <div className="flex flex-col gap-2.5 px-4 lg:px-0">
            {count !== undefined && (
              <div className="text-[13.5px] font-semibold text-muted">
                {t("resultCount", { count })}
              </div>
            )}
            <FFBusinessList items={items} emptyLabel={emptyLabel} />
          </div>
        )}

        {secondaryItems && secondaryItems.length > 0 && (
          <div className="flex flex-col gap-2.5 px-4 pt-1 lg:px-0">
            {secondaryLabel && (
              <div className="text-[13.5px] font-semibold text-muted">
                {secondaryLabel}
              </div>
            )}
            <FFBusinessList items={secondaryItems} />
          </div>
        )}
      </main>
    </>
  );
}
