import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Button, Card, Input } from "@/components/ui";
import { approveClaim, rejectClaim } from "./actions";

export default async function AdminClaimsPage() {
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

  const { data: claims } = await supabase
    .from("business_claims")
    .select(
      `id, message, contact_phone, created_at,
       businesses(name, phone, cities(name_sq, name_de, name_en, name_sr)),
       claimant:profiles!business_claims_user_id_fkey(full_name, phone)`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {t("claimsTitle")}
        </h1>
        <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-extrabold text-primary-dark">
          {claims?.length ?? 0}
        </span>
      </div>

      <p className="text-sm text-muted">{t("claimsHint")}</p>

      {!claims?.length ? (
        <Card className="text-muted">{t("claimsEmpty")}</Card>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => {
            const b = one(c.businesses);
            const claimant = one(c.claimant);
            const city = b ? one(b.cities) : null;
            return (
              <Card key={c.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-[-0.015em] text-ink">
                      {b?.name ?? "—"}
                    </h2>
                    <p className="text-sm text-muted">
                      {city ? localizedName(city, locale) : ""}
                      {b?.phone ? ` · ${t("claimsBusinessPhone")}: ${b.phone}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-ink-2">
                      <span className="font-bold">{claimant?.full_name || "—"}</span>
                      {c.contact_phone || claimant?.phone
                        ? ` · ${c.contact_phone || claimant?.phone}`
                        : ""}
                    </p>
                    {c.message && (
                      <p className="mt-1 max-w-xl text-sm text-muted">
                        „{c.message}&ldquo;
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-faint">
                    {new Date(c.created_at).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-4">
                  <form action={approveClaim}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" variant="soft" className="h-11 text-sm">
                      {t("approve")}
                    </Button>
                  </form>
                  <form action={rejectClaim} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <Input
                      name="note"
                      placeholder={t("rejectReason")}
                      className="h-11 min-w-40 flex-1"
                    />
                    <Button type="submit" variant="danger" className="h-11 text-sm">
                      {t("reject")}
                    </Button>
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
