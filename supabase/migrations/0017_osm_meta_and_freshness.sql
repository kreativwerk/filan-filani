-- OSM-Herkunft und Aktualität: Wann wurde der Eintrag in OpenStreetMap zuletzt
-- bearbeitet? Version 1 = seit Anlage nie angefasst.
alter table public.businesses
  add column if not exists osm_id text,
  add column if not exists osm_version int,
  add column if not exists osm_timestamp timestamptz;

create index if not exists businesses_osm_id_idx on public.businesses (osm_id);

-- Ranking neu aufbauen: Datenqualität + Aktualität der Quelle.
-- Generierte Spalten brauchen unveränderliche Ausdrücke, daher feste Stichtage
-- statt now() — die Schwellen sind bei Bedarf per Migration anzupassen.
drop index if exists businesses_rank_idx;
alter table public.businesses drop column if exists completeness;

alter table public.businesses
  add column completeness smallint
  generated always as (
    (case when owner_id is not null then 5 else 0 end)          -- verifizierter Inhaber
    + (case when cover_url is not null then 4 else 0 end)        -- Bild
    + (case when phone is not null and phone <> '' then 3 else 0 end)
    + (case when opening_hours is not null then 2 else 0 end)
    + (case when email is not null and email <> '' then 2 else 0 end)
    + (case when website is not null and website <> '' then 2 else 0 end)
    + (case when description is not null and description <> '' then 2 else 0 end)
    + (case when whatsapp is not null and whatsapp <> '' then 1 else 0 end)
    + (case when viber is not null and viber <> '' then 1 else 0 end)
    + (case when address is not null and address <> '' then 1 else 0 end)
    + (case when lat is not null and lng is not null then 1 else 0 end)
    + (case when cardinality(export_countries) > 0 then 1 else 0 end)
    -- Aktualität: nicht aus OSM (also von Menschen erfasst/gepflegt) zählt als frisch
    + (case
         when osm_timestamp is null then 3
         when osm_timestamp >= timestamptz '2025-01-01' then 3
         when osm_timestamp >= timestamptz '2023-01-01' then 2
         when osm_timestamp >= timestamptz '2021-01-01' then 1
         else 0
       end)
    -- Mehrfach bearbeitete OSM-Einträge sind verlässlicher als Erstanlagen
    + (case when osm_version is not null and osm_version >= 3 then 1 else 0 end)
  ) stored;

create index if not exists businesses_rank_idx
  on public.businesses (city_id, completeness desc, created_at desc);
