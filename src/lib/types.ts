import type { Locale } from "@/i18n/config";

export type UserRole = "user" | "business_owner" | "scout" | "admin";
export type BusinessStatus = "draft" | "pending" | "approved" | "rejected";
export type BusinessSource = "scout" | "self" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  locale: string;
  created_at: string;
};

export type City = {
  id: number;
  slug: string;
  name_sq: string;
  name_sr: string;
  name_en: string;
  name_de: string;
  lat?: number | null;
  lng?: number | null;
};

export type Category = {
  id: number;
  /** Handwerksgewerk — nur diese erscheinen im Anfrage-Assistenten */
  is_trade?: boolean;
  slug: string;
  parent_id: number | null;
  name_sq: string;
  name_de: string;
  name_en: string;
  name_sr: string;
  icon: string | null;
  sort: number;
};

export type OpeningHours = {
  weekdays?: { open: string; close: string } | null;
  mon?: { open: string; close: string } | null;
  tue?: { open: string; close: string } | null;
  wed?: { open: string; close: string } | null;
  thu?: { open: string; close: string } | null;
  fri?: { open: string; close: string } | null;
  saturday?: { open: string; close: string } | null;
  sunday?: { open: string; close: string } | null;
};

export type Business = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  city_id: number;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp: string | null;
  viber: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  logo_url: string | null;
  export_countries?: string[] | null;
  cover_url: string | null;
  opening_hours: OpeningHours | null;
  status: BusinessStatus;
  source: BusinessSource;
  scout_id: string | null;
  owner_id: string | null;
  created_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

// PostgREST liefert eingebettete Relationen ohne generierte DB-Typen mal als
// Objekt, mal als Array typisiert — hier auf "genau eins oder null" normalisieren.
export function one<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

export function localizedName(
  row: { name_sq: string; name_de: string; name_en: string; name_sr: string },
  locale: Locale,
): string {
  switch (locale) {
    case "de":
      return row.name_de;
    case "en":
      return row.name_en;
    case "sr":
      return row.name_sr;
    default:
      return row.name_sq;
  }
}
