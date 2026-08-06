/* Fragen pro Gewerk für den Anfrage-Assistenten (Vorbild AroundHome/MyHammer):
   wenige, aber entscheidende Fragen, die ein Handwerker braucht, um zu
   erkennen, ob ein Auftrag zu ihm passt. Bewusst hier statt in messages/*.json
   — die Antworten sind Datenwerte, die Beschriftung hängt am Katalog. */

import type { Locale } from "@/i18n/config";

export type TradeLabel = Record<Locale, string>;

export type TradeOption = { value: string; label: TradeLabel };

export type TradeQuestion = {
  key: string;
  label: TradeLabel;
  options: TradeOption[];
};

const OBJECT: TradeQuestion = {
  key: "object",
  label: {
    sq: "Për çfarë objekti bëhet fjalë?",
    de: "Um welches Objekt geht es?",
    en: "What kind of property is it?",
    sr: "O kakvom se objektu radi?",
  },
  options: [
    {
      value: "house",
      label: { sq: "Shtëpi", de: "Haus", en: "House", sr: "Kuća" },
    },
    {
      value: "apartment",
      label: { sq: "Banesë", de: "Wohnung", en: "Apartment", sr: "Stan" },
    },
    {
      value: "business",
      label: {
        sq: "Objekt biznesi",
        de: "Gewerbeobjekt",
        en: "Commercial property",
        sr: "Poslovni prostor",
      },
    },
    {
      value: "new",
      label: {
        sq: "Ndërtim i ri",
        de: "Neubau",
        en: "New build",
        sr: "Novogradnja",
      },
    },
  ],
};

/** Fragen je Kategorie-Slug. Erste Frage immer das Objekt — danach das,
 *  was für das jeweilige Gewerk den Aufwand bestimmt. */
export const TRADE_QUESTIONS: Record<string, TradeQuestion[]> = {
  ndertim: [
    OBJECT,
    {
      key: "scope",
      label: {
        sq: "Sa i madh është projekti?",
        de: "Wie groß ist das Vorhaben?",
        en: "How big is the project?",
        sr: "Koliki je obim radova?",
      },
      options: [
        {
          value: "room",
          label: {
            sq: "Një dhomë",
            de: "Einzelner Raum",
            en: "A single room",
            sr: "Jedna prostorija",
          },
        },
        {
          value: "floor",
          label: {
            sq: "Një kat",
            de: "Eine Etage",
            en: "One floor",
            sr: "Jedan sprat",
          },
        },
        {
          value: "whole",
          label: {
            sq: "I gjithë objekti",
            de: "Komplettes Objekt",
            en: "The whole property",
            sr: "Ceo objekat",
          },
        },
        {
          value: "extension",
          label: {
            sq: "Shtesë / zgjerim",
            de: "Anbau / Erweiterung",
            en: "Extension",
            sr: "Dogradnja",
          },
        },
      ],
    },
  ],

  bojatis: [
    OBJECT,
    {
      key: "where",
      label: {
        sq: "Ku duhet punuar?",
        de: "Wo soll gearbeitet werden?",
        en: "Where is the work needed?",
        sr: "Gde se radi?",
      },
      options: [
        {
          value: "interior",
          label: { sq: "Brenda", de: "Innen", en: "Interior", sr: "Unutra" },
        },
        {
          value: "exterior",
          label: { sq: "Fasadë", de: "Fassade", en: "Facade", sr: "Fasada" },
        },
        {
          value: "both",
          label: { sq: "Të dyja", de: "Beides", en: "Both", sr: "Oboje" },
        },
      ],
    },
    {
      key: "area",
      label: {
        sq: "Sa sipërfaqe përafërsisht?",
        de: "Wie viel Fläche ungefähr?",
        en: "Roughly how much area?",
        sr: "Približna površina?",
      },
      options: [
        { value: "lt50", label: { sq: "Deri 50 m²", de: "Bis 50 m²", en: "Up to 50 m²", sr: "Do 50 m²" } },
        { value: "50_150", label: { sq: "50–150 m²", de: "50–150 m²", en: "50–150 m²", sr: "50–150 m²" } },
        { value: "gt150", label: { sq: "Mbi 150 m²", de: "Über 150 m²", en: "Over 150 m²", sr: "Preko 150 m²" } },
      ],
    },
  ],

  elektricist: [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë duhet bërë?",
        de: "Was steht an?",
        en: "What needs doing?",
        sr: "Šta je potrebno?",
      },
      options: [
        {
          value: "new",
          label: {
            sq: "Instalim i ri",
            de: "Neuinstallation",
            en: "New installation",
            sr: "Nova instalacija",
          },
        },
        {
          value: "repair",
          label: {
            sq: "Riparim / defekt",
            de: "Reparatur / Störung",
            en: "Repair / fault",
            sr: "Popravka / kvar",
          },
        },
        {
          value: "upgrade",
          label: {
            sq: "Zgjerim i instalimit",
            de: "Erweiterung",
            en: "Extending the wiring",
            sr: "Proširenje instalacije",
          },
        },
        {
          value: "smart",
          label: {
            sq: "Smart home / ndriçim",
            de: "Smart Home / Beleuchtung",
            en: "Smart home / lighting",
            sr: "Pametna kuća / rasveta",
          },
        },
      ],
    },
  ],

  hidraulik: [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë duhet bërë?",
        de: "Was steht an?",
        en: "What needs doing?",
        sr: "Šta je potrebno?",
      },
      options: [
        {
          value: "leak",
          label: {
            sq: "Rrjedhje / riparim",
            de: "Leck / Reparatur",
            en: "Leak / repair",
            sr: "Curenje / popravka",
          },
        },
        {
          value: "bathroom",
          label: {
            sq: "Banjo e re",
            de: "Neues Bad",
            en: "New bathroom",
            sr: "Novo kupatilo",
          },
        },
        {
          value: "install",
          label: {
            sq: "Instalim i ri",
            de: "Neuinstallation",
            en: "New installation",
            sr: "Nova instalacija",
          },
        },
        {
          value: "drain",
          label: {
            sq: "Zhbllokim i gypave",
            de: "Rohrreinigung",
            en: "Drain unblocking",
            sr: "Odčepljivanje cevi",
          },
        },
      ],
    },
  ],

  "klima-ngrohje": [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë duhet bërë?",
        de: "Was steht an?",
        en: "What needs doing?",
        sr: "Šta je potrebno?",
      },
      options: [
        {
          value: "heating_new",
          label: {
            sq: "Ngrohje e re",
            de: "Neue Heizung",
            en: "New heating system",
            sr: "Novo grejanje",
          },
        },
        {
          value: "heating_service",
          label: {
            sq: "Servis / riparim ngrohjeje",
            de: "Wartung / Reparatur",
            en: "Service / repair",
            sr: "Servis / popravka",
          },
        },
        {
          value: "ac",
          label: {
            sq: "Kondicioner",
            de: "Klimaanlage",
            en: "Air conditioning",
            sr: "Klima uređaj",
          },
        },
        {
          value: "floor",
          label: {
            sq: "Ngrohje nën dysheme",
            de: "Fußbodenheizung",
            en: "Underfloor heating",
            sr: "Podno grejanje",
          },
        },
      ],
    },
    {
      key: "energy",
      label: {
        sq: "Me çfarë ngrohet?",
        de: "Womit wird geheizt?",
        en: "What is the energy source?",
        sr: "Čime se greje?",
      },
      options: [
        { value: "pellet", label: { sq: "Pelet / dru", de: "Pellet / Holz", en: "Pellets / wood", sr: "Pelet / drva" } },
        { value: "pump", label: { sq: "Pompë ngrohjeje", de: "Wärmepumpe", en: "Heat pump", sr: "Toplotna pumpa" } },
        { value: "electric", label: { sq: "Rrymë", de: "Strom", en: "Electricity", sr: "Struja" } },
        { value: "unknown", label: { sq: "Ende s'e di", de: "Weiß ich noch nicht", en: "Not decided yet", sr: "Još ne znam" } },
      ],
    },
  ],

  solar: [
    OBJECT,
    {
      key: "purpose",
      label: {
        sq: "Për çfarë ju duhet solari?",
        de: "Wofür brauchen Sie die Solaranlage?",
        en: "What do you need solar for?",
        sr: "Za šta vam treba solar?",
      },
      options: [
        {
          value: "power",
          label: {
            sq: "Rrymë (fotovoltaikë)",
            de: "Strom (Photovoltaik)",
            en: "Electricity (PV)",
            sr: "Struja (fotonapon)",
          },
        },
        {
          value: "water",
          label: {
            sq: "Ujë i ngrohtë",
            de: "Warmwasser",
            en: "Hot water",
            sr: "Topla voda",
          },
        },
        {
          value: "battery",
          label: {
            sq: "Me bateri ruajtëse",
            de: "Mit Speicher",
            en: "With battery storage",
            sr: "Sa baterijom",
          },
        },
      ],
    },
    {
      key: "size",
      label: {
        sq: "Sa e madhe duhet të jetë?",
        de: "Wie groß soll die Anlage sein?",
        en: "How large should it be?",
        sr: "Koliko velika instalacija?",
      },
      options: [
        { value: "lt5", label: { sq: "Deri 5 kWp", de: "Bis 5 kWp", en: "Up to 5 kWp", sr: "Do 5 kWp" } },
        { value: "5_10", label: { sq: "5–10 kWp", de: "5–10 kWp", en: "5–10 kWp", sr: "5–10 kWp" } },
        { value: "gt10", label: { sq: "Mbi 10 kWp", de: "Über 10 kWp", en: "Over 10 kWp", sr: "Preko 10 kWp" } },
        { value: "unknown", label: { sq: "Nuk e di", de: "Weiß ich nicht", en: "Not sure", sr: "Ne znam" } },
      ],
    },
  ],

  kulme: [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë duhet bërë?",
        de: "Was steht an?",
        en: "What needs doing?",
        sr: "Šta je potrebno?",
      },
      options: [
        {
          value: "new",
          label: {
            sq: "Kulm i ri",
            de: "Neues Dach",
            en: "New roof",
            sr: "Novi krov",
          },
        },
        {
          value: "repair",
          label: {
            sq: "Riparim / rrjedhje",
            de: "Reparatur / undicht",
            en: "Repair / leak",
            sr: "Popravka / prokišnjava",
          },
        },
        {
          value: "insulation",
          label: {
            sq: "Izolim",
            de: "Dämmung",
            en: "Insulation",
            sr: "Izolacija",
          },
        },
        {
          value: "gutter",
          label: {
            sq: "Ulluqe",
            de: "Dachrinne",
            en: "Gutters",
            sr: "Oluci",
          },
        },
      ],
    },
  ],

  "dritare-dyer": [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë ju duhet?",
        de: "Was brauchen Sie?",
        en: "What do you need?",
        sr: "Šta vam treba?",
      },
      options: [
        { value: "windows", label: { sq: "Dritare", de: "Fenster", en: "Windows", sr: "Prozori" } },
        { value: "doors", label: { sq: "Dyer", de: "Türen", en: "Doors", sr: "Vrata" } },
        { value: "both", label: { sq: "Të dyja", de: "Beides", en: "Both", sr: "Oboje" } },
        {
          value: "garage",
          label: {
            sq: "Portë garazhi",
            de: "Garagentor",
            en: "Garage door",
            sr: "Garažna vrata",
          },
        },
      ],
    },
    {
      key: "count",
      label: {
        sq: "Sa copë?",
        de: "Wie viele Stück?",
        en: "How many?",
        sr: "Koliko komada?",
      },
      options: [
        { value: "1_2", label: { sq: "1–2", de: "1–2", en: "1–2", sr: "1–2" } },
        { value: "3_5", label: { sq: "3–5", de: "3–5", en: "3–5", sr: "3–5" } },
        { value: "6_10", label: { sq: "6–10", de: "6–10", en: "6–10", sr: "6–10" } },
        { value: "gt10", label: { sq: "Mbi 10", de: "Über 10", en: "Over 10", sr: "Preko 10" } },
      ],
    },
  ],

  pllakosje: [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë dysheme?",
        de: "Welcher Belag?",
        en: "Which surface?",
        sr: "Kakva obloga?",
      },
      options: [
        { value: "tiles", label: { sq: "Pllaka", de: "Fliesen", en: "Tiles", sr: "Pločice" } },
        {
          value: "parquet",
          label: {
            sq: "Parket / laminat",
            de: "Parkett / Laminat",
            en: "Parquet / laminate",
            sr: "Parket / laminat",
          },
        },
        {
          value: "other",
          label: { sq: "Tjetër", de: "Anderes", en: "Something else", sr: "Drugo" },
        },
      ],
    },
    {
      key: "area",
      label: {
        sq: "Sa sipërfaqe përafërsisht?",
        de: "Wie viel Fläche ungefähr?",
        en: "Roughly how much area?",
        sr: "Približna površina?",
      },
      options: [
        { value: "lt20", label: { sq: "Deri 20 m²", de: "Bis 20 m²", en: "Up to 20 m²", sr: "Do 20 m²" } },
        { value: "20_60", label: { sq: "20–60 m²", de: "20–60 m²", en: "20–60 m²", sr: "20–60 m²" } },
        { value: "gt60", label: { sq: "Mbi 60 m²", de: "Über 60 m²", en: "Over 60 m²", sr: "Preko 60 m²" } },
      ],
    },
  ],

  mobileri: [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë ju duhet?",
        de: "Was brauchen Sie?",
        en: "What do you need?",
        sr: "Šta vam treba?",
      },
      options: [
        { value: "kitchen", label: { sq: "Kuzhinë", de: "Küche", en: "Kitchen", sr: "Kuhinja" } },
        {
          value: "wardrobe",
          label: {
            sq: "Dollap me porosi",
            de: "Einbauschrank",
            en: "Fitted wardrobe",
            sr: "Ugradni plakar",
          },
        },
        {
          value: "interior",
          label: {
            sq: "Mobilim i brendshëm",
            de: "Innenausbau",
            en: "Interior fit-out",
            sr: "Unutrašnje uređenje",
          },
        },
        {
          value: "repair",
          label: {
            sq: "Riparim mobiliesh",
            de: "Möbelreparatur",
            en: "Furniture repair",
            sr: "Popravka nameštaja",
          },
        },
      ],
    },
  ],

  metalpunues: [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë duhet punuar?",
        de: "Was soll gefertigt werden?",
        en: "What should be built?",
        sr: "Šta treba izraditi?",
      },
      options: [
        {
          value: "railing",
          label: {
            sq: "Gardh / parmakë",
            de: "Zaun / Geländer",
            en: "Fence / railing",
            sr: "Ograda / rukohvat",
          },
        },
        {
          value: "alu",
          label: {
            sq: "Dyer & dritare alumini",
            de: "Alu-Türen & -Fenster",
            en: "Aluminium doors & windows",
            sr: "Alu vrata i prozori",
          },
        },
        {
          value: "canopy",
          label: {
            sq: "Strehë / pergolë",
            de: "Vordach / Pergola",
            en: "Canopy / pergola",
            sr: "Nadstrešnica / pergola",
          },
        },
        {
          value: "other",
          label: {
            sq: "Konstruksion tjetër",
            de: "Andere Konstruktion",
            en: "Other structure",
            sr: "Druga konstrukcija",
          },
        },
      ],
    },
  ],

  "kopsht-oborr": [
    OBJECT,
    {
      key: "kind",
      label: {
        sq: "Çfarë duhet bërë në oborr?",
        de: "Was steht draußen an?",
        en: "What needs doing outside?",
        sr: "Šta je potrebno u dvorištu?",
      },
      options: [
        {
          value: "design",
          label: {
            sq: "Rregullim i kopshtit",
            de: "Gartengestaltung",
            en: "Garden design",
            sr: "Uređenje bašte",
          },
        },
        {
          value: "lawn",
          label: {
            sq: "Bar & mirëmbajtje",
            de: "Rasen & Pflege",
            en: "Lawn & upkeep",
            sr: "Travnjak i održavanje",
          },
        },
        {
          value: "paving",
          label: {
            sq: "Kubëza & shtigje",
            de: "Pflaster & Wege",
            en: "Paving & paths",
            sr: "Popločavanje i staze",
          },
        },
        {
          value: "fence",
          label: {
            sq: "Gardh & portë",
            de: "Zaun & Tor",
            en: "Fence & gate",
            sr: "Ograda i kapija",
          },
        },
      ],
    },
  ],
};

export function tradeQuestions(slug: string | null | undefined): TradeQuestion[] {
  return (slug && TRADE_QUESTIONS[slug]) || [];
}

/** Antworten (jsonb aus service_requests.details) in lesbare Paare übersetzen. */
export function describeDetails(
  slug: string | null | undefined,
  details: Record<string, string> | null | undefined,
  locale: Locale,
): { question: string; answer: string }[] {
  if (!details) return [];
  const out: { question: string; answer: string }[] = [];
  for (const q of tradeQuestions(slug)) {
    const value = details[q.key];
    if (!value) continue;
    const option = q.options.find((o) => o.value === value);
    if (!option) continue;
    out.push({ question: q.label[locale], answer: option.label[locale] });
  }
  return out;
}
