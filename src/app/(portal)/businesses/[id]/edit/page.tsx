import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OpeningHours } from "@/lib/types";
import {
  NewBusinessForm,
  type BusinessInitial,
} from "../../new/new-business-form";

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: business }, { data: cities }, { data: categories }] =
    await Promise.all([
      supabase
        .from("businesses")
        .select("*, business_categories(category_id)")
        .eq("id", id)
        .single(),
      supabase.from("cities").select("*").order("name_sq"),
      supabase.from("categories").select("*").order("sort"),
    ]);

  if (!business) notFound();

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
    acceptsRequests: Boolean(business.accepts_requests),
    requestEmail: business.request_email ?? "",
    serviceArea:
      (business.service_area as "city" | "region" | "country") ?? "city",
  };

  return (
    <>
      {business.review_note && (
        <p className="mx-auto mb-4 max-w-2xl rounded-[14px] bg-[#FFE4DC] p-4 text-sm text-[#A3241A]">
          {business.review_note}
        </p>
      )}
      <NewBusinessForm
        cities={cities ?? []}
        categories={categories ?? []}
        businessId={business.id}
        initial={initial}
      />
    </>
  );
}
