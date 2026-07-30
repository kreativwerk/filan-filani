# Filan Filani

Die erste Anlaufstelle für Dienstleistungen und Produkte im Kosovo — für Menschen
vor Ort und die Diaspora. Verzeichnis lokaler Geschäfte, Handwerker-Anfragen,
Produktkataloge, Bewertungen und Chat. Sprachen: Shqip · Deutsch · English ·
Srpski (lateinisch, im Sprachwähler mit jugoslawischer Flagge für SR/BS/HR).

**Phase 0 (dieses Repo, aktueller Stand): „KS Data"** — das Runner-Portal.
Freiberufler/Studenten („Runner") erfassen Geschäfte und verdienen **0,50 € pro
genehmigtem Eintrag**. Die App wird erst gelauncht, wenn genug Daten vorhanden
sind; das Datenmodell ist bereits das finale Modell der Gesamtplattform.

## Tech-Stack

| Ebene | Wahl |
|---|---|
| Framework | **Next.js 16** (App Router) + React 19 + TypeScript |
| Styling | **Tailwind CSS v4** (Design-Tokens in `globals.css`) |
| Übersetzungen | **next-intl** (Cookie-basiert, sq/de/en/sr) |
| Backend | **Supabase** (PostgreSQL, Auth, Storage, später Realtime-Chat) |
| Icons | **lucide-react** |

## Rollen

- **Runner/Scout** — erfasst Geschäfte über KS Data, sieht Dashboard mit Zähler & Verdienst
- **Admin** — gibt Einträge frei / lehnt ab (Gutschrift von 0,50 € erfolgt automatisch per DB-Trigger), kann selbst Betriebe anlegen
- **Nutzer / Betrieb** — Rollen der späteren App, im Schema bereits vorhanden

## Setup

1. **Supabase-Projekt anlegen** (https://supabase.com → New Project, Region `eu-central`).
2. **Migrationen ausführen**: Inhalt von `supabase/migrations/*.sql` in dieser
   Reihenfolge im SQL-Editor ausführen (oder `supabase db push` mit der CLI):
   - `0001_init.sql` — Schema, RLS, Trigger, Storage-Bucket
   - `0002_seed.sql` — 38 Gemeinden + Kategorien
   - `0003_functions.sql` — Rollen-/Duplikat-Funktionen
3. **Auth konfigurieren** (Dashboard → Authentication):
   - Provider **Google** aktivieren (Client-ID/Secret aus der Google Cloud Console)
   - Provider **Facebook** aktivieren (App aus dem Meta-Developer-Portal) — optional zum Start
   - Redirect-URL: `https://<deine-domain>/auth/callback` (und `http://localhost:3000/auth/callback` für lokal)
4. **Env-Datei**: `.env.example` nach `.env.local` kopieren und Werte aus
   *Project Settings → API* eintragen.
5. **Starten**:

```bash
npm install
npm run dev
```

## Admin werden

Nach der eigenen Registrierung im SQL-Editor:

```sql
update public.profiles set role = 'admin' where id = (
  select id from auth.users where email = 'deine@email'
);
```

## Projektstruktur

```
supabase/migrations/   # Vollständiges Plattform-Schema (SQL)
messages/              # Übersetzungen sq/de/en/sr
src/
├─ app/
│  ├─ page.tsx         # KS-Data-Landing (Runner-Anwerbung)
│  ├─ login/ register/ # E-Mail + Google-Login
│  ├─ auth/callback/   # OAuth-Callback (macht Portal-Nutzer zu Scouts)
│  └─ (portal)/
│     ├─ dashboard/    # Zähler, Verdienst, letzte Einträge
│     ├─ businesses/   # Eigene Einträge + Erfassungsformular
│     └─ admin/        # Freigabe-Warteschlange
├─ components/         # UI-Primitives, Sprachwähler (SVG-Flaggen), Header
├─ i18n/               # Locale-Konfiguration (Cookie-basiert)
└─ lib/                # Supabase-Clients, Typen
```

## Roadmap

- **Phase 0** — KS Data (dieses Portal) auf eigener Domain, Datenaufbau
- **Phase 1** — Öffentliche Web-App: Verzeichnis, Suche, Betriebsprofile (SEO), Bewertungen
- **Phase 2** — Anfragen an alle passenden Betriebe + In-App-Chat, Betriebs-Dashboard, Produktkataloge
- **Phase 3** — iOS/Android als **native Expo/React-Native-App** (entschieden: kein Capacitor — die App soll sich vollständig nativ anfühlen). Sie nutzt dasselbe Supabase-Backend und das Filan-Filani-Design-System; die Web-App bleibt für SEO und Desktop. Danach: Monetarisierung (Leads, Premium, Werbung)
