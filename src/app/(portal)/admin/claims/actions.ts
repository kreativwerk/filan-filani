"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function deleteClaimDocuments(claimId: string) {
  const supabase = await createClient();
  const { data: claim } = await supabase
    .from("business_claims")
    .select("document_paths")
    .eq("id", claimId)
    .single();
  const paths = (claim?.document_paths as string[] | null) ?? [];
  if (paths.length) {
    await supabase.storage.from("claim-documents").remove(paths);
    await supabase
      .from("business_claims")
      .update({ document_paths: [] })
      .eq("id", claimId);
  }
}

export async function approveClaim(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  await supabase.rpc("approve_business_claim", { p_claim: id });
  await deleteClaimDocuments(id);
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
  await deleteClaimDocuments(id);
  revalidatePath("/admin/claims");
}
