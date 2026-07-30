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
