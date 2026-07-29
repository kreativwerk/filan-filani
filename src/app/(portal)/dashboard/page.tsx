import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one, type BusinessStatus } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: businesses }, { data: ledger }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, status, created_at, cities(name_sq, name_de, name_en, name_sr)")
      .eq("scout_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("scout_ledger").select("amount").eq("scout_id", user!.id),
  ]);

  const counts = { approved: 0, pending: 0, rejected: 0, draft: 0 };
  for (const b of businesses ?? []) counts[b.status as BusinessStatus]++;
  const earnings = (ledger ?? []).reduce((sum, r) => sum + Number(r.amount), 0);

  const stats = [
    { label: t("totalEntries"), value: businesses?.length ?? 0 },
    { label: t("approved"), value: counts.approved },
    { label: t("pending"), value: counts.pending },
    { label: t("rejected"), value: counts.rejected },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-petrol">{t("title")}</h1>
        <Link
          href="/businesses/new"
          className="inline-flex items-center gap-2 rounded-full bg-petrol px-5 py-2.5 text-sm font-semibold text-white hover:bg-petrol-dark"
        >
          <Plus className="h-4 w-4" />
          {t("newEntryCta")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-3xl font-bold text-petrol">{s.value}</p>
            <p className="mt-1 text-sm text-foreground/60">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-petrol text-white">
        <p className="text-sm text-white/70">{t("earnings")}</p>
        <p className="mt-1 text-4xl font-bold text-lime">
          {earnings.toFixed(2).replace(".", ",")} €
        </p>
        <p className="mt-2 text-sm text-white/70">{t("earningsHint")}</p>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-petrol">{t("recent")}</h2>
        {!businesses?.length ? (
          <Card className="text-sm text-foreground/60">{t("noEntries")}</Card>
        ) : (
          <div className="space-y-2">
            {businesses.slice(0, 5).map((b) => (
              <Card
                key={b.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-semibold text-petrol">{b.name}</p>
                  <p className="text-sm text-foreground/60">
                    {one(b.cities) ? localizedName(one(b.cities)!, locale) : ""}
                  </p>
                </div>
                <StatusBadge status={b.status as BusinessStatus} />
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
