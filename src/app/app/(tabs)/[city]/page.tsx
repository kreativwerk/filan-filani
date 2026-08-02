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

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const city =
    citySlug === ALL_CITIES
      ? null
      : (await getCities()).find((c) => c.slug === citySlug);
  if (citySlug !== ALL_CITIES && !city) return {};
  const name = city ? localizedName(city, locale) : t("allKosovo");
  return {
    title: t("metaCity", { city: name }),
    description: t("metaCityDesc", { city: name }),
  };
}

export default async function FFCityPage({ params }: Props) {
  const { city: citySlug } = await params;
  if (!hasSupabaseEnv()) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const [cities, categories] = await Promise.all([
    getCities(),
    getCategories(),
  ]);
  const isAll = citySlug === ALL_CITIES;
  const city = isAll ? null : cities.find((c) => c.slug === citySlug);
  if (!isAll && !city) notFound();

  const supabase = await createClient();
  const base = () =>
    supabase
      .from("businesses")
      .select(
        "*, cities(*), business_categories(categories(*)), reviews(rating)",
        { count: "exact" },
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

  // Gewählte Stadt zuerst — danach der Rest des Landes
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
    toFFBiz(row, locale, { city }),
  );
  const secondaryItems = ((otherRows ?? []) as FFBizRow[]).map((row) =>
    toFFBiz(row, locale),
  );

  const pills: FFPill[] = [
    { href: `/app/${citySlug}`, label: t("all"), active: true },
    ...categories.map((c) => ({
      href: `/app/${citySlug}/${c.slug}`,
      label: localizedName(c, locale),
      active: false,
    })),
  ];

  return (
    <FFListingView
      eyebrow={city ? localizedName(city, locale) : t("allKosovo")}
      title={t("inYourCity")}
      count={count ?? items.length}
      pills={pills}
      items={items}
      secondaryLabel={`${t("otherCities")}${otherCount ? ` · ${otherCount}` : ""}`}
      secondaryItems={secondaryItems}
    />
  );
}
