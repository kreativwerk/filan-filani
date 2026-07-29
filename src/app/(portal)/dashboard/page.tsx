import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one, type BusinessStatus } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import {
  DashboardView,
  type DashboardData,
} from "@/components/dashboard-view";

type Row = {
  id: string;
  name: string;
  status: BusinessStatus;
  review_note: string | null;
  created_at: string;
  cities: unknown;
  business_categories: { categories: unknown }[] | null;
};

type NamedRow = {
  name_sq: string;
  name_de: string;
  name_en: string;
  name_sr: string;
};

export default async function DashboardPage() {
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
  const today = new Date().toDateString();

  const catCounts = new Map<string, number>();
  for (const b of businesses) {
    for (const bc of b.business_categories ?? []) {
      const c = one(bc.categories) as NamedRow | null;
      if (!c) continue;
      const label = localizedName(c, locale);
      catCounts.set(label, (catCounts.get(label) ?? 0) + 1);
    }
  }

  const cityName = (b: Row) => {
    const c = one(b.cities) as NamedRow | null;
    return c ? localizedName(c, locale) : "";
  };

  const dashboard: DashboardData = {
    earnings: (ledger ?? []).reduce((sum, r) => sum + Number(r.amount), 0),
    totalCount: businesses.length,
    todayCount: businesses.filter(
      (b) => new Date(b.created_at).toDateString() === today,
    ).length,
    corrections: businesses
      .filter((b) => b.status === "rejected")
      .map((b) => ({
        id: b.id,
        name: b.name,
        note: b.review_note || cityName(b),
      })),
    categories: [...catCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6),
    recent: businesses.slice(0, 5).map((b) => ({
      id: b.id,
      name: b.name,
      city: cityName(b),
      status: b.status,
    })),
  };

  return <DashboardView data={dashboard} />;
}
