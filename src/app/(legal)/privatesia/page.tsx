import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "../legal-layout";

export const metadata: Metadata = { title: "Privatësia | Filan Filani" };

const TITLE: Record<Locale, string> = {
  sq: "Mbrojtja e të Dhënave",
  de: "Datenschutzerklärung",
  en: "Privacy Policy",
  sr: "Zaštita podataka",
};

const UPDATED: Record<Locale, string> = {
  sq: "Përditësuar: gusht 2026 · Kontrolluesi: Filan Filani Sh.p.k., Prishtinë · info@filan-filani.com",
  de: "Stand: August 2026 · Verantwortliche: Filan Filani Sh.p.k., Prishtina · info@filan-filani.com",
  en: "Updated: August 2026 · Controller: Filan Filani Sh.p.k., Prishtina · info@filan-filani.com",
  sr: "Ažurirano: avgust 2026 · Rukovalac: Filan Filani Sh.p.k., Priština · info@filan-filani.com",
};

const SECTIONS: Record<Locale, LegalSection[]> = {
  sq: [
    {
      h: "1. Baza ligjore",
      p: [
        "Të dhënat personale përpunohen sipas Ligjit Nr. 06/L-082 për Mbrojtjen e të Dhënave Personale të Republikës së Kosovës. Për përdoruesit që ndodhen në BE zbatohet gjithashtu GDPR.",
      ],
    },
    {
      h: "2. Çfarë përpunojmë",
      p: [
        "Llogaria: email, emri, fjalëkalimi (i koduar), qyteti i zgjedhur. Përmbajtja: regjistrime biznesesh, vlerësime, foto, favoritë. Dokumentet e pronësisë (regjistrimi i biznesit, dokumenti i identitetit) ruhen në një hapësirë private dhe fshihen automatikisht pas vendimit. Teknike: cookie funksionale për sesionin, gjuhën dhe qytetin — pa cookie gjurmimi dhe pa reklama të personalizuara.",
      ],
    },
    {
      h: "3. Të dhënat e bizneseve",
      p: [
        "Regjistri përmban të dhëna kontakti biznesesh (emër, adresë, telefon, orari) nga burime publike si OpenStreetMap, nga bashkëpunëtorët tanë dhe nga vetë bizneset. Këto janë të dhëna afariste të destinuara për publikim. Çdo biznes mund të kërkojë korrigjim ose heqje në info@filan-filani.com.",
      ],
    },
    {
      h: "4. Ku ruhen të dhënat",
      p: [
        "Të dhënat ruhen te Supabase (baza e të dhënave, Frankfurt/BE) dhe Vercel (ueb-hostimi). Me këta ofrues ekzistojnë marrëveshje përpunimi sipas standardeve të BE-së.",
      ],
    },
    {
      h: "5. Të drejtat e tua",
      p: [
        "Ke të drejtë qasjeje, korrigjimi, fshirjeje dhe kundërshtimi. Shkruaj në info@filan-filani.com. Mund të ankohesh edhe pranë Agjencisë për Informim dhe Privatësi (AIP) të Republikës së Kosovës.",
      ],
    },
    {
      h: "6. Ruajtja",
      p: [
        "Llogaria ruhet deri në fshirjen e saj. Dokumentet e verifikimit fshihen menjëherë pas vendimit. Regjistrimet e bizneseve mbeten të publikuara si pjesë e regjistrit.",
      ],
    },
  ],
  de: [
    {
      h: "1. Rechtsgrundlage",
      p: [
        "Personenbezogene Daten werden nach dem Gesetz Nr. 06/L-082 über den Schutz personenbezogener Daten der Republik Kosovo verarbeitet. Für Nutzer in der EU gilt ergänzend die DSGVO.",
      ],
    },
    {
      h: "2. Was wir verarbeiten",
      p: [
        "Konto: E-Mail, Name, Passwort (verschlüsselt), gewählte Stadt. Inhalte: Betriebseinträge, Bewertungen, Fotos, Favoriten. Nachweisdokumente für Inhaberschafts-Anträge (Gewerbenachweis, Ausweis) liegen in einem privaten Speicher und werden nach der Entscheidung automatisch gelöscht. Technik: funktionale Cookies für Sitzung, Sprache und Stadt — keine Tracking-Cookies, keine personalisierte Werbung.",
      ],
    },
    {
      h: "3. Betriebsdaten",
      p: [
        "Das Verzeichnis enthält geschäftliche Kontaktdaten (Name, Adresse, Telefon, Öffnungszeiten) aus öffentlichen Quellen wie OpenStreetMap, von unseren Erfassern und von den Betrieben selbst. Es handelt sich um zur Veröffentlichung bestimmte Geschäftsdaten. Jeder Betrieb kann Korrektur oder Entfernung unter info@filan-filani.com verlangen.",
      ],
    },
    {
      h: "4. Wo die Daten liegen",
      p: [
        "Daten werden bei Supabase (Datenbank, Frankfurt/EU) und Vercel (Web-Hosting) gespeichert. Mit diesen Anbietern bestehen Auftragsverarbeitungsverträge nach EU-Standards.",
      ],
    },
    {
      h: "5. Deine Rechte",
      p: [
        "Du hast das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch. Wende dich an info@filan-filani.com. Beschwerden sind zudem bei der Agentur für Information und Privatsphäre (AIP) der Republik Kosovo möglich.",
      ],
    },
    {
      h: "6. Speicherdauer",
      p: [
        "Das Konto bleibt bis zu seiner Löschung gespeichert. Verifizierungsdokumente werden unmittelbar nach der Entscheidung gelöscht. Betriebseinträge bleiben als Teil des Verzeichnisses veröffentlicht.",
      ],
    },
  ],
  en: [
    {
      h: "1. Legal basis",
      p: [
        "Personal data is processed under Law No. 06/L-082 on the Protection of Personal Data of the Republic of Kosovo. For users located in the EU, the GDPR additionally applies.",
      ],
    },
    {
      h: "2. What we process",
      p: [
        "Account: email, name, password (encrypted), chosen city. Content: business entries, reviews, photos, favourites. Ownership-verification documents (business registration, ID) are stored in a private bucket and deleted automatically after the decision. Technical: functional cookies for session, language and city — no tracking cookies, no personalised advertising.",
      ],
    },
    {
      h: "3. Business data",
      p: [
        "The directory contains business contact data (name, address, phone, opening hours) from public sources such as OpenStreetMap, from our field agents and from businesses themselves. This is business data intended for publication. Any business may request correction or removal at info@filan-filani.com.",
      ],
    },
    {
      h: "4. Where data is stored",
      p: [
        "Data is stored with Supabase (database, Frankfurt/EU) and Vercel (web hosting) under EU-standard data-processing agreements.",
      ],
    },
    {
      h: "5. Your rights",
      p: [
        "You have the right to access, rectification, erasure and objection. Contact info@filan-filani.com. You may also lodge a complaint with the Information and Privacy Agency (AIP) of the Republic of Kosovo.",
      ],
    },
    {
      h: "6. Retention",
      p: [
        "Your account is stored until you delete it. Verification documents are deleted immediately after the decision. Business entries remain published as part of the directory.",
      ],
    },
  ],
  sr: [
    {
      h: "1. Pravni osnov",
      p: [
        "Lični podaci se obrađuju prema Zakonu br. 06/L-082 o zaštiti ličnih podataka Republike Kosovo. Za korisnike u EU dodatno važi GDPR.",
      ],
    },
    {
      h: "2. Šta obrađujemo",
      p: [
        "Nalog: email, ime, lozinka (šifrovana), izabrani grad. Sadržaj: unosi firmi, recenzije, fotografije, omiljeno. Dokumenti za potvrdu vlasništva (registracija firme, lični dokument) čuvaju se u privatnom prostoru i automatski se brišu nakon odluke. Tehnika: funkcionalni kolačići za sesiju, jezik i grad — bez kolačića za praćenje i bez personalizovanih reklama.",
      ],
    },
    {
      h: "3. Podaci o firmama",
      p: [
        "Registar sadrži poslovne kontakt podatke (naziv, adresa, telefon, radno vreme) iz javnih izvora poput OpenStreetMap-a, od naših saradnika i od samih firmi. Reč je o poslovnim podacima namenjenim objavi. Svaka firma može zatražiti ispravku ili uklanjanje na info@filan-filani.com.",
      ],
    },
    {
      h: "4. Gde se podaci čuvaju",
      p: [
        "Podaci se čuvaju kod Supabase (baza podataka, Frankfurt/EU) i Vercel (veb-hosting), uz ugovore o obradi po EU standardima.",
      ],
    },
    {
      h: "5. Tvoja prava",
      p: [
        "Imaš pravo na pristup, ispravku, brisanje i prigovor. Piši na info@filan-filani.com. Žalbu možeš podneti i Agenciji za informacije i privatnost (AIP) Republike Kosovo.",
      ],
    },
    {
      h: "6. Čuvanje",
      p: [
        "Nalog se čuva do brisanja. Dokumenti za verifikaciju brišu se odmah nakon odluke. Unosi firmi ostaju objavljeni kao deo registra.",
      ],
    },
  ],
};

export default async function PrivacyPage() {
  const locale = (await getLocale()) as Locale;
  return (
    <LegalPage
      title={TITLE[locale]}
      updated={UPDATED[locale]}
      sections={SECTIONS[locale]}
    />
  );
}
