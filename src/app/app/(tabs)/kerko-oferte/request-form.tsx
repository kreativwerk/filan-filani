"use client";

/* Anfrage-Assistent im AroundHome-Stil: eine Frage pro Schritt, große
   Auswahlkacheln statt Formularfelder, Fortschrittsbalken, Kontaktdaten zuletzt. */

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronLeft, Send } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { localizedName, type Category, type City } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { categoryIcon } from "@/components/ff/icons";
import { tradeQuestions, type TradeQuestion } from "@/lib/trade-questions";
import { cn } from "@/components/ui";

/** Ein Schritt des Assistenten — die Gewerke-Fragen kommen je nach Kategorie
 *  dazu, deshalb ist die Länge nicht fix. */
type Step =
  | { kind: "category" | "city" | "timeframe" | "describe" | "budget" | "contact" }
  | { kind: "question"; question: TradeQuestion };

const field =
  "h-[52px] w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none";

/** Große, antippbare Auswahlkachel */
function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex min-h-[58px] w-full items-center gap-3 rounded-[16px] border-[1.5px] px-4 py-3 text-left text-[15.5px] font-bold transition-colors",
        active
          ? "border-ff-primary bg-ff-mint text-ff-primary-dark"
          : "border-line-strong bg-white text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

export function RequestForm({
  cities,
  categories,
  defaultCityId,
  defaultCategoryId,
  defaultName,
  defaultPhone,
  defaultEmail,
}: {
  cities: City[];
  categories: Category[];
  defaultCityId: string;
  defaultCategoryId: string;
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
}) {
  const t = useTranslations("ff");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;

  const [step, setStep] = useState(defaultCategoryId ? 1 : 0);
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [cityId, setCityId] = useState(defaultCityId);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [timeframe, setTimeframe] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<number | null>(null);

  const categorySlug =
    categories.find((c) => String(c.id) === categoryId)?.slug ?? null;

  const steps = useMemo<Step[]>(
    () => [
      { kind: "category" },
      ...tradeQuestions(categorySlug).map(
        (question) => ({ kind: "question", question }) as Step,
      ),
      { kind: "city" },
      { kind: "timeframe" },
      { kind: "describe" },
      { kind: "budget" },
      { kind: "contact" },
    ],
    [categorySlug],
  );

  const total = steps.length;
  const current = steps[Math.min(step, total - 1)];

  const canContinue =
    current.kind === "category"
      ? Boolean(categoryId)
      : current.kind === "question"
        ? Boolean(details[current.question.key])
        : current.kind === "city"
          ? Boolean(cityId)
          : current.kind === "timeframe"
            ? Boolean(timeframe)
            : current.kind === "describe"
              ? Boolean(title.trim())
              : current.kind === "budget"
                ? true
                : Boolean(phone.trim());

  /** Ein Schritt weiter — bei Auswahlkacheln direkt, ohne „Weiter" zu tippen. */
  function advance() {
    setStep((s) => Math.min(s + 1, total - 1));
  }

  function next() {
    if (!canContinue) return;
    advance();
  }

  /** Antwort setzen und direkt weiterspringen (AroundHome-Verhalten). */
  function answer(key: string, value: string) {
    setDetails((d) => ({ ...d, [key]: value }));
    advance();
  }

  async function handleSubmit() {
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
        timeframe: timeframe || null,
        budget: budget || null,
        details,
        contact_name: name.trim() || null,
        contact_phone: phone.trim() || null,
        contact_email: email.trim() || null,
      })
      .select("id")
      .single();

    if (insertError || !request) {
      setError(tc("error"));
      setSending(false);
      return;
    }

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
          href="/app/kerkesat-e-mia"
          className="mt-2 flex h-12 items-center justify-center rounded-full bg-ff-primary px-8 text-[15px] font-extrabold text-white hover:opacity-90"
        >
          {t("myReqTitle")}
        </Link>
      </div>
    );
  }

  const heads: Record<string, [string, string]> = {
    category: [t("q1"), t("q1Hint")],
    city: [t("q2"), t("q2Hint")],
    timeframe: [t("q3"), t("q3Hint")],
    describe: [t("q4"), t("q4Hint")],
    budget: [t("q5"), t("q5Hint")],
    contact: [t("q6"), t("q6Hint")],
  };
  const [heading, hint] =
    current.kind === "question"
      ? [current.question.label[locale], t("qTradeHint")]
      : heads[current.kind];
  const stepNo = step + 1;

  return (
    <div className="flex flex-col gap-4">
      {/* Fortschritt */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[12.5px] font-bold text-muted">
          <span>{t("wizStep", { n: stepNo, total })}</span>
          <span>{Math.round((stepNo / total) * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-ff-primary transition-[width] duration-300"
            style={{ width: `${(stepNo / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-5">
        <div>
          <h2 className="text-[20px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
            {heading}
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{hint}</p>
        </div>

        {/* Kategorie als Kachelraster */}
        {current.kind === "category" && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon);
              const active = categoryId === String(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(String(c.id));
                    setDetails({});
                    setStep(1);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-[16px] border-[1.5px] p-3 text-center transition-colors",
                    active
                      ? "border-ff-primary bg-ff-mint"
                      : "border-line bg-white hover:bg-surface",
                  )}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-ff-mint text-ff-primary-dark">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-[12.5px] font-bold leading-tight text-ink-2">
                    {localizedName(c, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Gewerke-Frage (je nach Kategorie) */}
        {current.kind === "question" && (
          <div className="flex flex-col gap-2.5">
            {current.question.options.map((o) => (
              <Choice
                key={o.value}
                active={details[current.question.key] === o.value}
                onClick={() => answer(current.question.key, o.value)}
              >
                {o.label[locale]}
              </Choice>
            ))}
          </div>
        )}

        {/* Stadt */}
        {current.kind === "city" && (
          <select
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
        )}

        {/* Zeitrahmen */}
        {current.kind === "timeframe" && (
          <div className="flex flex-col gap-2.5">
            {[
              ["urgent", t("tfUrgent")],
              ["soon", t("tfSoon")],
              ["month", t("tfMonth")],
              ["flexible", t("tfFlexible")],
            ].map(([value, label]) => (
              <Choice
                key={value}
                active={timeframe === value}
                onClick={() => {
                  setTimeframe(value);
                  advance();
                }}
              >
                {label}
              </Choice>
            ))}
          </div>
        )}

        {/* Beschreibung */}
        {current.kind === "describe" && (
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("reqTitlePh")}
              className={field}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("reqDescPh")}
              rows={5}
              className="w-full rounded-[14px] border-[1.5px] border-line-strong bg-white px-4 py-3 text-[16px] text-ink placeholder:text-muted focus:border-ff-primary focus:outline-none"
            />
          </div>
        )}

        {/* Budget */}
        {current.kind === "budget" && (
          <div className="flex flex-col gap-2.5">
            {[
              ["open", t("bgOpen")],
              ["lt100", t("bgLt100")],
              ["100_500", t("bg100")],
              ["500_2000", t("bg500")],
              ["gt2000", t("bgGt2000")],
            ].map(([value, label]) => (
              <Choice
                key={value}
                active={budget === value}
                onClick={() => {
                  setBudget(value);
                  advance();
                }}
              >
                {label}
              </Choice>
            ))}
          </div>
        )}

        {/* Kontakt */}
        {current.kind === "contact" && (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold text-ink-2">
                {t("reqName")}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold text-ink-2">
                {t("reqPhone")}
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+383 4x xxx xxx"
                className={field}
              />
              {!phone.trim() && (
                <span className="text-[12.5px] leading-relaxed text-muted">
                  {t("reqPhoneReq")}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold text-ink-2">
                {t("reqEmail")}
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>
          </div>
        )}

        {error && (
          <p className="text-[14px] font-semibold text-alert">{error}</p>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-2.5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex h-13 items-center gap-1 rounded-full border-[1.5px] border-line bg-white px-4 py-3 text-[15px] font-bold text-ink-2 hover:bg-surface"
            >
              <ChevronLeft className="h-5 w-5" />
              {t("wizBack")}
            </button>
          )}
          {current.kind === "contact" ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending || !canContinue}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-ff-accent text-[17px] font-extrabold text-white hover:opacity-90 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              {sending ? t("reqSending") : t("reqSend")}
            </button>
          ) : (
            current.kind !== "category" &&
            current.kind !== "question" && (
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="flex h-14 flex-1 items-center justify-center rounded-full bg-ff-primary text-[17px] font-extrabold text-white hover:opacity-90 disabled:opacity-40"
              >
                {t("wizNext")}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
