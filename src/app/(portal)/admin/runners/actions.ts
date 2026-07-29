"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function recordPayout(formData: FormData) {
  const scoutId = formData.get("scout_id") as string;
  const amount = Number(formData.get("amount"));
  const note = ((formData.get("note") as string) ?? "").trim();
  if (!scoutId || !Number.isFinite(amount) || amount <= 0) return;

  const supabase = await createClient();
  await supabase.from("scout_ledger").insert({
    scout_id: scoutId,
    type: "payout",
    amount: -Math.abs(amount),
    note: note || null,
  });
  revalidatePath("/admin/runners");
}
