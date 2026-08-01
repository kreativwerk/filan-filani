import type { Metadata } from "next";
import { Search } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { localizedName, one, type Category } from "@/lib/types";
import {
  getCategories,
  getCities,
  getCookieCitySlug,
  toFFBiz,
  type FFBizRow,
} from "@/lib/ff-data";
import { FFShell } from "@/components/ff/shell";
import { FFListingView } from "@/components/ff/listing-view";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    city?: string | string[];
    category?: string | string[];
  }>;
};

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("searchTitle")} | Filan Filani` };
}

export default async function FFSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const citySlug = first(sp.city);
  const catSlug = first(sp.category);

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");

  const [cities, categories] = await Promise.all([
    getCities(),
    getCategories(),
  ]);
  const city = cities.find((c) => c.slug === citySlug) ?? null;
  const category = categories.find((c) => c.slug === catSlug) ?? null;
  const hasQuery = Boolean(q || city || category);

  let items: ReturnType<typeof toFFBiz>[] = [];
  if (hasSupabaseEnv() && hasQuery) {
    const supabase = await createClient();
    const { data: rows } = await supabase.rpc("search_businesses", {
      q,
      p_city: city?.id ?? null,
      p_category: category?.id ?? null,
    });

    const list = (rows ?? []) as FFBizRow[];
    // Die RPC liefert nackte businesses-Zeilen — Kategorie je Betrieb nachladen
    const catByBiz = new Map<string, Category>();
    if (list.length) {
      const { data: bcs } = await supabase
        .from("business_categories")
        .select("business_id, categories(*)")
        .in(
          "business_id",
          list.map((b) => b.id),
        );
      for (const bc of bcs ?? []) {
        const cat = one(bc.categories as Category | Category[] | null);
        if (cat && !catByBiz.has(bc.business_id)) {
          catByBiz.set(bc.business_id, cat);
        }
      }
    }
    const cityById = new Map(cities.map((c) => [c.id, c]));
    items = list.map((row) =>
      toFFBiz(row, locale, {
        city: cityById.get(row.city_id) ?? null,
        category: catByBiz.get(row.id) ?? null,
      }),
    );
  }

  const defaultCity = citySlug || (await getCookieCitySlug());

  return (
    <FFShell citySlug={defaultCity}>
      <FFListingView
        eyebrow="Filan Filani"
        title={t("searchTitle")}
        count={hasQuery ? items.length : undefined}
        items={items}
        emptyLabel={t("noResults")}
      >
        <form
          method="GET"
          action="/app/kerko"
          className="flex flex-col gap-2.5 px-4 lg:max-w-2xl lg:px-0"
        >
          <div className="flex h-12 items-center gap-2.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5">
            <Search className="h-5 w-5 flex-none text-muted" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t("searchPlaceholder")}
              className="h-full w-full bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select
              name="city"
              defaultValue={citySlug}
              aria-label={t("searchCity")}
              className="h-11 w-full rounded-[14px] border-[1.5px] border-line bg-white px-3 text-[14.5px] font-semibold text-ink-2 focus:border-ff-primary focus:outline-none"
            >
              <option value="">{t("searchAllCities")}</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {localizedName(c, locale)}
                </option>
              ))}
            </select>
            <select
              name="category"
              defaultValue={catSlug}
              aria-label={t("searchCategory")}
              className="h-11 w-full rounded-[14px] border-[1.5px] border-line bg-white px-3 text-[14.5px] font-semibold text-ink-2 focus:border-ff-primary focus:outline-none"
            >
              <option value="">{t("searchAllCategories")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {localizedName(c, locale)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-ff-primary text-[16px] font-extrabold text-white hover:opacity-90"
          >
            {t("searchSubmit")}
          </button>
        </form>
      </FFListingView>
    </FFShell>
  );
}
