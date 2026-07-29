"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ImagePlus, X } from "lucide-react";
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
  Card,
  Field,
  Input,
  Select,
  Textarea,
  Label,
} from "@/components/ui";

const MAX_PHOTOS = 6;

type HoursRow = { open: string; close: string; closed: boolean };

const defaultHours: HoursRow = { open: "08:00", close: "18:00", closed: false };

export function NewBusinessForm({
  cities,
  categories,
}: {
  cities: City[];
  categories: Category[];
}) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    cityId: "",
    address: "",
    phone: "",
    whatsapp: "",
    viber: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    description: "",
  });
  const [hours, setHours] = useState<{
    weekdays: HoursRow;
    saturday: HoursRow;
    sunday: HoursRow;
  }>({
    weekdays: { ...defaultHours },
    saturday: { ...defaultHours },
    sunday: { ...defaultHours, closed: true },
  });
  const [photos, setPhotos] = useState<File[]>([]);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.categoryId || !form.cityId || !form.phone) {
      setError(t("errorRequired"));
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      // Duplikat-Prüfung — beim ersten Treffer warnen, zweiter Klick sendet trotzdem
      if (!duplicateWarned) {
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

      const { data: business, error: insertError } = await supabase
        .from("businesses")
        .insert({
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
          status: "pending",
          source: "scout",
          scout_id: user.id,
          created_by: user.id,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      await supabase.from("business_categories").insert({
        business_id: business.id,
        category_id: Number(form.categoryId),
      });

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${business.id}/${i}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("business-photos")
          .upload(path, file);
        if (uploadError) continue;
        const {
          data: { publicUrl },
        } = supabase.storage.from("business-photos").getPublicUrl(path);
        await supabase
          .from("business_photos")
          .insert({ business_id: business.id, url: publicUrl, sort: i });
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
      <Card className="mx-auto max-w-lg text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-petrol">{t("success")}</h1>
        <p className="mt-2 text-foreground/70">{t("successText")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => location.reload()}>{t("addAnother")}</Button>
          <Link
            href="/businesses"
            className="inline-flex items-center rounded-full border border-petrol/20 px-5 py-2.5 text-sm font-semibold text-petrol hover:bg-petrol/5"
          >
            {t("backToList")}
          </Link>
        </div>
      </Card>
    );
  }

  const hourRows: { key: keyof typeof hours; label: string }[] = [
    { key: "weekdays", label: t("hoursWeekdays") },
    { key: "saturday", label: t("hoursSaturday") },
    { key: "sunday", label: t("hoursSunday") },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-petrol">{t("title")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="space-y-4">
          <Field label={t("name")}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("namePh")}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("category")}>
              <Select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                required
              >
                <option value="" />
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {localizedName(c, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("city")}>
              <Select
                value={form.cityId}
                onChange={(e) => set("cityId", e.target.value)}
                required
              >
                <option value="" />
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {localizedName(c, locale)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={t("address")}>
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder={t("addressPh")}
            />
          </Field>
          <Field label={t("description")}>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("descriptionPh")}
            />
          </Field>
        </Card>

        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("phone")}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+383 4x xxx xxx"
                required
              />
            </Field>
            <Field label={`WhatsApp (${tc("optional")})`}>
              <Input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
              />
            </Field>
            <Field label={`Viber (${tc("optional")})`}>
              <Input
                type="tel"
                value={form.viber}
                onChange={(e) => set("viber", e.target.value)}
              />
            </Field>
            <Field label={`${t("email")} (${tc("optional")})`}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label={`${t("website")} (${tc("optional")})`}>
              <Input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://"
              />
            </Field>
            <Field label={`Facebook (${tc("optional")})`}>
              <Input
                value={form.facebook}
                onChange={(e) => set("facebook", e.target.value)}
              />
            </Field>
            <Field label={`Instagram (${tc("optional")})`}>
              <Input
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <Label>{t("hours")}</Label>
          <div className="mt-2 space-y-3">
            {hourRows.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-wrap items-center gap-3 text-sm"
              >
                <span className="w-36 text-foreground/70">{label}</span>
                <Input
                  type="time"
                  className="w-28"
                  disabled={hours[key].closed}
                  value={hours[key].open}
                  onChange={(e) =>
                    setHours((h) => ({
                      ...h,
                      [key]: { ...h[key], open: e.target.value },
                    }))
                  }
                />
                <span className="text-foreground/40">–</span>
                <Input
                  type="time"
                  className="w-28"
                  disabled={hours[key].closed}
                  value={hours[key].close}
                  onChange={(e) =>
                    setHours((h) => ({
                      ...h,
                      [key]: { ...h[key], close: e.target.value },
                    }))
                  }
                />
                <label className="flex items-center gap-1.5 text-foreground/70">
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
        </Card>

        <Card>
          <Label>{t("photos")}</Label>
          <p className="mb-3 text-xs text-foreground/50">{t("photosHint")}</p>
          <div className="flex flex-wrap gap-3">
            {photos.map((file, i) => (
              <div key={i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-20 w-20 rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPhotos((p) => p.filter((_, idx) => idx !== i))
                  }
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-petrol/20 text-petrol/40 hover:border-petrol/40">
                <ImagePlus className="h-6 w-6" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addPhotos(e.target.files)}
                />
              </label>
            )}
          </div>
        </Card>

        {showDuplicateWarning && (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            {t("duplicateWarning")}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? tc("loading") : t("submit")}
        </Button>
      </form>
    </div>
  );
}
