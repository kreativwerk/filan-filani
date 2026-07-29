import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getTranslations } from "next-intl/server";
import { FFLogo } from "@/components/ff-logo";
import { FFLogin } from "./ff-login";

export const metadata = {
  title: "Filan Filani — Connect Kosovo",
};

export default async function FFAppPage() {
  let signedIn = false;
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  }

  if (signedIn) {
    const t = await getTranslations("ff");
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-5 bg-ff-primary px-6 text-center">
        <FFLogo variant="dark" className="h-24 w-24" />
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-white">
          {t("welcome")}
        </h1>
        <p className="max-w-sm text-[15px] text-ff-teal-soft">
          {t("comingSoon")}
        </p>
      </main>
    );
  }

  return <FFLogin />;
}
