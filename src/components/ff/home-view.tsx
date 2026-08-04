/* Home-Ansicht (Design 1a „Vier Tabs, flach"): Header mit Avatar+Begrüßung,
   Stadt-Pill und Glocke, Suchfeld, Kategorien-Reihe, „Në qytetin tënd",
   Petrol-Banner. Rein präsentational — Preview und echte Seite teilen die UI. */

import Link from "next/link";
import { Bell, ChevronRight, Globe, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui";
import { categoryIcon } from "./icons";
import { CityPill, type FFCityOption } from "./city-pill";
import { FFBusinessCard, type FFBiz } from "./business-card";

export type FFCat = {
  slug: string;
  label: string;
  icon: string | null;
  isTrade?: boolean;
};

export type FFHomeData = {
  signedIn: boolean;
  userName: string | null;
  city: FFCityOption;
  cities: FFCityOption[];
  categories: FFCat[];
  businesses: FFBiz[];
};

export function FFHomeView({ data }: { data: FFHomeData }) {
  const t = useTranslations("ff");
  const cityHref = `/app/${data.city.slug}`;
  const initial = data.userName?.trim().charAt(0).toUpperCase() ?? null;
  const trades = data.categories.filter((c) => c.isTrade);

  return (
    <>
      {/* Header + Suche (mobil) */}
      <header className="flex flex-col gap-3 bg-white px-4 pb-3 pt-2 lg:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={data.signedIn ? "/app/profili" : "/app/login"}
            aria-label={data.signedIn ? t("profileTitle") : t("claimLoginCta")}
            className={cn(
              "grid h-11 w-11 flex-none place-items-center rounded-full",
              data.signedIn
                ? "bg-ff-primary text-[17px] font-extrabold text-white"
                : "bg-ff-mint text-ff-primary-dark",
            )}
          >
            {data.signedIn && initial ? (
              initial
            ) : (
              <User className="h-[22px] w-[22px]" />
            )}
          </Link>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[13.5px] font-medium text-muted">
              {t("greeting")}
            </div>
            <div className="truncate text-[18px] font-extrabold tracking-[-0.015em] text-ink">
              {data.userName ?? t("guest")}
            </div>
          </div>
          <CityPill current={data.city} cities={data.cities} />
          {/* Glocke ohne falschen Ungelesen-Punkt — aktiv, sobald Benachrichtigungen existieren */}
          <div className="relative grid h-11 w-11 flex-none place-items-center text-ink">
            <Bell className="h-[23px] w-[23px]" />
          </div>
        </div>
        <Link
          href="/app/kerko"
          className="flex h-12 items-center gap-2.5 rounded-[14px] border-[1.5px] border-line bg-surface px-3.5 text-[16px] text-muted"
        >
          <Search className="h-5 w-5" />
          {t("searchPlaceholder")}
        </Link>
      </header>

      <main className="flex flex-1 flex-col gap-[18px] bg-surface py-3.5 lg:gap-6 lg:p-8">
        {/* Kopfzeile (Desktop) */}
        <div className="hidden items-end justify-between gap-4 lg:flex">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              {data.city.label}
            </div>
            <h1 className="mt-1.5 text-[34px] font-extrabold tracking-[-0.03em] text-ink">
              {t("inYourCity")}
            </h1>
          </div>
          <CityPill current={data.city} cities={data.cities} />
        </div>

        {/* Kategorien */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between px-4 lg:px-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              {t("categories")}
            </div>
            <Link
              href={cityHref}
              className="text-[13.5px] font-bold text-ff-primary"
            >
              {t("all")}
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 lg:px-0">
            {data.categories.map((c) => {
              const Icon = categoryIcon(c.icon);
              return (
                <Link
                  key={c.slug}
                  href={`${cityHref}/${c.slug}`}
                  className="flex w-[74px] flex-none flex-col items-center gap-[7px]"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-[18px] bg-ff-mint text-ff-primary-dark">
                    <Icon className="h-[27px] w-[27px]" />
                  </span>
                  <span className="line-clamp-2 w-full text-center text-[12px] font-semibold leading-tight text-ink-2">
                    {c.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Betriebe in der Stadt */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-4 lg:hidden">
            <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
              {t("inYourCity")}
            </h2>
            <Link
              href={cityHref}
              className="text-[13.5px] font-bold text-ff-primary"
            >
              {t("seeAll")}
            </Link>
          </div>
          {data.businesses.length === 0 ? (
            <p className="mx-4 rounded-[18px] border border-line bg-white p-5 text-[15px] text-muted lg:mx-0">
              {t("noBusinesses")}
            </p>
          ) : (
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0">
              {data.businesses.map((b) => (
                <FFBusinessCard
                  key={b.key}
                  biz={b}
                  className="w-[250px] flex-none lg:w-auto"
                />
              ))}
            </div>
          )}
        </section>

        {/* Petrol-Banner „Zejtarët" */}
        <section className="px-4 lg:px-0">
          <div className="flex flex-col gap-3 rounded-[20px] bg-ff-primary p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ff-teal-soft">
              {t("bannerLabel")}
            </div>
            <div className="max-w-[24ch] text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-white">
              {t("bannerTitle")}
            </div>
            <p className="max-w-[38ch] text-[13.5px] leading-relaxed text-ff-teal-soft">
              {t("bannerSub")}
            </p>
            {/* Gewerke auf einen Blick */}
            <div className="flex flex-wrap gap-1.5">
              {trades.slice(0, 5).map((c) => (
                <span
                  key={c.slug}
                  className="flex h-7 items-center rounded-full bg-white/12 px-2.5 text-[12px] font-bold text-white"
                >
                  {c.label}
                </span>
              ))}
            </div>
            <Link
              href="/app/kerko-oferte"
              className="flex h-12 items-center self-start rounded-full bg-ff-accent px-5 text-[16px] font-extrabold text-white"
            >
              {t("bannerCta")}
            </Link>
          </div>
        </section>

        {/* Dezenter B2B-Hinweis unter dem Zejtarët-Banner */}
        <section className="px-4 lg:px-0">
          <Link
            href="/app/b2b"
            className="flex items-center gap-3 rounded-[20px] border border-line bg-white p-4 hover:bg-ff-mint-light"
          >
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ff-mint text-ff-primary">
              <Globe className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1 text-[14.5px] font-bold leading-snug text-ink">
              {t("b2bHome")}
            </span>
            <ChevronRight className="h-5 w-5 flex-none text-muted" />
          </Link>
        </section>
      </main>
    </>
  );
}
