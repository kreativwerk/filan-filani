import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FFLogout } from "./ff-logout";

export async function generateMetadata() {
  const t = await getTranslations("ff");
  return { title: `${t("profileTitle")} | Filan Filani` };
}

/** Mini-Profil: Name, E-Mail, Sprache, Abmelden — erreichbar über den Header-Avatar */
export default async function FFProfilePage() {
  if (!hasSupabaseEnv()) redirect("/app/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/app/login");

  const t = await getTranslations("ff");
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name?.trim() || user.email?.split("@")[0] || "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <main className="flex flex-1 flex-col bg-surface">
      <header className="flex items-center gap-2 bg-white px-3 py-3">
        <Link
          href="/app"
          aria-label={t("backHome")}
          className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-surface"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-[19px] font-extrabold tracking-[-0.015em] text-ink">
          {t("profileTitle")}
        </h1>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6">
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-line bg-white p-6">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-ff-primary text-[30px] font-extrabold text-white">
            {initial}
          </div>
          <div className="text-center leading-tight">
            <div className="text-[20px] font-extrabold tracking-[-0.015em] text-ink">
              {name}
            </div>
            <div className="mt-1 text-[14px] text-muted">{user.email}</div>
          </div>
          <FFLogout />
        </div>
      </div>
    </main>
  );
}
