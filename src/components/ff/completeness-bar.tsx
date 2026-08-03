import { getTranslations } from "next-intl/server";
import { cn } from "@/components/ui";

/** Höchstwert der generierten Spalte businesses.completeness (siehe Migration 0013) */
export const MAX_COMPLETENESS = 25;

/** Fortschrittsbalken für Inhaber: motiviert, das Profil zu vervollständigen */
export async function CompletenessBar({
  score,
  missing,
}: {
  score: number;
  missing?: string[];
}) {
  const t = await getTranslations("ff");
  const pct = Math.min(100, Math.round((score / MAX_COMPLETENESS) * 100));

  return (
    <div className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-white p-3">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-extrabold text-ink">
          {t("profileScore", { pct })}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            pct >= 70
              ? "bg-ff-primary"
              : pct >= 40
                ? "bg-[#C79A2B]"
                : "bg-ff-accent",
          )}
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>
      {missing && missing.length > 0 ? (
        <p className="text-[12px] leading-relaxed text-muted">
          {t("missingData")} {missing.join(", ")}
        </p>
      ) : (
        <p className="text-[12px] leading-relaxed text-muted">
          {t("profileScoreHint")}
        </p>
      )}
    </div>
  );
}
