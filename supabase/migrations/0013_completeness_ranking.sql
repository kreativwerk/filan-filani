-- Ranking nach Datenqualität: je vollständiger ein Eintrag, desto weiter oben.
-- Wird von Postgres automatisch mitgeführt (generierte Spalte) — kein Pflegeaufwand.
alter table public.businesses
  add column if not exists completeness smallint
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
  ) stored;

create index if not exists businesses_rank_idx
  on public.businesses (city_id, completeness desc, created_at desc);
