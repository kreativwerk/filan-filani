export const locales = ["sq", "de", "en", "sr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sq";
export const LOCALE_COOKIE = "ff_locale";

// Flaggen werden in src/components/flags.tsx als SVG gerendert
// (für "sr" bewusst die jugoslawische Flagge — steht für SR/BS/HR gemeinsam).
export const localeLabels: Record<Locale, { label: string }> = {
  sq: { label: "Shqip" },
  de: { label: "Deutsch" },
  en: { label: "English" },
  sr: { label: "Srpski / BHS" },
};
