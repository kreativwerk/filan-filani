-- Auszahlungsdaten der Runner (IBAN, Kontoinhaber, Rechnungs-E-Mail).
-- Sensible Finanzdaten: profiles ist bereits nur für den Besitzer selbst und
-- für Admins lesbar (Policy "profiles: eigenes lesen"), daher kein Extra-Schutz nötig.
alter table public.profiles
  add column if not exists iban text,
  add column if not exists bank_holder text,
  add column if not exists billing_email text,
  add column if not exists billing_address text;

-- Grobe Formatprüfung: 2 Buchstaben Ländercode + 2 Prüfziffern + 11–30 Zeichen
alter table public.profiles
  drop constraint if exists profiles_iban_format;
alter table public.profiles
  add constraint profiles_iban_format
  check (iban is null or iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$');
