import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, phone, role, iban, bank_holder, billing_email, billing_address",
    )
    .eq("id", user!.id)
    .single();

  return (
    <ProfileForm
      email={user!.email ?? ""}
      initialName={profile?.full_name ?? ""}
      initialPhone={profile?.phone ?? ""}
      initialIban={profile?.iban ?? ""}
      initialBankHolder={profile?.bank_holder ?? ""}
      initialBillingEmail={profile?.billing_email ?? ""}
      initialBillingAddress={profile?.billing_address ?? ""}
      isScout={profile?.role === "scout" || profile?.role === "admin"}
    />
  );
}
