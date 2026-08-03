import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { FFStar } from "./star";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";

/** Präsentations-Datensatz einer Betriebskarte (Design 1a) */
export type FFBiz = {
  key: string;
  href: string;
  name: string;
  meta: string; // „Kategoria · Qyteti"
  cover: string | null;
  verified: boolean;
  rating: number | null;
  ratingCount: number;
};

/** Foto 16:9 bzw. Platzhalter-Schraffur wie im Design */
export function FFCover({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn("grid place-items-center", className)}
        style={{
          background:
            "repeating-linear-gradient(135deg,#E9EDEB 0 10px,#F4F6F5 10px 20px)",
        }}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Supabase-Storage-URLs ohne Image-Loader-Konfiguration
    <img src={src} alt={alt} className={cn("object-cover", className)} />
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations("ff");
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-[9px] bg-ff-mint px-[9px] py-[5px] text-[11.5px] font-extrabold text-ff-primary-dark",
        className,
      )}
    >
      <BadgeCheck className="h-3 w-3" />
      {t("verified")}
    </span>
  );
}

export function FFBusinessCard({
  biz,
  className,
}: {
  biz: FFBiz;
  className?: string;
}) {
  return (
    <Link
      href={biz.href}
      className={cn(
        "block overflow-hidden rounded-[18px] border border-line bg-white",
        className,
      )}
    >
      <div className="relative">
        <FFCover src={biz.cover} alt={biz.name} className="h-24 w-full" />
        {biz.verified && (
          <VerifiedBadge className="absolute right-2.5 top-2.5" />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <div className="truncate text-[19px] font-extrabold tracking-[-0.015em] text-ink">
          {biz.name}
        </div>
        <div className="truncate text-[13.5px] text-muted">{biz.meta}</div>
        {biz.rating !== null && (
          <div className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink-2">
            <FFStar className="h-[15px] w-[15px]" />
            {biz.rating.toFixed(1)}
            {biz.ratingCount > 0 && (
              <span className="font-medium text-muted">
                · {biz.ratingCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Vertikale Liste (mobil) / 3er-Raster (Desktop) für Listen-Seiten */
export function FFBusinessList({
  items,
  emptyLabel,
}: {
  items: FFBiz[];
  emptyLabel?: string;
}) {
  const t = useTranslations("ff");
  if (!items.length) {
    return (
      <p className="rounded-[18px] border border-line bg-white p-5 text-[15px] text-muted">
        {emptyLabel ?? t("noBusinesses")}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {items.map((b) => (
        <FFBusinessCard key={b.key} biz={b} />
      ))}
    </div>
  );
}
