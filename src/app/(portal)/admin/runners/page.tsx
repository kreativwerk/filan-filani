import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, Input, SectionLabel } from "@/components/ui";
import { formatIban } from "@/lib/iban";
import { recordPayout } from "./actions";

const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

export default async function AdminRunnersPage() {
  const t = await getTranslations("admin");
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

  const [{ data: scouts }, { data: ledger }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, iban, bank_holder, billing_email, billing_address")
      .eq("role", "scout")
      .order("created_at"),
    supabase.from("scout_ledger").select("scout_id, type, amount"),
  ]);

  const stats = new Map<
    string,
    { credited: number; paidOut: number; entries: number }
  >();
  for (const row of ledger ?? []) {
    const s = stats.get(row.scout_id) ?? { credited: 0, paidOut: 0, entries: 0 };
    if (row.type === "credit") {
      s.credited += Number(row.amount);
      s.entries += 1;
    } else {
      s.paidOut += -Number(row.amount);
    }
    stats.set(row.scout_id, s);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
        {t("runners")}
      </h1>

      {!scouts?.length ? (
        <Card className="text-muted">{t("noRunners")}</Card>
      ) : (
        <div className="space-y-4">
          {scouts.map((s) => {
            const st = stats.get(s.id) ?? {
              credited: 0,
              paidOut: 0,
              entries: 0,
            };
            const balance = st.credited - st.paidOut;
            return (
              <Card key={s.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[17px] font-extrabold tracking-[-0.015em] text-ink">
                      {s.full_name || "—"}
                    </h2>
                    <p className="text-sm text-muted">
                      {s.phone || "—"} · {st.entries} {t("entriesApproved")}
                    </p>
                    {/* Auszahlungsdaten für die Überweisung */}
                    {s.iban ? (
                      <div className="mt-2 rounded-[12px] bg-surface px-3 py-2 text-[13px] leading-relaxed">
                        <SectionLabel className="tracking-[0.06em]">
                          {t("billingOk")}
                        </SectionLabel>
                        <div className="mt-1 font-mono text-ink">
                          {formatIban(s.iban)}
                        </div>
                        <div className="text-muted">
                          {[s.bank_holder, s.billing_email, s.billing_address]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      </div>
                    ) : (
                      <span className="mt-2 inline-block rounded-full bg-[#FBF0D6] px-2.5 py-1 text-xs font-extrabold text-[#6B4C07]">
                        {t("noBilling")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-5 text-right">
                    <div>
                      <SectionLabel className="tracking-[0.06em]">
                        {t("credited")}
                      </SectionLabel>
                      <div className="font-mono text-[17px] font-medium text-ink">
                        {eur(st.credited)}
                      </div>
                    </div>
                    <div>
                      <SectionLabel className="tracking-[0.06em]">
                        {t("paidOut")}
                      </SectionLabel>
                      <div className="font-mono text-[17px] font-medium text-ink">
                        {eur(st.paidOut)}
                      </div>
                    </div>
                    <div>
                      <SectionLabel className="tracking-[0.06em]">
                        {t("balance")}
                      </SectionLabel>
                      <div className="font-mono text-[17px] font-medium text-primary">
                        {eur(balance)}
                      </div>
                    </div>
                  </div>
                </div>

                {balance > 0 && (
                  <form
                    action={recordPayout}
                    className="flex flex-wrap items-center gap-2 border-t border-divider pt-4"
                  >
                    <input type="hidden" name="scout_id" value={s.id} />
                    <Input
                      name="amount"
                      type="number"
                      step="0.50"
                      min="0.50"
                      max={balance}
                      defaultValue={balance.toFixed(2)}
                      className="h-11 w-32"
                    />
                    <Input
                      name="note"
                      placeholder={t("payoutNote")}
                      className="h-11 min-w-40 flex-1"
                    />
                    <Button type="submit" variant="soft" className="h-11 text-sm">
                      {t("payout")}
                    </Button>
                  </form>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
