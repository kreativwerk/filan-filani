import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one, type Category, type City } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Card } from "@/components/ui";

type AdminRequest = {
  id: string;
  title: string;
  description: string | null;
  timeframe: string | null;
  budget: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  cities: City | City[] | null;
  categories: Category | Category[] | null;
  request_recipients: { status: string }[] | null;
};

/** Alle Kundenanfragen — wichtig in der Anlaufphase, solange kaum ein Betrieb
 *  die Plattform übernommen hat: Anfragen ohne Empfänger von Hand weitergeben. */
export default async function AdminRequestsPage() {
  const t = await getTranslations("admin");
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data: rows } = await supabase
    .from("service_requests")
    .select(
      "id, title, description, timeframe, budget, contact_name, contact_phone, contact_email, created_at, cities(*), categories(*), request_recipients(status)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const list = (rows ?? []) as unknown as AdminRequest[];
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {t("requestsTitle")}
        </h1>
        <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-extrabold text-primary-dark">
          {list.length}
        </span>
      </div>
      <p className="text-sm text-muted">{t("requestsHint")}</p>

      {list.length === 0 ? (
        <Card className="text-muted">{t("requestsEmpty")}</Card>
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const city = one(r.cities);
            const category = one(r.categories);
            const recipients = r.request_recipients ?? [];
            return (
              <Card key={r.id} className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-[-0.015em] text-ink">
                      {r.title}
                    </h2>
                    <p className="text-sm text-muted">
                      {[
                        category ? localizedName(category, locale) : null,
                        city ? localizedName(city, locale) : null,
                        dateFmt.format(new Date(r.created_at)),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span
                    className={
                      recipients.length
                        ? "rounded-full bg-primary-light px-2.5 py-1 text-xs font-extrabold text-primary-dark"
                        : "rounded-full bg-[#FBF0D6] px-2.5 py-1 text-xs font-extrabold text-[#6B4C07]"
                    }
                  >
                    {recipients.length} {t("requestsRecipients")}
                  </span>
                </div>

                {r.description && (
                  <p className="whitespace-pre-line text-sm text-ink-2">
                    {r.description}
                  </p>
                )}

                <p className="text-sm font-semibold text-ink">
                  {[r.contact_name, r.contact_phone, r.contact_email]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>

                {(r.timeframe || r.budget) && (
                  <p className="text-xs text-muted">
                    {[r.timeframe, r.budget].filter(Boolean).join(" · ")}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
