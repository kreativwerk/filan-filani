"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveClaim(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.rpc("approve_business_claim", { p_claim: id });
  revalidatePath("/admin/claims");
}

export async function rejectClaim(formData: FormData) {
  const id = formData.get("id") as string;
  const note = ((formData.get("note") as string) ?? "").trim();
  const supabase = await createClient();
  await supabase
    .from("business_claims")
    .update({
      status: "rejected",
      note: note || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/admin/claims");
}
