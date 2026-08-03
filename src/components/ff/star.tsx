import { cn } from "@/components/ui";

/** Google-artiger Stern: spitze Zacken, helles Gelb (#FBBC04) */
export const STAR_COLOR = "#FBBC04";

const STAR_PATH =
  "M12 1.6l3.09 6.94 7.41.72-5.57 5.01 1.62 7.33L12 17.77l-6.55 3.83 1.62-7.33L1.5 9.26l7.41-.72L12 1.6z";

export function FFStar({
  className,
  filled = true,
}: {
  className?: string;
  /** false = nur Umriss (leerer Stern) */
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("flex-none", className)}
      aria-hidden
      fill={filled ? STAR_COLOR : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? 0 : 1.6}
      strokeLinejoin="round"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

/** Sterne-Reihe für Bewertungen (gefüllt bis `value`) */
export function FFStars({
  value,
  className,
  starClassName,
}: {
  value: number;
  className?: string;
  starClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <FFStar
          key={n}
          filled={n <= value}
          className={cn("h-4 w-4 text-line-strong", starClassName)}
        />
      ))}
    </span>
  );
}
