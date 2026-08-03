import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Globe,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Phone,
  Store,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import {
  localizedName,
  one,
  type Business,
  type Category,
  type City,
  type OpeningHours,
} from "@/lib/types";
import { FFCover, VerifiedBadge } from "@/components/ff/business-card";
import { FavButton } from "@/components/ff/fav-button";
import { FFStar, FFStars } from "@/components/ff/star";
import { EXPORT_CODES } from "@/lib/export-countries";
import { FacebookIcon, InstagramIcon } from "@/components/ff/social-icons";
import { cn } from "@/components/ui";
import { ClaimForm } from "./claim-form";
import { ReviewForm } from "./review-form";

type Props = { params: Promise<{ slug: string }> };

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  photo_url: string | null;
  active: boolean;
};

type ReviewRow = {
  id: string;
  rating: number;
  body: string | null;
  created_at: string;
  user_id: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
};

type BizDetail = Business & {
  cities: City | City[] | null;
  business_categories: { categories: Category | Category[] | null }[] | null;
  business_photos: { id: string; url: string; sort: number }[] | null;
  products: Product[] | null;
  reviews: { rating: number }[] | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getBusiness(slug: string): Promise<BizDetail | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const select =
    "*, cities(*), business_categories(categories(*)), business_photos(*), products(*), reviews(rating)";
  const { data } = await supabase
    .from("businesses")
    .select(select)
    .eq("slug", slug)
    .maybeSingle();
  if (data) return data as BizDetail;
  if (UUID_RE.test(slug)) {
    const { data: byId } = await supabase
      .from("businesses")
      .select(select)
      .eq("id", slug)
      .maybeSingle();
    return (byId as BizDetail) ?? null;
  }
  return null;
}

/** wa.me verlangt die Nummer ohne +, Leer- und Sonderzeichen */
function digits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const biz = await getBusiness(slug);
  if (!biz) return {};
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const city = one(biz.cities);
  return {
    title: t("metaBiz", {
      name: biz.name,
      city: city ? localizedName(city, locale) : "Kosovë",
    }),
    description: biz.description?.slice(0, 160) ?? undefined,
  };
}

export default async function FFBizPage({ params }: Props) {
  const { slug } = await params;
  const biz = await getBusiness(slug);
  if (!biz) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");
  const tf = await getTranslations("form");

  const city = one(biz.cities);
  const categories = (biz.business_categories ?? [])
    .map((bc) => one(bc.categories))
    .filter((c): c is Category => Boolean(c));
  const ratings = biz.reviews?.map((r) => r.rating) ?? [];
  const rating = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null;
  const photos = [...(biz.business_photos ?? [])].sort(
    (a, b) => a.sort - b.sort,
  );
  const products = (biz.products ?? []).filter((p) => p.active);
  const hours = (biz.opening_hours ?? null) as OpeningHours | null;
  const hasHours = Boolean(
    hours &&
      (hours.weekdays !== undefined ||
        hours.mon !== undefined ||
        hours.saturday !== undefined ||
        hours.sunday !== undefined),
  );
  const verified = biz.owner_id !== null;

  const meta = [
    categories.map((c) => localizedName(c, locale)).join(", ") || null,
    city ? localizedName(city, locale) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Öffnungszeiten: gruppiert (Mo–Fr) oder Einzeltage, je nachdem was gespeichert ist
  type HourRow = { open: string; close: string } | null | undefined;
  const hourDisplayRows: [string, HourRow][] = (
    hours && ["mon", "tue", "wed", "thu", "fri"].some((k) => (hours as Record<string, HourRow>)[k] !== undefined)
      ? ([
          [tf("dayMon"), hours?.mon],
          [tf("dayTue"), hours?.tue],
          [tf("dayWed"), hours?.wed],
          [tf("dayThu"), hours?.thu],
          [tf("dayFri"), hours?.fri],
          [tf("hoursSaturday"), hours?.saturday],
          [tf("hoursSunday"), hours?.sunday],
        ] as [string, HourRow][])
      : ([
          [tf("hoursWeekdays"), hours?.weekdays],
          [tf("hoursSaturday"), hours?.saturday],
          [tf("hoursSunday"), hours?.sunday],
        ] as [string, HourRow][])
  ).filter(([, row]) => row !== undefined);

  // Export-Länder: bekannte Codes übersetzen, freie Einträge unverändert zeigen
  const tco = await getTranslations("countries");
  const exportLabels = (
    (biz as { export_countries?: string[] | null }).export_countries ?? []
  ).map((c) => (EXPORT_CODES.includes(c) ? tco(c.toLowerCase()) : c));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Favoriten-Status des Besuchers
  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("business_id")
      .eq("business_id", biz.id)
      .eq("user_id", user.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  // Bewertungen: RLS zeigt sichtbare + die eigene; Verfassername nur wenn
  // das Profil per RLS lesbar ist (sonst anonym)
  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, rating, body, created_at, user_id, profiles(full_name)")
    .eq("business_id", biz.id)
    .order("created_at", { ascending: false });
  const reviewList = (reviewRows ?? []) as ReviewRow[];
  const ownReview = user
    ? (reviewList.find((r) => r.user_id === user.id) ?? null)
    : null;
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  // Inhaberschafts-Antrag: nur ohne Inhaber; Status des Besuchers serverseitig prüfen
  let claim: "hidden" | "login" | "form" | "exists" = "hidden";
  if (!verified) {
    claim = "login";
    if (user) {
      const { data: existing } = await supabase
        .from("business_claims")
        .select("id")
        .eq("business_id", biz.id)
        .eq("user_id", user.id)
        .maybeSingle();
      claim = existing ? "exists" : "form";
    }
  }

  const btn =
    "flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-bold";

  return (
      <main className="flex flex-1 flex-col bg-surface pb-6">
        {/* Cover mit Zurück-Pfeil */}
        <div className="relative">
          <FFCover
            src={biz.cover_url ?? biz.logo_url}
            alt={biz.name}
            className="h-48 w-full lg:h-64"
          />
          <Link
            href={city ? `/app/${city.slug}` : "/app"}
            aria-label={t("backHome")}
            className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-ink shadow-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <FavButton
            businessId={biz.id}
            initialSaved={isFavorite}
            signedIn={Boolean(user)}
          />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pt-4">
          {/* Hinweis: noch in Prüfung (sieht nur, wer den Eintrag sehen darf) */}
          {biz.status !== "approved" && (
            <p className="rounded-[14px] bg-[#FBF0D6] p-3.5 text-sm font-semibold text-[#6B4C07]">
              {t("pendingNote")}
            </p>
          )}

          {/* Inhaber-Aktionen: Bearbeiten + Produkte direkt vom Profil aus */}
          {user && biz.owner_id === user.id && (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/app/biznesi/${biz.id}/edit`}
                className="flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line-strong bg-white text-[14px] font-bold text-ink hover:bg-surface"
              >
                <Pencil className="h-4 w-4 text-ff-primary" />
                {t("manageEdit")}
              </Link>
              <Link
                href={`/app/biznesi/${biz.id}/produkte`}
                className="flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-line-strong bg-white text-[14px] font-bold text-ink hover:bg-surface"
              >
                <Package className="h-4 w-4 text-ff-primary" />
                {t("manageProducts")}
              </Link>
            </div>
          )}

          {/* Kopf */}
          <section className="flex flex-col gap-2 rounded-[18px] border border-line bg-white p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
                {biz.name}
              </h1>
              {verified && <VerifiedBadge />}
            </div>
            {meta && <div className="text-[14.5px] text-muted">{meta}</div>}
            {rating !== null && (
              <div className="flex items-center gap-1.5 text-[14.5px] font-bold text-ink-2">
                <FFStar className="h-4 w-4" />
                {rating.toFixed(1)}
                <span className="font-medium text-muted">
                  · {ratings.length}
                </span>
              </div>
            )}

            {/* Kontakt-Buttons */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className={cn(btn, "bg-ff-primary text-white")}
                >
                  <Phone className="h-[18px] w-[18px]" />
                  {t("call")}
                </a>
              )}
              {biz.whatsapp && (
                <a
                  href={`https://wa.me/${digits(biz.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btn, "bg-[#25D366] text-white")}
                >
                  <MessageCircle className="h-[18px] w-[18px]" />
                  WhatsApp
                </a>
              )}
              {biz.viber && (
                <a
                  href={`viber://chat?number=${digits(biz.viber)}`}
                  className={cn(btn, "bg-[#7360F2] text-white")}
                >
                  <Phone className="h-[18px] w-[18px]" />
                  Viber
                </a>
              )}
              {biz.website && (
                <a
                  href={biz.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    btn,
                    "border-[1.5px] border-line-strong bg-white text-ink",
                  )}
                >
                  <Globe className="h-[18px] w-[18px]" />
                  {tf("website")}
                </a>
              )}
              {biz.facebook && (
                <a
                  href={biz.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btn, "bg-[#1877F2] text-white")}
                >
                  <FacebookIcon className="h-[18px] w-[18px]" />
                  Facebook
                </a>
              )}
              {biz.instagram && (
                <a
                  href={biz.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    btn,
                    "border-[1.5px] border-line-strong bg-white text-ink",
                  )}
                >
                  <InstagramIcon className="h-[18px] w-[18px]" />
                  Instagram
                </a>
              )}
            </div>
          </section>

          {/* Fotos */}
          {photos.length > 0 && (
            <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element -- Supabase-Storage-URLs ohne Image-Loader-Konfiguration
                <img
                  key={p.id}
                  src={p.url}
                  alt={biz.name}
                  className="h-28 w-40 flex-none rounded-[14px] border border-line object-cover"
                />
              ))}
            </div>
          )}

          {/* Beschreibung */}
          {biz.description && (
            <section className="flex flex-col gap-2 rounded-[18px] border border-line bg-white p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                {t("about")}
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">
                {biz.description}
              </p>
            </section>
          )}

          {/* B2B: bedient auch diese Länder */}
          {exportLabels.length > 0 && (
            <section className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                <Globe className="h-4 w-4 text-ff-primary" />
                {t("exportsTo")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {exportLabels.map((label) => (
                  <span
                    key={label}
                    className="flex h-9 items-center rounded-full bg-ff-mint px-3.5 text-[13.5px] font-bold text-ff-primary-dark"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Adresse + Karte */}
          {(biz.address || (biz.lat && biz.lng)) && (
            <section className="flex flex-col gap-2 rounded-[18px] border border-line bg-white p-5">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                {tf("address")}
              </h2>
              <div className="flex items-start gap-2.5 text-[15px] text-ink-2">
                <MapPin className="mt-0.5 h-[18px] w-[18px] flex-none text-ff-primary" />
                <span>
                  {[biz.address, city ? localizedName(city, locale) : null]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
              {biz.lat && biz.lng && (
                <a
                  href={`https://maps.google.com/?q=${biz.lat},${biz.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start text-[14px] font-bold text-ff-primary"
                >
                  {t("map")} →
                </a>
              )}
            </section>
          )}

          {/* Öffnungszeiten */}
          {hasHours && hours && (
            <section className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                <Clock className="h-4 w-4" />
                {t("hours")}
              </h2>
              <div className="flex flex-col gap-1.5">
                {hourDisplayRows.map(([label, row]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between text-[14.5px]"
                  >
                    <span className="text-muted">{label}</span>
                    <span className="font-bold text-ink">
                      {row ? `${row.open}–${row.close}` : tf("closed")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Produkte */}
          {products.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                {t("products")}
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="overflow-hidden rounded-[18px] border border-line bg-white"
                  >
                    <FFCover src={p.photo_url} alt={p.name} className="h-24 w-full" />
                    <div className="flex flex-col gap-1 p-3">
                      <div className="truncate text-[15px] font-bold text-ink">
                        {p.name}
                      </div>
                      {p.price !== null && (
                        <div className="text-[14px] font-extrabold text-ff-primary">
                          {Number(p.price).toFixed(2).replace(".", ",")}{" "}
                          {p.currency === "EUR" ? "€" : p.currency}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Inhaberschafts-Antrag */}
          {claim !== "hidden" && (
            <section className="flex flex-col gap-3 rounded-[18px] border border-line bg-white p-5">
              <h2 className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-0.015em] text-ink">
                <Store className="h-5 w-5 text-ff-primary" />
                {t("claimCta")}
              </h2>
              {claim === "login" && (
                <>
                  <p className="text-[13.5px] leading-relaxed text-muted">
                    {t("claimIntro")}
                  </p>
                  <Link
                    href="/app/login"
                    className="flex h-12 items-center justify-center rounded-full bg-ff-primary text-[15px] font-extrabold text-white"
                  >
                    {t("claimLoginCta")}
                  </Link>
                </>
              )}
              {claim === "exists" && (
                <p className="rounded-[14px] bg-ff-mint-light p-4 text-[14px] font-semibold text-ff-primary-dark">
                  {t("claimExists")}
                </p>
              )}
              {claim === "form" && <ClaimForm businessId={biz.id} />}
            </section>
          )}

          {/* Bewertungen: Liste + Formular (eingeloggt) bzw. Login-Hinweis */}
          <section className="flex flex-col gap-4 rounded-[18px] border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
              <FFStar className="h-4 w-4" />
              {t("reviewsTitle")}
            </h2>

            {reviewList.length === 0 ? (
              <p className="text-[14.5px] text-muted">{t("reviewEmpty")}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {reviewList.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-col gap-1.5 border-b border-divider pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="text-[14.5px] font-extrabold text-ink">
                        {one(r.profiles)?.full_name || t("reviewAnon")}
                      </span>
                      <span
                        className="flex items-center gap-0.5"
                        aria-label={t("reviewStars", { n: r.rating })}
                      >
                        <FFStars value={r.rating} starClassName="h-[15px] w-[15px]" />
                      </span>
                      <span className="text-[12.5px] text-faint">
                        {dateFmt.format(new Date(r.created_at))}
                      </span>
                    </div>
                    {r.body && (
                      <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-ink-2">
                        {r.body}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {user ? (
              <ReviewForm
                businessId={biz.id}
                initialRating={ownReview?.rating ?? null}
                initialBody={ownReview?.body ?? ""}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[13.5px] leading-relaxed text-muted">
                  {t("reviewLogin")}
                </p>
                <Link
                  href="/app/login"
                  className="flex h-12 items-center justify-center rounded-full bg-ff-primary text-[15px] font-extrabold text-white"
                >
                  {t("claimLoginCta")}
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
  );
}
