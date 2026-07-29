import { createClient } from "@/lib/supabase/server";
import { NewBusinessForm } from "./new-business-form";

export default async function NewBusinessPage() {
  const supabase = await createClient();
  const [{ data: cities }, { data: categories }] = await Promise.all([
    supabase.from("cities").select("*").order("name_sq"),
    supabase.from("categories").select("*").order("sort"),
  ]);

  return <NewBusinessForm cities={cities ?? []} categories={categories ?? []} />;
}
