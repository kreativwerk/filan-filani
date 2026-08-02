-- B2B-Grundlage: Betriebe geben an, in welche Länder sie auch liefern/leisten.
-- Vordefinierte Länder als ISO-Codes (DE, AT, CH, SE, FI, IT, AL),
-- frei ergänzte Länder als Klartext im selben Array.
alter table public.businesses
  add column if not exists export_countries text[] not null default '{}';

create index if not exists businesses_export_countries_idx
  on public.businesses using gin (export_countries);

-- Inhaber dürfen ihren übernommenen Betrieb selbst bearbeiten
create policy "businesses: inhaber bearbeitet eigenen" on public.businesses
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
