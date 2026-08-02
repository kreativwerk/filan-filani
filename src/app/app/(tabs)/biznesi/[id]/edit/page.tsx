import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { OpeningHours } from "@/lib/types";
import { getCities, getCategories } from "@/lib/ff-data";
import {
  NewBusinessForm,
  type BusinessInitial,
} from "@/app/(portal)/businesses/new/new-business-form";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("form");
  return { title: `${t("editTitle")} | Filan Filani` };
}

/** Inhaber bearbeitet den eigenen Betrieb — Wizard im FF-Look, status bleibt unangetastet. */
export default async function FFOwnerEditPage({ params }: Props) {
  const { id } = await params;
  if (!hasSupabaseEnv()) redirect("/app/biznesi");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/biznesi");

  const { data: business } = await supabase
    .from("businesses")
    .select("*, business_categories(category_id)")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!business || business.owner_id !== user.id) redirect("/app/biznesi");

  const [cities, categories] = await Promise.all([
    getCities(),
    getCategories(),
  ]);

  const initial: BusinessInitial = {
    name: business.name ?? "",
    categoryId: String(business.business_categories?.[0]?.category_id ?? ""),
    cityId: String(business.city_id ?? ""),
    address: business.address ?? "",
    phone: business.phone ?? "",
    whatsapp: business.whatsapp ?? "",
    viber: business.viber ?? "",
    email: business.email ?? "",
    website: business.website ?? "",
    facebook: business.facebook ?? "",
    instagram: business.instagram ?? "",
    description: business.description ?? "",
    openingHours: (business.opening_hours as OpeningHours) ?? null,
    exportCountries: (business.export_countries as string[] | null) ?? [],
  };

  return (
    <main className="ff-brand flex flex-1 flex-col gap-4 bg-surface px-4 py-5 lg:p-8">
      <NewBusinessForm
        cities={cities}
        categories={categories}
        businessId={business.id}
        initial={initial}
        variant="ff"
        ownerMode
      />
    </main>
  );
}
