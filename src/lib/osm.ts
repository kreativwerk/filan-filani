// OpenStreetMap-Import: Overpass-Abfrage + Zuordnung OSM-Tags -> unsere Kategorien
// Daten © OpenStreetMap contributors, Lizenz ODbL (Quellenangabe erforderlich)

export type OsmBusiness = {
  /** OSM-Kennung, z. B. "node/123456" — für spätere Abgleiche */
  osmId: string;
  /** Wie oft der Eintrag in OSM bearbeitet wurde (1 = nie geändert) */
  osmVersion: number | null;
  /** Letzte Bearbeitung in OSM (ISO) — Gradmesser für Aktualität */
  osmTimestamp: string | null;
  name: string;
  categorySlug: string;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  email: string | null;
  address: string | null;
  lat: number;
  lng: number;
};

const AMENITIES =
  "restaurant|cafe|fast_food|bar|pharmacy|dentist|doctors|clinic|veterinary|bank|driving_school|kindergarten|events_venue";
const OFFICES =
  "lawyer|notary|accountant|estate_agent|insurance|it|employment_agency";
const TOURISM = "hotel|guest_house|motel|hostel";

export function overpassQuery(lat: number, lng: number, radius = 8000) {
  const around = `around:${radius},${lat},${lng}`;
  return `[out:json][timeout:60];
(
  nwr(${around})["name"]["shop"];
  nwr(${around})["name"]["craft"];
  nwr(${around})["name"]["amenity"~"^(${AMENITIES})$"];
  nwr(${around})["name"]["office"~"^(${OFFICES})$"];
  nwr(${around})["name"]["tourism"~"^(${TOURISM})$"];
);
out center meta 1500;`;
}

type Tags = Record<string, string>;

function mapCategory(t: Tags): string | null {
  const shop = t.shop, amenity = t.amenity, craft = t.craft, office = t.office, tourism = t.tourism;
  if (shop === "car_repair" || shop === "car_parts" || shop === "tyres" || craft === "car_painter") return "auto-servis";
  if (amenity === "restaurant" || amenity === "fast_food" || amenity === "bar") return "restorant";
  if (amenity === "cafe" || shop === "bakery" || shop === "pastry" || shop === "confectionery") return "kafene";
  if (shop === "hairdresser" || shop === "beauty" || shop === "cosmetics" || craft === "hairdresser") return "bukuri";
  if (amenity === "dentist") return "stomatolog";
  if (amenity === "pharmacy" || amenity === "doctors" || amenity === "clinic" || amenity === "veterinary" || shop === "optician" || shop === "medical_supply") return "shendetesi";
  if (amenity === "bank" || office === "insurance") return "sigurime-financa";
  if (office === "lawyer" || office === "notary") return "avokat";
  if (office === "accountant") return "kontabilitet";
  if (office === "employment_agency") return "agjenci-punesimi";
  if (office === "estate_agent") return "patundshmeri";
  if (office === "it" || shop === "computer" || shop === "electronics" || shop === "mobile_phone") return "teknologji";
  if (tourism) return "hotel";
  if (shop === "supermarket" || shop === "convenience" || shop === "greengrocer" || shop === "butcher" || shop === "grocery") return "shitore";
  if (shop === "clothes" || shop === "shoes" || shop === "boutique" || shop === "fashion_accessories" || craft === "tailor") return "mode";
  if (shop === "furniture" || shop === "interior_decoration" || shop === "curtain" || craft === "carpenter") return "mobileri";
  if (craft === "electrician" || shop === "electrical") return "elektricist";
  if (craft === "plumber" || shop === "bathroom_furnishing") return "hidraulik";
  // Eigene Gewerke — vorher landete alles in „Bau"
  if (craft === "painter" || craft === "plasterer" || craft === "stucco_plasterer") return "bojatis";
  if (craft === "roofer" || craft === "insulation" || craft === "chimney_sweeper") return "kulme";
  if (craft === "window_construction" || craft === "glaziery" || shop === "doors" || shop === "windows" || shop === "glaziery") return "dritare-dyer";
  if (craft === "tiler" || craft === "floorer" || craft === "parquet_layer" || shop === "flooring" || shop === "tiles") return "pllakosje";
  if (craft === "hvac" || craft === "heating" || craft === "heating_engineer" || shop === "hvac" || shop === "heating") return "klima-ngrohje";
  if (craft === "photovoltaic" || craft === "solar" || shop === "solar" || shop === "energy") return "solar";
  if (craft === "metal_construction" || craft === "blacksmith" || craft === "welder" || craft === "locksmith" || craft === "handicraft") return "metalpunues";
  if (craft === "gardener" || craft === "landscape_gardener" || shop === "garden_furniture" || shop === "fencing") return "kopsht-oborr";
  if (craft === "builder" || craft === "scaffolder" || craft === "sawmill" || craft === "stonemason" || shop === "doityourself" || shop === "hardware" || shop === "trade" || shop === "building_materials" || shop === "paint") return "ndertim";
  if (amenity === "driving_school" || amenity === "kindergarten" || shop === "books" || shop === "stationery") return "edukim";
  if (amenity === "events_venue" || shop === "florist" || craft === "photographer" || shop === "photo") return "evente";
  if (shop === "agrarian" || shop === "farm" || shop === "garden_centre") return "bujqesi";
  if (shop === "laundry" || shop === "dry_cleaning" || craft === "cleaning") return "pastrim";
  return null;
}

function cleanUrl(v: string | undefined): string | null {
  if (!v) return null;
  const first = v.split(";")[0].trim();
  return first || null;
}

export function parseOverpass(json: {
  elements?: Array<{
    type?: string;
    id?: number;
    version?: number;
    timestamp?: string;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Tags;
  }>;
}): OsmBusiness[] {
  const out: OsmBusiness[] = [];
  for (const el of json.elements ?? []) {
    const t = el.tags ?? {};
    const name = t.name?.trim();
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!name || lat === undefined || lng === undefined) continue;
    // In OSM als geschlossen/aufgegeben markierte Betriebe überspringen
    if (t.disused === "yes" || t.abandoned === "yes" || t.ruins === "yes") continue;
    if (t.end_date || t["opening_hours"] === "closed") continue;
    if (Object.keys(t).some((k) => k.startsWith("disused:") || k.startsWith("abandoned:") || k.startsWith("was:"))) continue;
    const categorySlug = mapCategory(t);
    if (!categorySlug) continue;
    const street = t["addr:street"];
    const nr = t["addr:housenumber"];
    out.push({
      osmId: `${el.type ?? "node"}/${el.id ?? ""}`,
      osmVersion: typeof el.version === "number" ? el.version : null,
      osmTimestamp: el.timestamp ?? null,
      name,
      categorySlug,
      phone: (t.phone ?? t["contact:phone"] ?? "").split(";")[0].trim() || null,
      website: cleanUrl(t.website ?? t["contact:website"]),
      facebook: cleanUrl(t["contact:facebook"] ?? t.facebook),
      instagram: cleanUrl(t["contact:instagram"] ?? t.instagram),
      email: (t.email ?? t["contact:email"] ?? "").split(";")[0].trim() || null,
      address: street ? `${street}${nr ? " " + nr : ""}` : null,
      lat,
      lng,
    });
  }
  return out;
}
