"use server";

import { createClient } from "@/lib/supabase/server";
import { overpassQuery, parseOverpass } from "@/lib/osm";

export type OsmImportResult = {
  found: number;
  imported: number;
  skipped: number;
  error?: string;
};

export async function importOsmForCity(cityId: number): Promise<OsmImportResult> {
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

  const [{ data: city }, { data: categories }, { data: existing }] =
    await Promise.all([
      supabase.from("cities").select("id, lat, lng").eq("id", cityId).single(),
      supabase.from("categories").select("id, slug"),
      supabase
        .from("businesses")
        .select("name, phone")
        .eq("city_id", cityId)
        .neq("status", "rejected"),
    ]);
  if (!city?.lat || !city?.lng) {
    return { found: 0, imported: 0, skipped: 0, error: "no-coords" };
  }

  // Der zentrale Overpass-Server ist oft überlastet — mehrere Spiegel probieren
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];
  let elements;
  let lastError = "overpass";
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(overpassQuery(city.lat, city.lng)),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        lastError = `overpass ${res.status}`;
        continue;
      }
      elements = parseOverpass(await res.json());
      break;
    } catch {
      lastError = "overpass timeout";
    }
  }
  if (!elements) {
    return { found: 0, imported: 0, skipped: 0, error: lastError };
  }

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
    const nameKey = b.name.toLowerCase().trim();
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
        name: b.name,
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

  return { found: elements.length, imported, skipped };
}
