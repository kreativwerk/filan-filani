import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { localizedName } from "@/lib/types";
import {
  getCategories,
  getCities,
  toFFBiz,
  type FFBizRow,
} from "@/lib/ff-data";
import { FFShell } from "@/components/ff/shell";
import { FFListingView, type FFPill } from "@/components/ff/listing-view";

type Props = { params: Promise<{ city: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug, category: catSlug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const [cities, categories] = await Promise.all([
    getCities(),
    getCategories(),
  ]);
  const city = cities.find((c) => c.slug === citySlug);
  const category = categories.find((c) => c.slug === catSlug);
  if (!city || !category) return {};
  const cityName = localizedName(city, locale);
  const catName = localizedName(category, locale);
  return {
    title: t("metaCategoryCity", { category: catName, city: cityName }),
    description: t("metaCategoryCityDesc", {
      category: catName,
      city: cityName,
    }),
  };
}

export default async function FFCategoryPage({ params }: Props) {
  const { city: citySlug, category: catSlug } = await params;
  if (!hasSupabaseEnv()) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const [cities, categories] = await Promise.all([
    getCities(),
    getCategories(),
  ]);
  const city = cities.find((c) => c.slug === citySlug);
  const category = categories.find((c) => c.slug === catSlug);
  if (!city || !category) notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("businesses")
    .select("*, business_categories!inner(category_id), reviews(rating)")
    .eq("status", "approved")
    .eq("city_id", city.id)
    .eq("business_categories.category_id", category.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const items = ((rows ?? []) as FFBizRow[]).map((row) =>
    toFFBiz(row, locale, { city, category }),
  );

  const pills: FFPill[] = [
    { href: `/app/${city.slug}`, label: t("all"), active: false },
    ...categories.map((c) => ({
      href: `/app/${city.slug}/${c.slug}`,
      label: localizedName(c, locale),
      active: c.id === category.id,
    })),
  ];

  return (
    <FFShell citySlug={city.slug}>
      <FFListingView
        eyebrow={localizedName(city, locale)}
        title={localizedName(category, locale)}
        count={items.length}
        pills={pills}
        items={items}
      />
    </FFShell>
  );
}
