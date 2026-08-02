import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import {
  ALL_CITIES,
  cityOption,
  getCategories,
  getCities,
  getCookieCitySlug,
  toFFBiz,
  toFFCat,
  type FFBizRow,
} from "@/lib/ff-data";
import { FFHomeView, type FFHomeData } from "@/components/ff/home-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: t("metaHome"), description: t("metaHomeDesc") };
}

export default async function FFAppHome() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
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

    const isAll = citySlug === ALL_CITIES || !cities.some((c) => c.slug === citySlug);
    const city = isAll ? null : cities.find((c) => c.slug === citySlug)!;

    data.signedIn = Boolean(user);
    data.cities = [
      { slug: ALL_CITIES, label: t("allKosovo") },
      ...cities.map((c) => cityOption(c, locale)),
    ];
    data.categories = categories.map((c) => toFFCat(c, locale));
    data.city = city
      ? cityOption(city, locale)
      : { slug: ALL_CITIES, label: t("allKosovo") };

    const [profileRes, bizRes] = await Promise.all([
      user
        ? supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      (() => {
        // "Ganz Kosovo": neueste Betriebe landesweit; sonst die der gewählten Stadt
        let q = supabase
          .from("businesses")
          .select(
            "*, cities(*), business_categories(categories(*)), reviews(rating)",
          )
          .eq("status", "approved");
        if (city) q = q.eq("city_id", city.id);
        return q.order("created_at", { ascending: false }).limit(12);
      })(),
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

  return <FFHomeView data={data} />;
}
