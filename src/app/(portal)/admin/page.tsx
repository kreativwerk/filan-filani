import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { localizedName, one } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Button, Card, Input } from "@/components/ui";
import { approveBusiness, rejectBusiness } from "./actions";

export default async function AdminPage() {
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

  const { data: pending } = await supabase
    .from("businesses")
    .select(
      `id, name, description, address, phone, whatsapp, email, website, created_at,
       cities(name_sq, name_de, name_en, name_sr),
       business_categories(categories(name_sq, name_de, name_en, name_sr)),
       business_photos(url),
       scout:profiles!businesses_scout_id_fkey(full_name)`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-petrol">{t("title")}</h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
          {pending?.length ?? 0} {t("pendingCount")}
        </span>
      </div>

      {!pending?.length ? (
        <Card className="text-foreground/60">{t("queueEmpty")}</Card>
      ) : (
        <div className="space-y-4">
          {pending.map((b) => (
            <Card key={b.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-petrol">{b.name}</h2>
                  <p className="text-sm text-foreground/60">
                    {b.business_categories
                      ?.map((bc) =>
                        { const c = one(bc.categories); return c ? localizedName(c, locale) : ""; },
                      )
                      .filter(Boolean)
                      .join(", ")}
                    {one(b.cities) ? ` · ${localizedName(one(b.cities)!, locale)}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-foreground/60">
                    {[b.address, b.phone, b.whatsapp, b.email, b.website]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {b.description && (
                    <p className="mt-2 max-w-xl text-sm text-foreground/80">
                      {b.description}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-foreground/50">
                  <p>
                    {t("scout")}: {one(b.scout)?.full_name || "—"}
                  </p>
                  <p>
                    {t("submittedAt")}{" "}
                    {new Date(b.created_at).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>

              {b.business_photos?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {b.business_photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={p.url}
                      alt=""
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-petrol/10 pt-4">
                <form action={approveBusiness}>
                  <input type="hidden" name="id" value={b.id} />
                  <Button type="submit" variant="secondary">
                    {t("approve")}
                  </Button>
                </form>
                <form action={rejectBusiness} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={b.id} />
                  <Input
                    name="reason"
                    placeholder={t("rejectReason")}
                    className="min-w-40 flex-1"
                  />
                  <Button type="submit" variant="danger">
                    {t("reject")}
                  </Button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
