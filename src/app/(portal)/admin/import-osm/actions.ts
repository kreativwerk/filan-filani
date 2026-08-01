"use server";

import { createClient } from "@/lib/supabase/server";
import type { OsmBusiness } from "@/lib/osm";

export type OsmImportResult = {
  found: number;
  imported: number;
  skipped: number;
  error?: string;
};

// Die Overpass-Abfrage läuft im Browser des Admins (Vercel-IPs sind bei den
// öffentlichen Overpass-Servern dauerhaft ratenlimitiert) — hier nur noch
// prüfen, deduplizieren und speichern.
export async function importOsmBusinesses(
  cityId: number,
  elements: OsmBusiness[],
): Promise<OsmImportResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .single();
  if (profile?.role !== "admin") {
    return { found: 0, imported: 0, skipped: 0, error: "forbidden" };
  }

  const found = elements.length;
  if (found > 2000) {
    return { found, imported: 0, skipped: 0, error: "too-many" };
  }

  const [{ data: categories }, { data: existing }] = await Promise.all([
    supabase.from("categories").select("id, slug"),
    supabase
      .from("businesses")
      .select("name, phone")
      .eq("city_id", cityId)
      .neq("status", "rejected"),
  ]);

  const catBySlug = new Map((categories ?? []).map((c) => [c.slug, c.id]));
  const seenNames = new Set(
    (existing ?? []).map((b) => b.name.toLowerCase().trim()),
  );
  const seenPhones = new Set(
    (existing ?? []).map((b) => b.phone).filter(Boolean),
  );

  let imported = 0;
  let skipped = 0;

  for (const b of elements) {
    const name = (b.name ?? "").trim();
    if (!name || typeof b.lat !== "number" || typeof b.lng !== "number") {
      skipped++;
      continue;
    }
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey) || (b.phone && seenPhones.has(b.phone))) {
      skipped++;
      continue;
    }
    const categoryId = catBySlug.get(b.categorySlug);
    if (!categoryId) {
      skipped++;
      continue;
    }
    const { data: row, error } = await supabase
      .from("businesses")
      .insert({
        name,
        city_id: cityId,
        address: b.address,
        lat: b.lat,
        lng: b.lng,
        phone: b.phone,
        email: b.email,
        website: b.website,
        facebook: b.facebook,
        instagram: b.instagram,
        status: "approved",
        source: "admin",
        created_by: user!.id,
      })
      .select("id")
      .single();
    if (error || !row) {
      skipped++;
      continue;
    }
    await supabase
      .from("business_categories")
      .insert({ business_id: row.id, category_id: categoryId });
    seenNames.add(nameKey);
    if (b.phone) seenPhones.add(b.phone);
    imported++;
  }

  return { found, imported, skipped };
}
