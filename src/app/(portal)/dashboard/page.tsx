import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ChevronRight, CircleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one, type BusinessStatus } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Card, SectionLabel } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";

type Row = {
  id: string;
  name: string;
  status: BusinessStatus;
  review_note: string | null;
  created_at: string;
  cities: unknown;
  business_categories: { categories: unknown }[] | null;
};

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, { data: ledger }] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        `id, name, status, review_note, created_at,
         cities(name_sq, name_de, name_en, name_sr),
         business_categories(categories(name_sq, name_de, name_en, name_sr))`,
      )
      .eq("scout_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("scout_ledger").select("amount").eq("scout_id", user!.id),
  ]);

  const businesses = (data ?? []) as unknown as Row[];
  const earnings = (ledger ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
  const today = new Date().toDateString();
  const todayCount = businesses.filter(
    (b) => new Date(b.created_at).toDateString() === today,
  ).length;
  const corrections = businesses.filter((b) => b.status === "rejected");

  const catCounts = new Map<string, number>();
  for (const b of businesses) {
    for (const bc of b.business_categories ?? []) {
      const c = one(bc.categories) as {
        name_sq: string;
        name_de: string;
        name_en: string;
        name_sr: string;
      } | null;
      if (!c) continue;
      const label = localizedName(c, locale);
      catCounts.set(label, (catCounts.get(label) ?? 0) + 1);
    }
  }
  const cats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const cityName = (b: Row) => {
    const c = one(b.cities) as {
      name_sq: string;
      name_de: string;
      name_en: string;
      name_sr: string;
    } | null;
    return c ? localizedName(c, locale) : "";
  };

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
              {earnings.toFixed(2).replace(".", ",")}&nbsp;€
            </div>
            <div className="text-[12.5px] text-muted">{t("thisMonth")}</div>
          </Card>
          <Card className="flex flex-col gap-1.5 p-4">
            <SectionLabel className="tracking-[0.06em]">
              {t("totalShort")}
            </SectionLabel>
            <div className="font-mono text-[26px] font-medium tracking-[-0.025em] text-ink">
              {businesses.length}
            </div>
            <div className="text-[12.5px] text-muted">
              {t("today", { count: todayCount })}
            </div>
          </Card>
        </div>
        <p className="text-[12.5px] text-muted">{t("earningsHint")}</p>
      </div>

      {corrections.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <SectionLabel>{t("corrections")}</SectionLabel>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-extrabold text-primary-dark">
              {t("correctionsOpen", { count: corrections.length })}
            </span>
          </div>
          <div className="overflow-hidden rounded-[18px] border border-line bg-white">
            {corrections.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 border-b border-divider px-3.5 py-3 last:border-b-0"
              >
                <div className="grid h-9 w-9 flex-none place-items-center rounded-full bg-primary-light text-primary-dark">
                  <CircleAlert className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold text-ink">
                    {b.name}
                  </div>
                  <div className="truncate text-[13px] text-muted">
                    {b.review_note || cityName(b)}
                  </div>
                </div>
                <ChevronRight className="h-[19px] w-[19px] flex-none text-faint" />
              </div>
            ))}
          </div>
        </section>
      )}

      {cats.length > 0 && (
        <section className="space-y-2.5">
          <SectionLabel>{t("categories")}</SectionLabel>
          <div className="overflow-hidden rounded-[18px] border border-line bg-white">
            {cats.map(([label, n]) => (
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
        {!businesses.length ? (
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
            {businesses.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 border-b border-divider px-3.5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-bold text-ink">
                    {b.name}
                  </div>
                  <div className="truncate text-[13px] text-muted">
                    {cityName(b)}
                  </div>
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
