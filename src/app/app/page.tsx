import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import {
  cityOption,
  DEFAULT_CITY,
  getCategories,
  getCities,
  getCookieCitySlug,
  toFFBiz,
  toFFCat,
  type FFBizRow,
} from "@/lib/ff-data";
import { FFShell } from "@/components/ff/shell";
import { FFHomeView, type FFHomeData } from "@/components/ff/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: t("metaHome"), description: t("metaHomeDesc") };
}

export default async function FFAppHome() {
  const locale = (await getLocale()) as Locale;
  const citySlug = await getCookieCitySlug();

  const data: FFHomeData = {
    signedIn: false,
    userName: null,
    city: { slug: citySlug, label: citySlug },
    cities: [],
    categories: [],
    businesses: [],
  };

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const [
      {
        data: { user },
      },
      cities,
      categories,
    ] = await Promise.all([
      supabase.auth.getUser(),
      getCities(),
      getCategories(),
    ]);

    const city =
      cities.find((c) => c.slug === citySlug) ??
      cities.find((c) => c.slug === DEFAULT_CITY) ??
      cities[0] ??
      null;

    data.signedIn = Boolean(user);
    data.cities = cities.map((c) => cityOption(c, locale));
    data.categories = categories.map((c) => toFFCat(c, locale));
    if (city) data.city = cityOption(city, locale);

    const [profileRes, bizRes] = await Promise.all([
      user
        ? supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      city
        ? supabase
            .from("businesses")
            .select(
              "*, business_categories(categories(*)), reviews(rating)",
            )
            .eq("status", "approved")
            .eq("city_id", city.id)
            .order("created_at", { ascending: false })
            .limit(12)
        : Promise.resolve({ data: null }),
    ]);

    if (user) {
      data.userName =
        profileRes.data?.full_name?.trim() ||
        user.email?.split("@")[0] ||
        null;
    }
    data.businesses = ((bizRes.data ?? []) as FFBizRow[]).map((row) =>
      toFFBiz(row, locale, { city }),
    );
  }

  return (
    <FFShell citySlug={data.city.slug}>
      <FFHomeView data={data} />
    </FFShell>
  );
}
