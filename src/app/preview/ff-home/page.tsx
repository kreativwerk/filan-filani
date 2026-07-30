// Design-QA-Vorschau: Filan-Filani-Home (Design 1a) mit den Demo-Daten aus
// design/filan-filani-screens.html — ohne Supabase.
import { FFShell } from "@/components/ff/shell";
import { FFHomeView, type FFHomeData } from "@/components/ff/home-view";

const demo: FFHomeData = {
  signedIn: true,
  userName: "Albert Krasniqi",
  city: { slug: "prishtina", label: "Prishtinë" },
  cities: [
    { slug: "prishtina", label: "Prishtinë" },
    { slug: "prizren", label: "Prizren" },
    { slug: "peja", label: "Pejë" },
    { slug: "gjakova", label: "Gjakovë" },
  ],
  categories: [
    { slug: "restorant", label: "Gastro", icon: "utensils" },
    { slug: "shitore", label: "Dyqane", icon: "shopping-bag" },
    { slug: "ndertim", label: "Shërbime", icon: "wrench" },
    { slug: "auto-servis", label: "Auto", icon: "car" },
    { slug: "hotel", label: "Hotel", icon: "bed-double" },
  ],
  businesses: [
    {
      key: "1",
      href: "/app/biz/metton-reklama-prishtina",
      name: "Metton Reklama",
      meta: "Reklamë · Prishtinë",
      cover: null,
      verified: true,
      rating: 5.0,
      ratingCount: 312,
    },
    {
      key: "2",
      href: "/app/biz/urban-style-prishtina",
      name: "Urban Style",
      meta: "Dyqan · Prishtinë",
      cover: null,
      verified: false,
      rating: null,
      ratingCount: 0,
    },
  ],
};

export default function FFHomePreviewPage() {
  return (
    <FFShell citySlug="prishtina">
      <FFHomeView data={demo} />
    </FFShell>
  );
}
