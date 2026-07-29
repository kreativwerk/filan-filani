import Link from "next/link";
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-ink">
          {t("title")}
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/runners"
            className="rounded-full border-[1.5px] border-primary bg-white px-4 py-1.5 text-sm font-bold text-primary-dark hover:bg-primary-light/40"
          >
            {t("runners")}
          </Link>
          <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-extrabold text-primary-dark">
            {pending?.length ?? 0} {t("pendingCount")}
          </span>
        </div>
      </div>

      {!pending?.length ? (
        <Card className="text-muted">{t("queueEmpty")}</Card>
      ) : (
        <div className="space-y-4">
          {pending.map((b) => (
            <Card key={b.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold tracking-[-0.015em] text-ink">
                    {b.name}
                  </h2>
                  <p className="text-sm text-muted">
                    {b.business_categories
                      ?.map((bc) => {
                        const c = one(bc.categories);
                        return c ? localizedName(c, locale) : "";
                      })
                      .filter(Boolean)
                      .join(", ")}
                    {one(b.cities)
                      ? ` · ${localizedName(one(b.cities)!, locale)}`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {[b.address, b.phone, b.whatsapp, b.email, b.website]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {b.description && (
                    <p className="mt-2 max-w-xl text-sm text-ink-2">
                      {b.description}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-faint">
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
                      className="h-24 w-24 rounded-[14px] object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-divider pt-4">
                <form action={approveBusiness}>
                  <input type="hidden" name="id" value={b.id} />
                  <Button type="submit" variant="soft" className="h-11 text-sm">
                    {t("approve")}
                  </Button>
                </form>
                <form action={rejectBusiness} className="flex flex-1 gap-2">
                  <input type="hidden" name="id" value={b.id} />
                  <Input
                    name="reason"
                    placeholder={t("rejectReason")}
                    className="h-11 min-w-40 flex-1"
                  />
                  <Button type="submit" variant="danger" className="h-11 text-sm">
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
