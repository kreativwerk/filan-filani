-- Suche: Treffergenauigkeit zuerst, danach Datenqualität, dann Aktualität
-- (Funktionsrumpf identisch zu 0004, ergänzt um b.completeness in ORDER BY)
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
set search_path = public, extensions
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
    b.completeness desc,
    b.created_at desc
  limit least(coalesce(p_limit, 30), 100);
$$;
