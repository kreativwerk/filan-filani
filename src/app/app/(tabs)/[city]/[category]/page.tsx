import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { localizedName } from "@/lib/types";
import {
  ALL_CITIES,
  getCategories,
  getCities,
  toFFBiz,
  type FFBizRow,
} from "@/lib/ff-data";
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
  const city =
    citySlug === ALL_CITIES ? null : cities.find((c) => c.slug === citySlug);
  const category = categories.find((c) => c.slug === catSlug);
  if ((citySlug !== ALL_CITIES && !city) || !category) return {};
  const cityName = city ? localizedName(city, locale) : t("allKosovo");
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
  const isAll = citySlug === ALL_CITIES;
  const city = isAll ? null : cities.find((c) => c.slug === citySlug);
  const category = categories.find((c) => c.slug === catSlug);
  if ((!isAll && !city) || !category) notFound();

  const supabase = await createClient();
  const base = () =>
    supabase
      .from("businesses")
      .select(
        "*, cities(*), business_categories!inner(category_id), reviews(rating)",
        { count: "exact" },
      )
      .eq("status", "approved")
      .eq("business_categories.category_id", category.id)
      .order("completeness", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60);

  // Kategorie: eigene Stadt zuerst, danach dieselbe Kategorie im Rest des Landes
  const [
    { data: rows, count },
    { data: otherRows, count: otherCount },
  ] = await Promise.all([
    city ? base().eq("city_id", city.id) : base(),
    city
      ? base().neq("city_id", city.id)
      : Promise.resolve({ data: null, count: null }),
  ]);

  const items = ((rows ?? []) as FFBizRow[]).map((row) =>
    toFFBiz(row, locale, { city, category }),
  );
  const secondaryItems = ((otherRows ?? []) as FFBizRow[]).map((row) =>
    toFFBiz(row, locale, { category }),
  );

  const pills: FFPill[] = [
    { href: `/app/${citySlug}`, label: t("all"), active: false },
    ...categories.map((c) => ({
      href: `/app/${citySlug}/${c.slug}`,
      label: localizedName(c, locale),
      active: c.id === category.id,
    })),
  ];

  return (
    <FFListingView
      eyebrow={city ? localizedName(city, locale) : t("allKosovo")}
      title={localizedName(category, locale)}
      count={count ?? items.length}
      pills={pills}
      items={items}
      secondaryLabel={`${t("otherCities")}${otherCount ? ` · ${otherCount}` : ""}`}
      secondaryItems={secondaryItems}
    />
  );
}
