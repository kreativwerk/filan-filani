import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, MapPin, Send, Wallet } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { localizedName, one, type Category, type City } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("myReqTitle")} | Filan Filani` };
}

const TIMEFRAME_KEY: Record<string, string> = {
  urgent: "tfUrgent",
  soon: "tfSoon",
  month: "tfMonth",
  flexible: "tfFlexible",
};
const BUDGET_KEY: Record<string, string> = {
  open: "bgOpen",
  lt100: "bgLt100",
  "100_500": "bg100",
  "500_2000": "bg500",
  gt2000: "bgGt2000",
};

type MyRequest = {
  id: string;
  title: string;
  description: string | null;
  timeframe: string | null;
  budget: string | null;
  created_at: string;
  cities: City | City[] | null;
  categories: Category | Category[] | null;
  request_recipients: { status: string }[] | null;
};

/** Der Kunde sieht, was aus seinen Anfragen geworden ist. */
export default async function FFMyRequestsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");

  if (!hasSupabaseEnv()) {
    return (
      <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
        <h1 className="text-[24px] font-extrabold text-ink">{t("myReqTitle")}</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = user
    ? await supabase
        .from("service_requests")
        .select(
          "id, title, description, timeframe, budget, created_at, cities(*), categories(*), request_recipients(status)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: null };

  const list = (rows ?? []) as unknown as MyRequest[];
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
          {t("myReqTitle")}
        </h1>
        <Link
          href="/app/kerko-oferte"
          className="flex h-11 items-center gap-2 rounded-full bg-ff-accent px-5 text-[15px] font-extrabold text-white hover:opacity-90"
        >
          <Send className="h-[18px] w-[18px]" />
          {t("reqNew")}
        </Link>
      </div>

      {!user ? (
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <p className="text-[15px] leading-relaxed text-ink-2">
            {t("reqLogin")}
          </p>
          <Link
            href="/app/login"
            className="flex h-12 items-center justify-center rounded-full bg-ff-accent px-8 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            {t("claimLoginCta")}
          </Link>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
            <FileText className="h-8 w-8" />
          </span>
          <p className="text-[15px] font-bold text-ink">{t("myReqEmpty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 lg:max-w-2xl">
          {list.map((r) => {
            const city = one(r.cities);
            const category = one(r.categories);
            const recipients = r.request_recipients ?? [];
            const responded = recipients.filter(
              (x) => x.status === "responded",
            ).length;
            return (
              <article
                key={r.id}
                className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-4"
              >
                <h2 className="text-[17px] font-extrabold tracking-[-0.015em] text-ink">
                  {r.title}
                </h2>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted">
                  {category && <span>{localizedName(category, locale)}</span>}
                  {city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {localizedName(city, locale)}
                    </span>
                  )}
                  <span>· {dateFmt.format(new Date(r.created_at))}</span>
                </p>

                {(r.timeframe || r.budget) && (
                  <div className="flex flex-wrap gap-2">
                    {r.timeframe && (
                      <span className="flex h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-[12px] font-bold text-ink-2">
                        <Clock className="h-3.5 w-3.5" />
                        {t(TIMEFRAME_KEY[r.timeframe] ?? "tfFlexible")}
                      </span>
                    )}
                    {r.budget && (
                      <span className="flex h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-[12px] font-bold text-ink-2">
                        <Wallet className="h-3.5 w-3.5" />
                        {t(BUDGET_KEY[r.budget] ?? "bgOpen")}
                      </span>
                    )}
                  </div>
                )}

                {/* Was ist daraus geworden? */}
                {recipients.length === 0 ? (
                  <p className="rounded-[14px] bg-[#FBF0D6] p-3 text-[13.5px] font-semibold leading-relaxed text-[#6B4C07]">
                    {t("reqPending")}
                  </p>
                ) : (
                  <p className="text-[13.5px] font-bold text-ff-primary-dark">
                    {t("myReqSentTo", { count: recipients.length })}
                    {responded > 0 && ` · ${t("myReqResponded", { count: responded })}`}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
