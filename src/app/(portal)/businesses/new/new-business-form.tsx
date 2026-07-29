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

const MAX_PHOTOS = 6;
const TOTAL_STEPS = 3;

type HoursRow = { open: string; close: string; closed: boolean };

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
};

export function NewBusinessForm({
  cities,
  categories,
  businessId,
  initial,
}: {
  cities: City[];
  categories: Category[];
  businessId?: string;
  initial?: BusinessInitial;
}) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
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
  const [hours, setHours] = useState<{
    weekdays: HoursRow;
    saturday: HoursRow;
    sunday: HoursRow;
  }>({
    weekdays: fromSaved(initial?.openingHours?.weekdays) ?? { ...defaultHours },
    saturday: fromSaved(initial?.openingHours?.saturday) ?? { ...defaultHours },
    sunday:
      fromSaved(initial?.openingHours?.sunday) ??
      { ...defaultHours, closed: true },
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
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
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const filledCount = Object.values(form).filter(Boolean).length;

  const stepValid =
    step === 1
      ? Boolean(form.name && form.cityId)
      : step === 2
        ? Boolean(form.phone)
        : Boolean(form.categoryId);

  function next() {
    setError(null);
    if (!stepValid) {
      setError(t("errorRequired"));
      return;
    }
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
      const opening_hours: OpeningHours = {
        weekdays: toRow(hours.weekdays),
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
          .update({ ...values, status: "pending", review_note: null })
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
            status: "pending",
            source: "scout",
            scout_id: user.id,
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
          {t("success")}
        </h1>
        <p className="mt-2 text-ink-2">{t("successText")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => location.reload()}>{t("addAnother")}</Button>
          <Link
            href="/businesses"
            className="inline-flex h-[52px] items-center rounded-full border-[1.5px] border-line-strong bg-white px-6 text-[16px] font-bold text-ink hover:bg-surface"
          >
            {t("backToList")}
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

  const hourRows: { key: keyof typeof hours; label: string }[] = [
    { key: "weekdays", label: t("hoursWeekdays") },
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
                  <MapPin className="h-[18px] w-[18px]" />
                )}
                {coords ? t("locationSaved") : t("addLocation")}
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
              <div className="mb-3 text-[15px] font-extrabold text-ink">
                {t("hours")}
              </div>
              <div className="space-y-3">
                {hourRows.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex flex-wrap items-center gap-3 text-sm"
                  >
                    <span className="w-32 text-ink-2">{label}</span>
                    <Input
                      type="time"
                      className="h-11 w-28"
                      disabled={hours[key].closed}
                      value={hours[key].open}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [key]: { ...h[key], open: e.target.value },
                        }))
                      }
                    />
                    <span className="text-faint">–</span>
                    <Input
                      type="time"
                      className="h-11 w-28"
                      disabled={hours[key].closed}
                      value={hours[key].close}
                      onChange={(e) =>
                        setHours((h) => ({
                          ...h,
                          [key]: { ...h[key], close: e.target.value },
                        }))
                      }
                    />
                    <label className="flex items-center gap-1.5 text-ink-2">
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
                ))}
              </div>
            </div>
          </div>
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
                ? t("resubmit")
                : t("submit")}
          {!loading && step < TOTAL_STEPS && (
            <ChevronsRight className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
