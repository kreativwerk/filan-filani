"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronsRight,
  AtSign,
  Globe,
  MapPin,
  Share2,
  Mail,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  localizedName,
  type Category,
  type City,
  type OpeningHours,
} from "@/lib/types";
import type { Locale } from "@/i18n/config";
import {
  Button,
  Input,
  RequiredPill,
  Select,
  Textarea,
  cn,
} from "@/components/ui";
import { EXPORT_CODES } from "@/lib/export-countries";
import { TimeWheelButton } from "@/components/time-wheel";

const MAX_PHOTOS = 6;
const TOTAL_STEPS = 3;


type HoursRow = { open: string; close: string; closed: boolean };

const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri"] as const;
type HoursKey =
  | "weekdays"
  | (typeof WEEKDAY_KEYS)[number]
  | "saturday"
  | "sunday";

const defaultHours: HoursRow = { open: "08:00", close: "18:00", closed: false };

function fromSaved(
  saved: { open: string; close: string } | null | undefined,
): HoursRow | null {
  if (saved === undefined) return null;
  if (saved === null) return { ...defaultHours, closed: true };
  return { open: saved.open, close: saved.close, closed: false };
}

function IconField({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[50px] items-center gap-3 rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 focus-within:border-primary">
      <span className="flex-none text-primary">{icon}</span>
      {children}
    </div>
  );
}

const bareInput =
  "h-full min-w-0 flex-1 border-none bg-transparent text-[16px] text-ink placeholder:text-muted focus:outline-none";

export type BusinessInitial = {
  name: string;
  categoryId: string;
  cityId: string;
  address: string;
  phone: string;
  whatsapp: string;
  viber: string;
  email: string;
  website: string;
  facebook: string;
  instagram: string;
  description: string;
  openingHours: OpeningHours | null;
  exportCountries?: string[];
  acceptsRequests?: boolean;
  requestEmail?: string;
  serviceArea?: "city" | "region" | "country";
};

export function NewBusinessForm({
  cities,
  categories,
  businessId,
  initial,
  adminMode,
  variant,
  claimOwner,
  ownerMode,
}: {
  cities: City[];
  categories: Category[];
  businessId?: string;
  initial?: BusinessInitial;
  adminMode?: boolean;
  /** "ff": Selbst-Registrierung in der Filan-Filani-App (source 'self', keine Vergütung) */
  variant?: "ff";
  /** Nutzer trägt sich direkt als Inhaber ein */
  claimOwner?: boolean;
  /** Inhaber bearbeitet eigenen Betrieb: status/review_note bleiben unangetastet */
  ownerMode?: boolean;
}) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const tco = useTranslations("countries");
  const locale = useLocale() as Locale;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    categoryId: initial?.categoryId ?? "",
    cityId: initial?.cityId ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    viber: initial?.viber ?? "",
    email: initial?.email ?? "",
    website: initial?.website ?? "",
    facebook: initial?.facebook ?? "",
    instagram: initial?.instagram ?? "",
    description: initial?.description ?? "",
  });
  const savedHours = initial?.openingHours;
  const weekdayFallback =
    fromSaved(savedHours?.weekdays) ?? { ...defaultHours };
  // Mo–Fr gruppiert, außer die gespeicherten Zeiten enthalten Einzeltage
  const [sameWeekdays, setSameWeekdays] = useState(
    !WEEKDAY_KEYS.some((k) => savedHours?.[k] !== undefined),
  );
  const [hours, setHours] = useState<Record<HoursKey, HoursRow>>({
    weekdays: { ...weekdayFallback },
    mon: fromSaved(savedHours?.mon) ?? { ...weekdayFallback },
    tue: fromSaved(savedHours?.tue) ?? { ...weekdayFallback },
    wed: fromSaved(savedHours?.wed) ?? { ...weekdayFallback },
    thu: fromSaved(savedHours?.thu) ?? { ...weekdayFallback },
    fri: fromSaved(savedHours?.fri) ?? { ...weekdayFallback },
    saturday: fromSaved(savedHours?.saturday) ?? { ...defaultHours },
    sunday: fromSaved(savedHours?.sunday) ?? { ...defaultHours, closed: true },
  });
  const [exportCountries, setExportCountries] = useState<string[]>(
    (initial?.exportCountries ?? []).filter((c) => EXPORT_CODES.includes(c)),
  );
  const [exportOther, setExportOther] = useState(
    (initial?.exportCountries ?? [])
      .filter((c) => !EXPORT_CODES.includes(c))
      .join(", "),
  );
  const [acceptsRequests, setAcceptsRequests] = useState(
    initial?.acceptsRequests ?? false,
  );
  const [requestEmail, setRequestEmail] = useState(initial?.requestEmail ?? "");
  const [serviceArea, setServiceArea] = useState<"city" | "region" | "country">(
    initial?.serviceArea ?? "city",
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<
    "denied" | "timeout" | "generic" | null
  >(null);
  const [duplicateWarned, setDuplicateWarned] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "name" || key === "phone" || key === "cityId") {
      setDuplicateWarned(false);
      setShowDuplicateWarning(false);
    }
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, MAX_PHOTOS));
  }

  function captureLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("generic");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.TIMEOUT
              ? "timeout"
              : "generic",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  // Anfragen-Frage nur dem Betrieb selbst stellen (Registrierung als Inhaber
  // oder Bearbeitung des eigenen Betriebs) — Runner können das nicht beantworten
  const showLeadBlock = Boolean(claimOwner || ownerMode);

  const filledCount = Object.values(form).filter(Boolean).length;

  const stepValid =
    step === 1
      ? Boolean(form.name && form.cityId)
      : step === 2
        ? Boolean(form.phone)
        : Boolean(form.categoryId);

  async function next() {
    setError(null);
    if (!stepValid) {
      setError(t("errorRequired"));
      return;
    }
    // Duplikate früh melden: nach Schritt 1 (Name+Stadt), nach Schritt 2 (+Telefon)
    if (!businessId && !duplicateWarned && step < TOTAL_STEPS) {
      setLoading(true);
      const { data: isDuplicate } = await createClient().rpc(
        "business_duplicate_exists",
        {
          p_name: form.name,
          p_phone: step >= 2 ? form.phone : "",
          p_city: Number(form.cityId),
        },
      );
      setLoading(false);
      if (isDuplicate) {
        setDuplicateWarned(true);
        setShowDuplicateWarning(true);
        return;
      }
    }
    setShowDuplicateWarning(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  async function handleSubmit() {
    setError(null);
    if (!form.name || !form.categoryId || !form.cityId || !form.phone) {
      setError(t("errorRequired"));
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      if (!businessId && !duplicateWarned) {
        const { data: isDuplicate } = await supabase.rpc(
          "business_duplicate_exists",
          {
            p_name: form.name,
            p_phone: form.phone,
            p_city: Number(form.cityId),
          },
        );
        if (isDuplicate) {
          setDuplicateWarned(true);
          setShowDuplicateWarning(true);
          setLoading(false);
          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not signed in");

      const toRow = (r: HoursRow) =>
        r.closed ? null : { open: r.open, close: r.close };
      const opening_hours: OpeningHours = sameWeekdays
        ? {
            weekdays: toRow(hours.weekdays),
            saturday: toRow(hours.saturday),
            sunday: toRow(hours.sunday),
          }
        : {
            mon: toRow(hours.mon),
            tue: toRow(hours.tue),
            wed: toRow(hours.wed),
            thu: toRow(hours.thu),
            fri: toRow(hours.fri),
            saturday: toRow(hours.saturday),
            sunday: toRow(hours.sunday),
          };

      const values = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        city_id: Number(form.cityId),
        address: form.address.trim() || null,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || null,
        viber: form.viber.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        facebook: form.facebook.trim() || null,
        instagram: form.instagram.trim() || null,
        opening_hours,
      };
      if (coords) {
        Object.assign(values, { lat: coords.lat, lng: coords.lng });
      }

      let id = businessId;
      if (businessId) {
        const { error: updateError } = await supabase
          .from("businesses")
          .update(
            adminMode || ownerMode
              ? values
              : { ...values, status: "pending", review_note: null },
          )
          .eq("id", businessId);
        if (updateError) throw updateError;
        await supabase
          .from("business_categories")
          .delete()
          .eq("business_id", businessId);
      } else {
        const { data: business, error: insertError } = await supabase
          .from("businesses")
          .insert({
            ...values,
            status: adminMode ? "approved" : "pending",
            source: adminMode ? "admin" : variant === "ff" ? "self" : "scout",
            scout_id: adminMode || variant === "ff" ? null : user.id,
            owner_id: variant === "ff" && claimOwner ? user.id : null,
            created_by: user.id,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
        id = business.id;
      }

      await supabase.from("business_categories").insert({
        business_id: id,
        category_id: Number(form.categoryId),
      });

      // Export-Länder separat speichern — Fehler bewusst ignorieren, solange
      // Migration 0011 (Spalte export_countries) noch nicht eingespielt ist
      const exportList = [
        ...exportCountries,
        ...exportOther
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ];
      const extra: Record<string, unknown> = {};
      if (exportList.length || businessId) extra.export_countries = exportList;
      if (showLeadBlock) {
        extra.accepts_requests = acceptsRequests;
        extra.request_email = acceptsRequests
          ? requestEmail.trim() || form.email.trim() || null
          : null;
        extra.service_area = serviceArea;
      }
      if (Object.keys(extra).length) {
        await supabase.from("businesses").update(extra).eq("id", id);
      }

      let firstPhotoUrl: string | null = null;
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${id}/${i}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("business-photos")
          .upload(path, file);
        if (uploadError) continue;
        const {
          data: { publicUrl },
        } = supabase.storage.from("business-photos").getPublicUrl(path);
        await supabase
          .from("business_photos")
          .insert({ business_id: id, url: publicUrl, sort: i });
        if (!firstPhotoUrl) firstPhotoUrl = publicUrl;
      }
      // Erstes Foto als Kartenbild übernehmen (falls noch keins gesetzt ist)
      if (firstPhotoUrl) {
        await supabase
          .from("businesses")
          .update({ cover_url: firstPhotoUrl })
          .eq("id", id)
          .is("cover_url", null);
      }

      setDone(true);
    } catch {
      setError(tc("error"));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-[28px] bg-white p-8 text-center shadow-[0_8px_32px_rgba(16,25,23,0.08)]">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.02em] text-ink">
          {ownerMode ? t("successOwner") : t("success")}
        </h1>
        <p className="mt-2 text-ink-2">
          {ownerMode
            ? t("successOwnerText")
            : variant === "ff"
              ? t("successTextSelf")
              : t("successText")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {!ownerMode && (
            <Button onClick={() => location.reload()}>{t("addAnother")}</Button>
          )}
          <Link
            href={variant === "ff" ? "/app/biznesi" : "/businesses"}
            className="inline-flex h-[52px] items-center rounded-full border-[1.5px] border-line-strong bg-white px-6 text-[16px] font-bold text-ink hover:bg-surface"
          >
            {variant === "ff" ? t("backToApp") : t("backToList")}
          </Link>
        </div>
      </div>
    );
  }

  const sectionTitle =
    step === 1
      ? t("sectionCompany")
      : step === 2
        ? t("sectionContacts")
        : t("sectionCategory");

  const hourRows: { key: HoursKey; label: string }[] = [
    ...(sameWeekdays
      ? ([{ key: "weekdays", label: t("hoursWeekdays") }] as const)
      : ([
          { key: "mon", label: t("dayMon") },
          { key: "tue", label: t("dayTue") },
          { key: "wed", label: t("dayWed") },
          { key: "thu", label: t("dayThu") },
          { key: "fri", label: t("dayFri") },
        ] as const)),
    { key: "saturday", label: t("hoursSaturday") },
    { key: "sunday", label: t("hoursSunday") },
  ];

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col">
      <div className="mb-4">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {businessId ? t("editTitle") : t("title")}
        </h1>
      </div>

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[15px] font-extrabold text-ink">
            {sectionTitle}
          </div>
          <RequiredPill>{t("required")}</RequiredPill>
        </div>

        {step === 1 && (
          <div className="space-y-2.5">
            <Input
              placeholder={t("namePh")}
              aria-label={t("name")}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <Select
              aria-label={t("city")}
              value={form.cityId}
              onChange={(e) => set("cityId", e.target.value)}
              className={form.cityId ? "" : "text-muted"}
            >
              <option value="">{t("city")}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {localizedName(c, locale)}
                </option>
              ))}
            </Select>
            <Input
              placeholder={t("addressPh")}
              aria-label={t("address")}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
            <Textarea
              rows={3}
              placeholder={t("descriptionPh")}
              aria-label={t("description")}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <div className="flex gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={captureLocation}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-bold",
                  coords
                    ? "bg-[#DCEDEA] text-[#0B443E]"
                    : "bg-primary text-white hover:bg-primary-dark",
                )}
              >
                {coords ? (
                  <Check className="h-[18px] w-[18px]" />
                ) : (
                  <MapPin
                    className={cn("h-[18px] w-[18px]", locating && "animate-pulse")}
                  />
                )}
                {locating
                  ? t("locating")
                  : coords
                    ? t("locationSaved")
                    : t("addLocation")}
              </button>
              <label className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-primary bg-white text-[15px] font-bold text-primary-dark hover:bg-primary-light/40">
                <Camera className="h-[18px] w-[18px]" />
                {t("addPhoto")}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addPhotos(e.target.files)}
                />
              </label>
            </div>
            <div>
              <p className="mb-2 text-xs text-muted">{t("photosHint")}</p>
              <div className="flex flex-wrap gap-3">
                {photos.map((file, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-20 w-20 rounded-[14px] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((p) => p.filter((_, idx) => idx !== i))
                      }
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-alert p-0.5 text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2.5">
            <IconField icon={<Phone className="h-[19px] w-[19px]" />}>
              <input
                type="tel"
                placeholder={`${t("phone").replace(" *", "")} *`}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={bareInput}
              />
            </IconField>
            <IconField icon={<Mail className="h-[19px] w-[19px]" />}>
              <input
                type="email"
                placeholder={t("email")}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={bareInput}
              />
            </IconField>
            <IconField icon={<MessageCircle className="h-[19px] w-[19px]" />}>
              <input
                type="tel"
                placeholder={`WhatsApp (${tc("optional")})`}
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                className={bareInput}
              />
            </IconField>
            <IconField icon={<MessageCircle className="h-[19px] w-[19px]" />}>
              <input
                type="tel"
                placeholder={`Viber (${tc("optional")})`}
                value={form.viber}
                onChange={(e) => set("viber", e.target.value)}
                className={bareInput}
              />
            </IconField>
            <IconField icon={<Globe className="h-[19px] w-[19px]" />}>
              <input
                placeholder={`${t("website")} (${tc("optional")})`}
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className={bareInput}
              />
            </IconField>
            <IconField icon={<Share2 className="h-[19px] w-[19px]" />}>
              <input
                placeholder={`Facebook (${tc("optional")})`}
                value={form.facebook}
                onChange={(e) => set("facebook", e.target.value)}
                className={bareInput}
              />
            </IconField>
            <IconField icon={<AtSign className="h-[19px] w-[19px]" />}>
              <input
                placeholder={`Instagram (${tc("optional")})`}
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className={bareInput}
              />
            </IconField>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Select
              aria-label={t("category")}
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={form.categoryId ? "" : "text-muted"}
            >
              <option value="">{t("chooseCategory")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {localizedName(c, locale)}
                </option>
              ))}
            </Select>

            <div className="rounded-[18px] border border-line bg-white p-4">
              <div className="mb-2 text-[15px] font-extrabold text-ink">
                {t("hours")}
              </div>
              <label className="mb-3 flex w-fit cursor-pointer items-center gap-2 text-[14px] font-semibold text-ink-2">
                <input
                  type="checkbox"
                  checked={sameWeekdays}
                  onChange={(e) => setSameWeekdays(e.target.checked)}
                  className="h-[18px] w-[18px] accent-[var(--primary)]"
                />
                {t("sameWeekdays")}
              </label>
              <div className="space-y-3">
                {hourRows.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex flex-col gap-2 border-b border-line pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-ink-2">
                        {label}
                      </span>
                      <label className="flex cursor-pointer items-center gap-1.5 text-[13.5px] text-ink-2">
                        <input
                          type="checkbox"
                          checked={hours[key].closed}
                          onChange={(e) =>
                            setHours((h) => ({
                              ...h,
                              [key]: { ...h[key], closed: e.target.checked },
                            }))
                          }
                        />
                        {t("closed")}
                      </label>
                    </div>
                    {!hours[key].closed && (
                      <div className="flex items-center gap-2.5">
                        <TimeWheelButton
                          value={hours[key].open}
                          ariaLabel={label}
                          onChange={(v) =>
                            setHours((h) => ({
                              ...h,
                              [key]: { ...h[key], open: v },
                            }))
                          }
                        />
                        <span className="text-faint">–</span>
                        <TimeWheelButton
                          value={hours[key].close}
                          ariaLabel={label}
                          onChange={(v) =>
                            setHours((h) => ({
                              ...h,
                              [key]: { ...h[key], close: v },
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* B2B: Leistungen/Produkte auch im Ausland */}
            <div className="rounded-[18px] border border-line bg-white p-4">
              <div className="text-[15px] font-extrabold text-ink">
                {t("exportTitle")}
              </div>
              <p className="mt-1 text-[13px] text-muted">{t("exportHint")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXPORT_CODES.map((code) => {
                  const active = exportCountries.includes(code);
                  return (
                    <button
                      type="button"
                      key={code}
                      aria-pressed={active}
                      onClick={() =>
                        setExportCountries((list) =>
                          active
                            ? list.filter((c) => c !== code)
                            : [...list, code],
                        )
                      }
                      className={cn(
                        "flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-bold",
                        active
                          ? "bg-primary text-white"
                          : "border-[1.5px] border-line-strong bg-white text-ink-2",
                      )}
                    >
                      {active && <Check className="h-4 w-4" />}
                      {tco(code.toLowerCase())}
                    </button>
                  );
                })}
              </div>
              <Input
                value={exportOther}
                onChange={(e) => setExportOther(e.target.value)}
                placeholder={t("exportOtherPh")}
                className="mt-3 h-11"
              />
            </div>

            {/* Kundenanfragen (AroundHome-Modell) — nur für den Betrieb selbst */}
            {showLeadBlock && (
              <div className="rounded-[18px] border border-line bg-white p-4">
                <div className="text-[15px] font-extrabold text-ink">
                  {t("leadsTitle")}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {t("leadsHint")}
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {[
                    { v: true, label: t("leadsYes") },
                    { v: false, label: t("leadsNo") },
                  ].map(({ v, label }) => (
                    <label
                      key={String(v)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-[14px] border-[1.5px] px-4 py-3 text-[14.5px] font-bold",
                        acceptsRequests === v
                          ? "border-primary bg-primary-light text-primary-dark"
                          : "border-line-strong bg-white text-ink-2",
                      )}
                    >
                      <input
                        type="radio"
                        name="accepts_requests"
                        checked={acceptsRequests === v}
                        onChange={() => setAcceptsRequests(v)}
                        className="h-[18px] w-[18px] accent-[var(--primary)]"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {acceptsRequests && (
                  <div className="mt-3 space-y-3">
                    <label className="block">
                      <span className="text-[13px] font-bold text-ink-2">
                        {t("leadsArea")}
                      </span>
                      <Select
                        value={serviceArea}
                        onChange={(e) =>
                          setServiceArea(
                            e.target.value as "city" | "region" | "country",
                          )
                        }
                        className="mt-1.5 h-11"
                      >
                        <option value="city">{t("leadsAreaCity")}</option>
                        <option value="region">{t("leadsAreaRegion")}</option>
                        <option value="country">{t("leadsAreaCountry")}</option>
                      </Select>
                    </label>
                    <label className="block">
                      <span className="text-[13px] font-bold text-ink-2">
                        {t("leadsEmail")}
                      </span>
                      <Input
                        type="email"
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                        placeholder={t("leadsEmailHint")}
                        className="mt-1.5 h-11"
                      />
                    </label>
                    <p className="text-[12.5px] font-semibold text-primary">
                      {t("leadsFree")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {locationError && (
          <p className="rounded-[14px] bg-amber-50 p-3 text-sm text-amber-800">
            {locationError === "denied"
              ? t("locationDenied")
              : locationError === "timeout"
                ? t("locationTimeout")
                : t("locationError")}
          </p>
        )}
        {showDuplicateWarning && (
          <p className="rounded-[14px] bg-amber-50 p-4 text-sm text-amber-800">
            {t("duplicateWarning")}
          </p>
        )}
        {error && <p className="text-sm font-semibold text-alert">{error}</p>}
      </div>

      {/* Fortschritts-Footer wie im Design: Segmente + eine primäre Aktion */}
      <div className="sticky bottom-24 mt-6 flex items-center gap-3 rounded-[18px] border border-line bg-white p-3.5 sm:bottom-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="text-[12.5px] font-bold text-muted">
            {t("step", { n: step, total: TOTAL_STEPS })} ·{" "}
            {t("fieldsDone", { count: filledCount })}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t("step", { n: i + 1, total: TOTAL_STEPS })}
                onClick={() => i + 1 < step && setStep(i + 1)}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i + 1 <= step ? "bg-primary" : "bg-line",
                )}
              />
            ))}
          </div>
        </div>
        <Button
          type="button"
          onClick={step < TOTAL_STEPS ? next : handleSubmit}
          disabled={loading}
          className="h-[52px] flex-none px-6 text-[17px]"
        >
          {loading
            ? tc("loading")
            : step < TOTAL_STEPS
              ? t("continue")
              : businessId
                ? ownerMode
                  ? tc("save")
                  : t("resubmit")
                : t("submit")}
          {!loading && step < TOTAL_STEPS && (
            <ChevronsRight className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
