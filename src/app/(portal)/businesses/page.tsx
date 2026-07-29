import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one, type BusinessStatus } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";

export default async function BusinessesPage() {
  const t = await getTranslations("list");
  const tf = await getTranslations("form");
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
    <div className="space-y-4">
      <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
        {t("title")}
      </h1>
      {!businesses?.length ? (
        <Card className="text-center">
          <p className="text-muted">{t("empty")}</p>
          <Link
            href="/businesses/new"
            className="mt-4 inline-flex h-[52px] items-center rounded-full bg-primary px-6 text-[16px] font-bold text-white hover:bg-primary-dark"
          >
            {t("emptyCta")}
          </Link>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-line bg-white">
          {businesses.map((b) => (
            <div
              key={b.id}
              className="border-b border-divider px-4 py-3.5 last:border-b-0"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ink">
                    {b.name}
                  </p>
                  <p className="truncate text-[13px] text-muted">
                    {one(b.cities) ? localizedName(one(b.cities)!, locale) : ""}
                    {b.phone ? ` · ${b.phone}` : ""}
                  </p>
                </div>
                <StatusBadge status={b.status as BusinessStatus} />
              </div>
              {b.status === "rejected" && (
                <Link
                  href={`/businesses/${b.id}/edit`}
                  className="mt-2.5 block rounded-[14px] bg-[#FFE4DC] p-3 text-sm text-[#A3241A] hover:opacity-90"
                >
                  {b.review_note && (
                    <>
                      <span className="font-bold">{t("rejectedReason")}: </span>
                      {b.review_note} —{" "}
                    </>
                  )}
                  <span className="font-bold underline">{tf("editTitle")}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
