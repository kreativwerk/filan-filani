import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user!.id)
    .single();

  return (
    <ProfileForm
      email={user!.email ?? ""}
      initialName={profile?.full_name ?? ""}
      initialPhone={profile?.phone ?? ""}
    />
  );
}
