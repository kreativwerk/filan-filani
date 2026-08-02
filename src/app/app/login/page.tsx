import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Locale } from "@/i18n/config";
import { ALL_CITIES, cityOption, getCities } from "@/lib/ff-data";
import { FFLogin } from "./ff-login";

export const metadata = {
  title: "Filan Filani — Connect Kosovo",
};

export default async function FFLoginPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("ff");

  let cityOptions = [{ slug: ALL_CITIES, label: t("allKosovo") }];
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/app");
    const cities = await getCities();
    cityOptions = [
      { slug: ALL_CITIES, label: t("allKosovo") },
      ...cities.map((c) => cityOption(c, locale)),
    ];
  }

  return <FFLogin cities={cityOptions} />;
}
