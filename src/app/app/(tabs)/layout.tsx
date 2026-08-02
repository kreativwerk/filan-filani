import { getCookieCitySlug } from "@/lib/ff-data";
import { FFShell } from "@/components/ff/shell";

/* Gemeinsamer Rahmen aller Tab-Seiten: Sidebar + Bottom-Pille leben im Layout
   und bleiben beim Seitenwechsel stehen — nur der Inhalt wechselt. */
export default async function FFTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const citySlug = await getCookieCitySlug();
  return <FFShell citySlug={citySlug}>{children}</FFShell>;
}
