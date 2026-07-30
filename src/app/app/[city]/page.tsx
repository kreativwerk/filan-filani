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

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const city = (await getCities()).find((c) => c.slug === citySlug);
  if (!city) return {};
  const name = localizedName(city, locale);
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
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("businesses")
    .select("*, business_categories(categories(*)), reviews(rating)")
    .eq("status", "approved")
    .eq("city_id", city.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const items = ((rows ?? []) as FFBizRow[]).map((row) =>
    toFFBiz(row, locale, { city }),
  );

  const pills: FFPill[] = [
    { href: `/app/${city.slug}`, label: t("all"), active: true },
    ...categories.map((c) => ({
      href: `/app/${city.slug}/${c.slug}`,
      label: localizedName(c, locale),
      active: false,
    })),
  ];

  return (
    <FFShell citySlug={city.slug}>
      <FFListingView
        eyebrow={localizedName(city, locale)}
        title={t("inYourCity")}
        count={items.length}
        pills={pills}
        items={items}
      />
    </FFShell>
  );
}
