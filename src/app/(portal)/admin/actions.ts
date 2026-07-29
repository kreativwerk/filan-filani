"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveBusiness(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update({ status: "approved", review_note: null })
    .eq("id", id);
  revalidatePath("/admin");
}

export async function rejectBusiness(formData: FormData) {
  const id = formData.get("id") as string;
  const reason = ((formData.get("reason") as string) ?? "").trim();
  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update({ status: "rejected", review_note: reason || null })
    .eq("id", id);
  revalidatePath("/admin");
}
