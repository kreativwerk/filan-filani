import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { LegalPage, type LegalSection } from "../legal-layout";

export const metadata: Metadata = { title: "Kushtet e Përdorimit | Filan Filani" };

const TITLE: Record<Locale, string> = {
  sq: "Kushtet e Përdorimit",
  de: "Nutzungsbedingungen",
  en: "Terms of Use",
  sr: "Uslovi korišćenja",
};

const UPDATED: Record<Locale, string> = {
  sq: "Përditësuar: gusht 2026 · Filan Filani Sh.p.k., Prishtinë, Republika e Kosovës",
  de: "Stand: August 2026 · Filan Filani Sh.p.k., Prishtina, Republik Kosovo",
  en: "Updated: August 2026 · Filan Filani Sh.p.k., Prishtina, Republic of Kosovo",
  sr: "Ažurirano: avgust 2026 · Filan Filani Sh.p.k., Priština, Republika Kosovo",
};

const SECTIONS: Record<Locale, LegalSection[]> = {
  sq: [
    {
      h: "1. Operatori",
      p: [
        "Platforma Filan Filani dhe portali KS Data operohen nga Filan Filani Sh.p.k., me seli në Prishtinë, Republika e Kosovës („Operatori“). Kontakt: info@filan-filani.com.",
      ],
    },
    {
      h: "2. Shërbimi",
      p: [
        "Filan Filani është një regjistër biznesesh dhe shërbimesh për Kosovën dhe diasporën. Përdorimi është falas. Të dhënat e bizneseve mblidhen nga burime publike (ndër to OpenStreetMap, © OpenStreetMap contributors, ODbL), nga bashkëpunëtorë tanë dhe nga vetë bizneset e përdoruesit.",
      ],
    },
    {
      h: "3. Llogaria",
      p: [
        "Regjistrimi kërkon një adresë email-i të vlefshme. Je përgjegjës për ruajtjen e fjalëkalimit tënd. Llogaritë me të dhëna të rreme mund të mbyllen.",
      ],
    },
    {
      h: "4. Përmbajtja e përdoruesve",
      p: [
        "Regjistrimet e bizneseve, vlerësimet, fotot dhe të dhënat e tjera duhet të jenë të vërteta dhe të mos cenojnë të drejtat e të tretëve. Vlerësimet e rreme, përmbajtja fyese ose e paligjshme fshihen dhe mund të çojnë në mbylljen e llogarisë. Operatori shqyrton regjistrimet para publikimit, por nuk garanton saktësinë e të dhënave të bizneseve.",
      ],
    },
    {
      h: "5. Pronësia e bizneseve",
      p: [
        "Marrja në pronësi e një profili biznesi kërkon dëshmi (regjistrimi i biznesit dhe dokument identifikimi). Dokumentet përdoren vetëm për verifikim dhe fshihen pas vendimit.",
      ],
    },
    {
      h: "6. Përgjegjësia",
      p: [
        "Platforma ofrohet „siç është“. Operatori nuk përgjigjet për saktësinë e të dhënave të publikuara nga të tretët, për disponueshmërinë e pandërprerë të shërbimit, apo për marrëdhëniet kontraktuale mes përdoruesve dhe bizneseve.",
      ],
    },
    {
      h: "7. E drejta e zbatueshme",
      p: [
        "Zbatohet e drejta e Republikës së Kosovës. Vendi i gjykimit është Prishtina, për aq sa lejohet me ligj.",
      ],
    },
  ],
  de: [
    {
      h: "1. Betreiberin",
      p: [
        "Die Plattform Filan Filani und das Portal KS Data werden betrieben von der Filan Filani Sh.p.k. mit Sitz in Prishtina, Republik Kosovo („Betreiberin“). Kontakt: info@filan-filani.com.",
      ],
    },
    {
      h: "2. Dienst",
      p: [
        "Filan Filani ist ein Verzeichnis für Betriebe und Dienstleistungen im Kosovo und für die Diaspora. Die Nutzung ist kostenlos. Betriebsdaten stammen aus öffentlichen Quellen (u. a. OpenStreetMap, © OpenStreetMap contributors, ODbL), von unseren Erfassern sowie von Betrieben und Nutzern selbst.",
      ],
    },
    {
      h: "3. Konto",
      p: [
        "Die Registrierung erfordert eine gültige E-Mail-Adresse. Für die Geheimhaltung des Passworts bist du selbst verantwortlich. Konten mit falschen Angaben können geschlossen werden.",
      ],
    },
    {
      h: "4. Nutzerinhalte",
      p: [
        "Betriebseinträge, Bewertungen, Fotos und sonstige Angaben müssen wahr sein und dürfen keine Rechte Dritter verletzen. Gefälschte Bewertungen sowie beleidigende oder rechtswidrige Inhalte werden entfernt und können zur Kontosperrung führen. Die Betreiberin prüft Einträge vor der Veröffentlichung, übernimmt aber keine Gewähr für die Richtigkeit von Betriebsdaten.",
      ],
    },
    {
      h: "5. Inhaberschaft von Betrieben",
      p: [
        "Die Übernahme eines Betriebsprofils erfordert Nachweise (Gewerbenachweis und Ausweisdokument). Die Dokumente dienen ausschließlich der Prüfung und werden nach der Entscheidung gelöscht.",
      ],
    },
    {
      h: "6. Haftung",
      p: [
        "Die Plattform wird „wie besehen“ bereitgestellt. Die Betreiberin haftet nicht für die Richtigkeit von Drittangaben, für die ununterbrochene Verfügbarkeit des Dienstes oder für Vertragsbeziehungen zwischen Nutzern und Betrieben.",
      ],
    },
    {
      h: "7. Anwendbares Recht",
      p: [
        "Es gilt das Recht der Republik Kosovo. Gerichtsstand ist, soweit gesetzlich zulässig, Prishtina.",
      ],
    },
  ],
  en: [
    {
      h: "1. Operator",
      p: [
        "The Filan Filani platform and the KS Data portal are operated by Filan Filani Sh.p.k., seated in Prishtina, Republic of Kosovo (the “Operator”). Contact: info@filan-filani.com.",
      ],
    },
    {
      h: "2. Service",
      p: [
        "Filan Filani is a directory of businesses and services for Kosovo and its diaspora. Use is free of charge. Business data comes from public sources (including OpenStreetMap, © OpenStreetMap contributors, ODbL), from our field agents, and from businesses and users themselves.",
      ],
    },
    {
      h: "3. Account",
      p: [
        "Registration requires a valid email address. You are responsible for keeping your password confidential. Accounts with false information may be closed.",
      ],
    },
    {
      h: "4. User content",
      p: [
        "Business entries, reviews, photos and other submissions must be truthful and must not infringe third-party rights. Fake reviews and offensive or unlawful content will be removed and may lead to account suspension. The Operator reviews entries before publication but does not guarantee the accuracy of business data.",
      ],
    },
    {
      h: "5. Business ownership",
      p: [
        "Claiming a business profile requires proof (business registration and an identity document). Documents are used solely for verification and are deleted after the decision.",
      ],
    },
    {
      h: "6. Liability",
      p: [
        "The platform is provided “as is”. The Operator is not liable for the accuracy of third-party data, for uninterrupted availability of the service, or for contractual relationships between users and businesses.",
      ],
    },
    {
      h: "7. Governing law",
      p: [
        "The law of the Republic of Kosovo applies. The place of jurisdiction, where legally permissible, is Prishtina.",
      ],
    },
  ],
  sr: [
    {
      h: "1. Operater",
      p: [
        "Platformu Filan Filani i portal KS Data vodi Filan Filani Sh.p.k. sa sedištem u Prištini, Republika Kosovo („Operater“). Kontakt: info@filan-filani.com.",
      ],
    },
    {
      h: "2. Usluga",
      p: [
        "Filan Filani je registar firmi i usluga za Kosovo i dijasporu. Korišćenje je besplatno. Podaci o firmama potiču iz javnih izvora (između ostalog OpenStreetMap, © OpenStreetMap contributors, ODbL), od naših saradnika i od samih firmi i korisnika.",
      ],
    },
    {
      h: "3. Nalog",
      p: [
        "Registracija zahteva važeću email adresu. Sam si odgovoran za čuvanje svoje lozinke. Nalozi sa lažnim podacima mogu biti zatvoreni.",
      ],
    },
    {
      h: "4. Sadržaj korisnika",
      p: [
        "Unosi firmi, recenzije, fotografije i drugi podaci moraju biti istiniti i ne smeju kršiti prava trećih lica. Lažne recenzije i uvredljiv ili nezakonit sadržaj se uklanjaju i mogu dovesti do blokiranja naloga. Operater proverava unose pre objave, ali ne garantuje tačnost podataka o firmama.",
      ],
    },
    {
      h: "5. Vlasništvo nad firmama",
      p: [
        "Preuzimanje profila firme zahteva dokaze (registracija firme i lični dokument). Dokumenti služe isključivo za proveru i brišu se nakon odluke.",
      ],
    },
    {
      h: "6. Odgovornost",
      p: [
        "Platforma se pruža „takva kakva jeste“. Operater ne odgovara za tačnost podataka trećih lica, za neprekidnu dostupnost usluge, niti za ugovorne odnose između korisnika i firmi.",
      ],
    },
    {
      h: "7. Merodavno pravo",
      p: [
        "Primenjuje se pravo Republike Kosovo. Mesto nadležnosti je, u zakonski dozvoljenoj meri, Priština.",
      ],
    },
  ],
};

export default async function TermsPage() {
  const locale = (await getLocale()) as Locale;
  return (
    <LegalPage
      title={TITLE[locale]}
      updated={UPDATED[locale]}
      sections={SECTIONS[locale]}
    />
  );
}
