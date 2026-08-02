// Server-Helfer für die Filan-Filani-App: Stammdaten laden (pro Request
// dedupliziert via React cache) und Supabase-Zeilen auf die UI-Typen mappen.
import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import {
  localizedName,
  one,
  type Business,
  type Category,
  type City,
} from "@/lib/types";
import type { FFBiz } from "@/components/ff/business-card";
import type { FFCat } from "@/components/ff/home-view";
import type { FFCityOption } from "@/components/ff/city-pill";

export const CITY_COOKIE = "ff_city";
/** Sonder-Slug: keine Stadt-Bevorzugung, ganz Kosovo */
export const ALL_CITIES = "all";
export const DEFAULT_CITY = ALL_CITIES;

/** Betriebszeile inkl. der eingebetteten Relationen der Listen-Queries */
export type FFBizRow = Business & {
  cities?: City | City[] | null;
  business_categories?:
    | { categories: Category | Category[] | null }[]
    | null;
  reviews?: { rating: number }[] | null;
};

export const getCities = cache(async (): Promise<City[]> => {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("*").order("id");
  return data ?? [];
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort");
  return data ?? [];
});

/** Gewählte Stadt aus dem Cookie (Standard: Prishtina) */
export async function getCookieCitySlug(): Promise<string> {
  const store = await cookies();
  return store.get(CITY_COOKIE)?.value ?? DEFAULT_CITY;
}

export function cityOption(city: City, locale: Locale): FFCityOption {
  return { slug: city.slug, label: localizedName(city, locale) };
}

export function toFFCat(cat: Category, locale: Locale): FFCat {
  return { slug: cat.slug, label: localizedName(cat, locale), icon: cat.icon };
}

/** Betriebszeile → Kartendaten (Kategorie·Stadt, Bewertung, Verifiziert-Badge) */
export function toFFBiz(
  row: FFBizRow,
  locale: Locale,
  fallback?: { city?: City | null; category?: Category | null },
): FFBiz {
  const city = one(row.cities) ?? fallback?.city ?? null;
  const category =
    row.business_categories?.map((bc) => one(bc.categories)).find(Boolean) ??
    fallback?.category ??
    null;
  const ratings = row.reviews?.map((r) => r.rating) ?? [];
  const rating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null;

  const meta = [
    category ? localizedName(category, locale) : null,
    city ? localizedName(city, locale) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    key: row.id,
    href: `/app/biz/${row.slug ?? row.id}`,
    name: row.name,
    meta,
    cover: row.cover_url ?? row.logo_url,
    verified: row.owner_id !== null,
    rating,
    ratingCount: ratings.length,
  };
}
