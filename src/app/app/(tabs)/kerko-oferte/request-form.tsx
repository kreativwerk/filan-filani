"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { localizedName, type Category, type City } from "@/lib/types";
import type { Locale } from "@/i18n/config";

const field =
  "h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none";

export function RequestForm({
  cities,
  categories,
  defaultCityId,
  defaultCategoryId,
  defaultName,
  defaultPhone,
}: {
  cities: City[];
  categories: Category[];
  defaultCityId: string;
  defaultCategoryId: string;
  defaultName: string;
  defaultPhone: string;
}) {
  const t = useTranslations("ff");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [cityId, setCityId] = useState(defaultCityId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !cityId || !title.trim()) return;
    setError(null);
    setSending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t("reqLogin"));
      setSending(false);
      return;
    }

    const { data: request, error: insertError } = await supabase
      .from("service_requests")
      .insert({
        user_id: user.id,
        category_id: Number(categoryId),
        city_id: Number(cityId),
        title: title.trim(),
        description: description.trim() || null,
        contact_name: name.trim() || null,
        contact_phone: phone.trim() || null,
      })
      .select("id")
      .single();

    if (insertError || !request) {
      setError(tc("error"));
      setSending(false);
      return;
    }

    // Passende Betriebe ermitteln und in deren Posteingang legen
    const { data: count } = await supabase.rpc("distribute_request", {
      p_request: request.id,
    });
    setSentTo(typeof count === "number" ? count : 0);
    setSending(false);
  }

  if (sentTo !== null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[24px] border border-line bg-white p-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-ff-primary" />
        <h2 className="text-[20px] font-extrabold tracking-[-0.015em] text-ink">
          {t("reqDoneTitle")}
        </h2>
        <p className="text-[14.5px] leading-relaxed text-ink-2">
          {sentTo > 0 ? t("reqDoneCount", { count: sentTo }) : t("reqDoneNone")}
        </p>
        <p className="text-[13.5px] text-muted">{t("reqDoneHint")}</p>
        <Link
          href="/app"
          className="mt-2 flex h-12 items-center justify-center rounded-full bg-ff-primary px-8 text-[15px] font-extrabold text-white hover:opacity-90"
        >
          {t("backHome")}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-5"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-[13.5px] font-extrabold text-ink">
          {t("reqCategory")}
        </span>
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={field}
        >
          <option value="">—</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {localizedName(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13.5px] font-extrabold text-ink">
          {t("reqCity")}
        </span>
        <select
          required
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className={field}
        >
          <option value="">—</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {localizedName(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13.5px] font-extrabold text-ink">
          {t("reqTitle")}
        </span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("reqTitlePh")}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13.5px] font-extrabold text-ink">
          {t("reqDesc")}
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("reqDescPh")}
          rows={4}
          className="w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-extrabold text-ink">
            {t("reqName")}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13.5px] font-extrabold text-ink">
            {t("reqPhone")}
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+383 4x xxx xxx"
            className={field}
          />
        </label>
      </div>

      {error && <p className="text-[14px] font-semibold text-alert">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="flex h-14 items-center justify-center gap-2 rounded-full bg-ff-accent text-[17px] font-extrabold text-white hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
        {sending ? t("reqSending") : t("reqSend")}
      </button>
    </form>
  );
}
