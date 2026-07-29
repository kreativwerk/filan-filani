import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight, Camera, MapPin, Phone, CircleAlert } from "lucide-react";
import type { BusinessStatus } from "@/lib/types";
import { Card, SectionLabel } from "./ui";
import { StatusBadge } from "./status-badge";

export type DashboardData = {
  earnings: number;
  totalCount: number;
  todayCount: number;
  corrections: { id: string; name: string; note: string; icon?: string }[];
  categories: [string, number][];
  recent: { id: string; name: string; city: string; status: BusinessStatus }[];
};

const correctionIcons = {
  phone: Phone,
  camera: Camera,
  "map-pin": MapPin,
} as const;

export function DashboardView({ data }: { data: DashboardData }) {
  const t = useTranslations("dashboard");

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <SectionLabel>{t("title")}</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Card className="flex flex-col gap-1.5 p-4">
            <SectionLabel className="tracking-[0.06em]">
              {t("earningsShort")}
            </SectionLabel>
            <div className="font-mono text-[26px] font-medium tracking-[-0.025em] text-primary">
              {data.earnings.toFixed(2).replace(".", ",")}&nbsp;€
            </div>
            <div className="text-[12.5px] text-muted">{t("thisMonth")}</div>
          </Card>
          <Card className="flex flex-col gap-1.5 p-4">
            <SectionLabel className="tracking-[0.06em]">
              {t("totalShort")}
            </SectionLabel>
            <div className="font-mono text-[26px] font-medium tracking-[-0.025em] text-ink">
              {data.totalCount}
            </div>
            <div className="text-[12.5px] text-muted">
              {t("today", { count: data.todayCount })}
            </div>
          </Card>
        </div>
        <p className="text-[12.5px] text-muted">{t("earningsHint")}</p>
      </div>

      {data.corrections.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionLabel>{t("corrections")}</SectionLabel>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-extrabold text-primary-dark">
              {t("correctionsOpen", { count: data.corrections.length })}
            </span>
          </div>
          <div className="overflow-hidden rounded-[18px] border border-line bg-white">
            {data.corrections.map((c) => {
              const Icon =
                correctionIcons[c.icon as keyof typeof correctionIcons] ??
                CircleAlert;
              return (
                <Link
                  key={c.id}
                  href={`/businesses/${c.id}/edit`}
                  className="flex items-center gap-3 border-b border-divider px-3.5 py-3 last:border-b-0 hover:bg-surface"
                >
                  <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary-light text-primary-dark">
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-bold text-ink">
                      {c.name}
                    </div>
                    <div className="truncate text-[13px] text-muted">
                      {c.note}
                    </div>
                  </div>
                  <ChevronRight className="h-[19px] w-[19px] flex-none text-faint" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {data.categories.length > 0 && (
        <section className="space-y-2.5">
          <SectionLabel>{t("categories")}</SectionLabel>
          <div className="overflow-hidden rounded-[18px] border border-line bg-white">
            {data.categories.map(([label, n]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border-b border-divider px-3.5 py-3 last:border-b-0"
              >
                <div className="text-[15px] font-semibold text-ink">{label}</div>
                <div className="font-mono text-[13px] font-medium text-muted">
                  {n}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-2.5">
        <SectionLabel>{t("recent")}</SectionLabel>
        {!data.recent.length ? (
          <Card className="text-sm text-muted">
            {t("noEntries")}{" "}
            <Link
              href="/businesses/new"
              className="font-bold text-primary hover:text-primary-dark"
            >
              {t("newEntryCta")}
            </Link>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-[18px] border border-line bg-white">
            {data.recent.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 border-b border-divider px-3.5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-bold text-ink">
                    {b.name}
                  </div>
                  <div className="truncate text-[13px] text-muted">{b.city}</div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
