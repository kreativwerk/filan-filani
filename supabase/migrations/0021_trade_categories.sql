-- Anfragen (AroundHome-Modell) gelten nur für handwerkliche Dienstleistungen.
-- Kennzeichnung an der Kategorie, damit die Liste ohne Code-Änderung anpassbar ist.
alter table public.categories
  add column if not exists is_trade boolean not null default false;

update public.categories set is_trade = true
where slug in (
  'ndertim',        -- Bau & Renovierung
  'elektricist',    -- Elektriker
  'hidraulik',      -- Klempner / Sanitär
  'klima-ngrohje',  -- Klima & Heizung
  'mobileri',       -- Möbel, Schreiner
  'pastrim',        -- Reinigung
  'auto-servis',    -- Autowerkstatt
  'transport'       -- Transport & Umzug
);
