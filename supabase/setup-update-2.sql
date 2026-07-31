-- KS Data / Filan Filani — Update-Paket 2 (Migrationen 0004–0007)
-- Einfach komplett in den Supabase SQL Editor einfügen und einmal ausführen.


-- ============================================================
-- 0004_slugs_search
-- ============================================================
-- Verzeichnis-Grundlagen: URL-Slugs für Betriebe + tippfehlertolerante Suche

create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- "Auto Servis Besniku" -> "auto-servis-besniku" (ë->e usw. via unaccent)
create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(unaccent(coalesce(input, ''))),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

-- Slug bei Freigabe automatisch vergeben: name-stadt, bei Kollision + Kurz-ID
create or replace function public.ensure_business_slug()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base text;
  candidate text;
begin
  if new.status = 'approved' and new.slug is null then
    select public.slugify(new.name || '-' || c.slug)
      into base
      from public.cities c
     where c.id = new.city_id;
    candidate := base;
    if exists (select 1 from public.businesses where slug = candidate and id <> new.id) then
      candidate := base || '-' || substr(new.id::text, 1, 4);
    end if;
    new.slug := candidate;
  end if;
  return new;
end;
$$;

create trigger on_business_slug
  before insert or update on public.businesses
  for each row execute function public.ensure_business_slug();

-- Bereits freigegebene Betriebe nachträglich mit Slugs versorgen
update public.businesses set updated_at = updated_at where status = 'approved' and slug is null;

-- Trigram-Index für fuzzy Suche auf Namen
create index if not exists businesses_name_trgm_idx
  on public.businesses using gin (name gin_trgm_ops);

-- Volltext-/Fuzzy-Suche über freigegebene Betriebe (RLS-konform: nur approved)
create or replace function public.search_businesses(
  q text,
  p_city int default null,
  p_category int default null,
  p_limit int default 30
)
returns setof public.businesses
language sql
stable
security invoker
as $$
  select b.*
  from public.businesses b
  where b.status = 'approved'
    and (p_city is null or b.city_id = p_city)
    and (p_category is null or exists (
      select 1 from public.business_categories bc
      where bc.business_id = b.id and bc.category_id = p_category
    ))
    and (
      q is null or q = ''
      or b.name ilike '%' || q || '%'
      or similarity(b.name, q) > 0.25
      or b.description ilike '%' || q || '%'
      or exists (
        select 1
        from public.business_categories bc
        join public.categories c on c.id = bc.category_id
        where bc.business_id = b.id
          and (c.name_sq ilike '%' || q || '%' or c.name_de ilike '%' || q || '%'
               or c.name_en ilike '%' || q || '%' or c.name_sr ilike '%' || q || '%')
      )
    )
  order by
    case when q is not null and q <> '' then similarity(b.name, q) else 0 end desc,
    b.created_at desc
  limit least(coalesce(p_limit, 30), 100);
$$;

-- ============================================================
-- 0005_city_coords
-- ============================================================
-- Stadtzentren für Umkreis-Importe (OpenStreetMap) und spätere "In meiner Nähe"-Suche
alter table public.cities add column if not exists lat double precision;
alter table public.cities add column if not exists lng double precision;

update public.cities set lat = v.lat, lng = v.lng
from (values
  ('prishtina', 42.6629, 21.1655), ('prizren', 42.2139, 20.7397),
  ('peja', 42.6593, 20.2887), ('gjakova', 42.3803, 20.4308),
  ('mitrovica', 42.8914, 20.8660), ('mitrovica-veriore', 42.8988, 20.8623),
  ('ferizaj', 42.3702, 21.1483), ('gjilan', 42.4635, 21.4694),
  ('podujeva', 42.9106, 21.1930), ('vushtrri', 42.8231, 20.9675),
  ('suhareka', 42.3585, 20.8250), ('rahovec', 42.3994, 20.6547),
  ('drenas', 42.6236, 20.8939), ('lipjan', 42.5217, 21.1258),
  ('malisheva', 42.4844, 20.7458), ('kamenica', 42.5781, 21.5803),
  ('viti', 42.3214, 21.3583), ('decan', 42.5403, 20.2875),
  ('istog', 42.7808, 20.4875), ('klina', 42.6203, 20.5775),
  ('skenderaj', 42.7469, 20.7886), ('dragash', 42.0611, 20.6528),
  ('fushe-kosova', 42.6300, 21.0958), ('kacanik', 42.2319, 21.2594),
  ('shtime', 42.4331, 21.0397), ('obiliq', 42.6869, 21.0700),
  ('junik', 42.4761, 20.2775), ('hani-i-elezit', 42.1503, 21.2961),
  ('mamusha', 42.3247, 20.7225), ('gracanica', 42.5989, 21.1942),
  ('ranillug', 42.4922, 21.5533), ('partesh', 42.4022, 21.4336),
  ('kllokot', 42.3672, 21.3744), ('novoberda', 42.6167, 21.4333),
  ('shterpca', 42.2394, 21.0272), ('zubin-potok', 42.9147, 20.6897),
  ('zvecan', 42.9075, 20.8400), ('leposaviq', 43.1039, 20.8017)
) as v(slug, lat, lng)
where cities.slug = v.slug;

-- ============================================================
-- 0006_claims
-- ============================================================
-- Inhaberschafts-Anträge: Nutzer beantragt die Übernahme "seines" Betriebs,
-- Admin prüft (z. B. per Anruf auf die hinterlegte Nummer) und gibt frei.

create type public.claim_status as enum ('pending', 'approved', 'rejected');

create table public.business_claims (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text,                 -- "Ich bin der Inhaber, erreichbar unter ..."
  contact_phone text,           -- Rückrufnummer für die Prüfung
  status public.claim_status not null default 'pending',
  note text,                    -- Admin-Notiz / Ablehnungsgrund
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (business_id, user_id)
);

alter table public.business_claims enable row level security;

create policy "claims: eigene sehen" on public.business_claims
  for select using (user_id = auth.uid() or public.is_admin());
create policy "claims: nutzer stellt antrag" on public.business_claims
  for insert with check (user_id = auth.uid() and status = 'pending');
create policy "claims: admin entscheidet" on public.business_claims
  for update using (public.is_admin());

-- Freigabe: Antrag genehmigen, Betrieb dem Nutzer zuordnen, Rolle anheben
create or replace function public.approve_business_claim(p_claim uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_business uuid;
  v_user uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select business_id, user_id into v_business, v_user
  from public.business_claims
  where id = p_claim and status = 'pending';
  if v_business is null then
    raise exception 'claim not found or already decided';
  end if;

  update public.business_claims
     set status = 'approved', decided_at = now()
   where id = p_claim;

  update public.businesses set owner_id = v_user where id = v_business;

  update public.profiles
     set role = 'business_owner'
   where id = v_user and role = 'user';

  -- Konkurrierende Anträge auf denselben Betrieb schließen
  update public.business_claims
     set status = 'rejected', decided_at = now(),
         note = coalesce(note, 'Biznesi u mor nga një pronar tjetër')
   where business_id = v_business and status = 'pending' and id <> p_claim;
end;
$$;

-- ============================================================
-- 0007_claim_documents
-- ============================================================
-- Nachweis-Dokumente für Inhaberschafts-Anträge (Gewerbenachweis + Ausweis).
-- Privater Bucket: nur Antragsteller (eigener Ordner) und Admins haben Zugriff.

alter table public.business_claims
  add column if not exists document_paths jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict (id) do nothing;

-- Upload nur in den eigenen Ordner (Pfad beginnt mit der eigenen User-ID)
create policy "claim-docs: eigener upload" on storage.objects
  for insert with check (
    bucket_id = 'claim-documents'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "claim-docs: eigene + admin lesen" on storage.objects
  for select using (
    bucket_id = 'claim-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "claim-docs: eigene + admin löschen" on storage.objects
  for delete using (
    bucket_id = 'claim-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
