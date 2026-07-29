import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { PortalHeader } from "@/components/portal-header";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-md flex-1 px-4 py-16">
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Supabase ist noch nicht konfiguriert. Lege <code>.env.local</code> mit
          den Werten aus <code>.env.example</code> an.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <>
      <PortalHeader isAdmin={profile?.role === "admin"} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
