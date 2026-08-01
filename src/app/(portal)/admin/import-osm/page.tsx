import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImportOsmClient } from "./import-osm-client";

// Overpass-Abfragen können lange dauern (inkl. Ausweich-Server + Inserts)
export const maxDuration = 120;

export default async function AdminImportOsmPage() {
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

  const { data: cities } = await supabase
    .from("cities")
    .select("*")
    .order("name_sq");

  return <ImportOsmClient cities={cities ?? []} />;
}
