import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one, type BusinessStatus } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";

export default async function BusinessesPage() {
  const t = await getTranslations("list");
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: businesses } = await supabase
    .from("businesses")
    .select(
      "id, name, phone, status, review_note, created_at, cities(name_sq, name_de, name_en, name_sr)",
    )
    .eq("scout_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-petrol">{t("title")}</h1>
      {!businesses?.length ? (
        <Card className="text-center">
          <p className="text-foreground/60">{t("empty")}</p>
          <Link
            href="/businesses/new"
            className="mt-4 inline-block rounded-full bg-petrol px-6 py-2.5 text-sm font-semibold text-white hover:bg-petrol-dark"
          >
            {t("emptyCta")}
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {businesses.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-petrol">{b.name}</p>
                  <p className="text-sm text-foreground/60">
                    {one(b.cities) ? localizedName(one(b.cities)!, locale) : ""}
                    {b.phone ? ` · ${b.phone}` : ""}
                  </p>
                </div>
                <StatusBadge status={b.status as BusinessStatus} />
              </div>
              {b.status === "rejected" && b.review_note && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <span className="font-semibold">{t("rejectedReason")}: </span>
                  {b.review_note}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
