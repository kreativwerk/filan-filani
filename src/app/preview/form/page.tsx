// Design-QA-Vorschau: Erfassungs-Wizard mit Beispiel-Stammdaten
// (design/ksdata-runner-app.html, Screen 3c) — ohne Supabase.
import { BottomNav } from "@/components/bottom-nav";
import { NewBusinessForm } from "@/app/(portal)/businesses/new/new-business-form";
import type { Category, City } from "@/lib/types";

const cities: City[] = [
  { id: 1, slug: "prishtina", name_sq: "Prishtinë", name_sr: "Priština", name_en: "Pristina", name_de: "Pristina" },
  { id: 2, slug: "skenderaj", name_sq: "Skenderaj", name_sr: "Srbica", name_en: "Skenderaj", name_de: "Skenderaj" },
];

const categories: Category[] = [
  { id: 1, slug: "ndertim", parent_id: null, name_sq: "Ndërtim & Renovim", name_de: "Bau & Renovierung", name_en: "Construction", name_sr: "Građevina", icon: null, sort: 1 },
  { id: 2, slug: "kafene", parent_id: null, name_sq: "Kafene & Ëmbëltore", name_de: "Café & Konditorei", name_en: "Café", name_sr: "Kafić", icon: null, sort: 2 },
];

export default function PreviewFormPage() {
  return (
    <>
      <main className="w-full flex-1 bg-surface pb-28 sm:pb-10">
        <div className="mx-auto max-w-5xl px-4 pt-4">
          <NewBusinessForm cities={cities} categories={categories} />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
