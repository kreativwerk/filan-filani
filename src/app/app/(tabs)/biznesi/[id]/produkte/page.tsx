import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ProductsManager, type Product } from "./products-manager";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ff");
  return { title: `${t("products")} | Filan Filani` };
}

/** Produkt-Verwaltung des Inhabers: nur für den eigenen Betrieb erreichbar. */
export default async function FFOwnerProductsPage({ params }: Props) {
  const { id } = await params;
  if (!hasSupabaseEnv()) redirect("/app/biznesi");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/biznesi");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, owner_id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business || business.owner_id !== user.id) redirect("/app/biznesi");

  const t = await getTranslations("ff");
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price, currency, photo_url, active, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <div className="flex items-center gap-2">
        <Link
          href="/app/biznesi"
          aria-label={t("tabBusiness")}
          className="grid h-10 w-10 flex-none place-items-center rounded-full text-ink hover:bg-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 leading-tight">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
            {business.name}
          </div>
          <h1 className="truncate text-[22px] font-extrabold tracking-[-0.02em] text-ink lg:text-[28px]">
            {t("products")}
          </h1>
        </div>
      </div>
      <p className="text-[13.5px] text-muted lg:max-w-2xl">
        {t("productsHint")}
      </p>
      <ProductsManager
        businessId={business.id}
        initial={(products ?? []) as Product[]}
      />
    </main>
  );
}
