import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewBusinessForm } from "../../businesses/new/new-business-form";

export default async function AdminNewBusinessPage() {
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

  const [{ data: cities }, { data: categories }] = await Promise.all([
    supabase.from("cities").select("*").order("name_sq"),
    supabase.from("categories").select("*").order("sort"),
  ]);

  return (
    <NewBusinessForm
      cities={cities ?? []}
      categories={categories ?? []}
      adminMode
    />
  );
}
