import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, MapPin, Store, Wallet } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { localizedName, one, type Category, type City } from "@/lib/types";
import { cn } from "@/components/ui";
import { RequestActions } from "./request-actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("reqInbox")} | Filan Filani` };
}

type RecipientRow = {
  request_id: string;
  business_id: string;
  status: "new" | "viewed" | "responded" | "declined";
  created_at: string;
  service_requests:
    | {
        id: string;
        title: string;
        description: string | null;
        contact_name: string | null;
        contact_phone: string | null;
        contact_email: string | null;
        timeframe: string | null;
        budget: string | null;
        created_at: string;
        cities: City | City[] | null;
        categories: Category | Category[] | null;
      }
    | {
        id: string;
        title: string;
        description: string | null;
        contact_name: string | null;
        contact_phone: string | null;
        contact_email: string | null;
        timeframe: string | null;
        budget: string | null;
        created_at: string;
        cities: City | City[] | null;
        categories: Category | Category[] | null;
      }[]
    | null;
};

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

const STATUS_STYLE: Record<string, string> = {
  new: "bg-ff-accent/10 text-ff-accent",
  viewed: "bg-surface text-muted",
  responded: "bg-ff-mint text-ff-primary-dark",
  declined: "bg-surface text-faint",
};

/** Posteingang des Betriebs: Anfragen, die zu Kategorie und Gebiet passen. */
export default async function FFRequestsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");

  if (!hasSupabaseEnv()) {
    return (
      <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
        <h1 className="text-[24px] font-extrabold text-ink">{t("reqInbox")}</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
        <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          {t("reqInbox")}
        </h1>
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
            <FileText className="h-8 w-8" />
          </span>
          <p className="text-[15px] leading-relaxed text-ink-2">
            {t("myBizLogin")}
          </p>
          <Link
            href="/app/login"
            className="flex h-12 items-center justify-center rounded-full bg-ff-accent px-8 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            {t("claimLoginCta")}
          </Link>
        </div>
      </main>
    );
  }

  const { data: ownBiz } = await supabase
    .from("businesses")
    .select("id, name, accepts_requests")
    .eq("owner_id", user.id);

  const businesses = ownBiz ?? [];
  const acceptsAny = businesses.some((b) => b.accepts_requests);

  const { data: rows } = await supabase
    .from("request_recipients")
    .select(
      `request_id, business_id, status, created_at,
       service_requests(id, title, description, contact_name, contact_phone,
                        contact_email, timeframe, budget, created_at,
                        cities(*), categories(*))`,
    )
    .order("created_at", { ascending: false });

  const list = (rows ?? []) as unknown as RecipientRow[];
  const bizName = new Map(businesses.map((b) => [b.id, b.name]));
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  // Neue Anfragen beim Öffnen als gesehen markieren
  const unseen = list.filter((r) => r.status === "new");
  if (unseen.length) {
    await Promise.all(
      unseen.map((r) =>
        supabase
          .from("request_recipients")
          .update({ status: "viewed" })
          .eq("request_id", r.request_id)
          .eq("business_id", r.business_id),
      ),
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-ink lg:text-[34px]">
        {t("reqInbox")}
      </h1>

      {businesses.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
            <Store className="h-8 w-8" />
          </span>
          <p className="text-[15px] leading-relaxed text-ink-2">
            {t("reqNoBiz")}
          </p>
          <Link
            href="/app/biznesi"
            className="flex h-12 items-center justify-center rounded-full bg-ff-primary px-8 text-[16px] font-extrabold text-white hover:opacity-90"
          >
            {t("tabBusiness")}
          </Link>
        </div>
      ) : (
        <>
          {!acceptsAny && (
            <p className="rounded-[14px] bg-[#FBF0D6] p-3.5 text-sm font-semibold text-[#6B4C07] lg:max-w-2xl">
              {t("reqInboxOff")}
            </p>
          )}

          {list.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[24px] border border-line bg-white p-8 text-center lg:max-w-md">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-ff-mint text-ff-primary">
                <FileText className="h-8 w-8" />
              </span>
              <p className="text-[15px] font-bold text-ink">
                {t("reqInboxEmpty")}
              </p>
              <p className="text-[14px] leading-relaxed text-muted">
                {t("reqInboxHint")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:max-w-2xl">
              {list.map((r) => {
                const req = one(r.service_requests);
                if (!req) return null;
                const city = one(req.cities);
                const category = one(req.categories);
                const statusKey =
                  r.status === "new" ? "viewed" : r.status; // beim Öffnen gesehen
                return (
                  <article
                    key={`${r.request_id}-${r.business_id}`}
                    className="flex flex-col gap-2.5 rounded-[18px] border border-line bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-[17px] font-extrabold tracking-[-0.015em] text-ink">
                        {req.title}
                      </h2>
                      <span
                        className={cn(
                          "flex h-7 items-center rounded-full px-2.5 text-[12px] font-extrabold",
                          STATUS_STYLE[statusKey],
                        )}
                      >
                        {t(
                          statusKey === "responded"
                            ? "reqStatusResponded"
                            : statusKey === "declined"
                              ? "reqStatusDeclined"
                              : "reqStatusViewed",
                        )}
                      </span>
                    </div>

                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] text-muted">
                      {category && <span>{localizedName(category, locale)}</span>}
                      {city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {localizedName(city, locale)}
                        </span>
                      )}
                      <span>· {dateFmt.format(new Date(req.created_at))}</span>
                      {businesses.length > 1 && (
                        <span>· {bizName.get(r.business_id)}</span>
                      )}
                    </p>

                    {req.description && (
                      <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-ink-2">
                        {req.description}
                      </p>
                    )}

                    {(req.timeframe || req.budget) && (
                      <div className="flex flex-wrap gap-2">
                        {req.timeframe && (
                          <span className="flex h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-[12px] font-bold text-ink-2">
                            <Clock className="h-3.5 w-3.5" />
                            {t(TIMEFRAME_KEY[req.timeframe] ?? "tfFlexible")}
                          </span>
                        )}
                        {req.budget && (
                          <span className="flex h-7 items-center gap-1.5 rounded-full bg-surface px-2.5 text-[12px] font-bold text-ink-2">
                            <Wallet className="h-3.5 w-3.5" />
                            {t(BUDGET_KEY[req.budget] ?? "bgOpen")}
                          </span>
                        )}
                      </div>
                    )}

                    {(req.contact_name || req.contact_phone || req.contact_email) && (
                      <p className="text-[14px] font-semibold text-ink">
                        {[req.contact_name, req.contact_phone, req.contact_email]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}

                    <RequestActions
                      requestId={r.request_id}
                      businessId={r.business_id}
                      status={r.status}
                      phone={req.contact_phone}
                    />
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
