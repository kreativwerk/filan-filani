import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Globe } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { getCities, toFFBiz, type FFBizRow } from "@/lib/ff-data";
import { FFBusinessCard } from "@/components/ff/business-card";
import { cn } from "@/components/ui";

import { EXPORT_CODES as B2B_CODES } from "@/lib/export-countries";

type Props = { searchParams: Promise<{ vendi?: string | string[] }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("b2bTitle")} | Filan Filani` };
}

/** B2B-Verzeichnis: genehmigte Betriebe mit Export-Ländern, per ?vendi=DE filterbar. */
export default async function FFB2BPage({ searchParams }: Props) {
  const sp = await searchParams;
  const vendi = (Array.isArray(sp.vendi) ? sp.vendi[0] : sp.vendi) ?? "";
  const code = B2B_CODES.includes(vendi.toUpperCase())
    ? vendi.toUpperCase()
    : "";

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const tco = await getTranslations("countries");

  type B2BItem = ReturnType<typeof toFFBiz> & { countries: string[] };
  let items: B2BItem[] = [];
  let total = 0;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    let query = supabase
      .from("businesses")
      .select("*, business_categories(categories(*)), reviews(rating)", {
        count: "exact",
      })
      .eq("status", "approved")
      .neq("export_countries", "{}")
      .order("completeness", { ascending: false })
      .order("name");
    if (code) query = query.contains("export_countries", [code]);

    // Spalte export_countries fehlt evtl. noch in der Live-DB:
    // bei Query-Fehler (data null) bewusst leere Liste rendern, kein Crash
    const [cities, { data: rows, count }] = await Promise.all([
      getCities(),
      query,
    ]);
    const cityById = new Map(cities.map((c) => [c.id, c]));
    items = ((rows ?? []) as FFBizRow[]).map((row) => ({
      ...toFFBiz(row, locale, { city: cityById.get(row.city_id) ?? null }),
      countries:
        (row as { export_countries?: string[] | null }).export_countries ?? [],
    }));
    total = count ?? items.length;
  }

  const pills = [
    { href: "/app/b2b", label: t("b2bAll"), active: !code },
    ...B2B_CODES.map((c) => ({
      href: `/app/b2b?vendi=${c}`,
      label: tco(c.toLowerCase()),
      active: code === c,
    })),
  ];

  return (
    <>
      {/* Kopf (mobil) mit Zurück-Pfeil, wie auf den Listen-Seiten */}
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
            Filan Filani
          </div>
          <h1 className="truncate text-[19px] font-extrabold tracking-[-0.015em] text-ink">
            {t("b2bTitle")}
          </h1>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 bg-surface py-4 lg:gap-6 lg:p-8">
        <div className="hidden lg:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            Filan Filani
          </div>
          <h1 className="mt-1.5 text-[34px] font-extrabold tracking-[-0.03em] text-ink">
            {t("b2bTitle")}
          </h1>
        </div>

        <p className="px-4 text-[14.5px] leading-relaxed text-muted lg:max-w-2xl lg:px-0">
          {t("b2bHint")}
        </p>

        {/* Länder-Filter */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 lg:flex-wrap lg:px-0">
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

        <div className="flex flex-col gap-2.5 px-4 lg:px-0">
          <div className="text-[13.5px] font-semibold text-muted">
            {t("resultCount", { count: total })}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
                <Globe className="h-8 w-8" />
              </div>
              <p className="text-[14.5px] leading-relaxed text-muted">
                {t("b2bEmpty")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
              {items.map((b) => (
                <div key={b.key} className="flex flex-col gap-1.5">
                  <FFBusinessCard biz={b} />
                  {b.countries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {b.countries.map((c) => (
                        <span
                          key={c}
                          className="flex h-7 items-center rounded-full bg-ff-mint px-2.5 text-[12px] font-bold text-ff-primary-dark"
                        >
                          {B2B_CODES.includes(c) ? tco(c.toLowerCase()) : c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
