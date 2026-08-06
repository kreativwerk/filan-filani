-- Antworten auf die Gewerke-Fragen (AroundHome-Prinzip: der Handwerker sieht
-- vor dem Kontakt, worum es konkret geht). Schlüssel/Wert aus
-- src/lib/trade-questions.ts, z. B. {"object":"house","kind":"repair"}.
alter table public.service_requests
  add column if not exists details jsonb not null default '{}'::jsonb;

-- Pool-Sicht um die Angaben erweitern — weiterhin ohne Kontaktdaten.
drop view if exists public.request_pool;

create view public.request_pool as
select
  r.id,
  r.category_id,
  r.city_id,
  r.title,
  r.description,
  r.timeframe,
  r.budget,
  r.details,
  r.created_at,
  (select count(*) from public.request_recipients rr where rr.request_id = r.id)
    as interested,
  exists (
    select 1
    from public.request_recipients rr
    join public.businesses b2 on b2.id = rr.business_id
    where rr.request_id = r.id and b2.owner_id = auth.uid()
  ) as claimed_by_me
from public.service_requests r
where r.status = 'open'
  and exists (
    select 1
    from public.businesses b
    join public.business_categories bc on bc.business_id = b.id
    join public.cities c on c.id = b.city_id
    left join public.cities rc on rc.id = r.city_id
    where b.owner_id = auth.uid()
      and b.status = 'approved'
      and b.accepts_requests
      and bc.category_id = r.category_id
      and (
        b.service_area = 'country'
        or (b.service_area = 'city' and b.city_id = r.city_id)
        or (
          b.service_area = 'region'
          and rc.lat is not null and c.lat is not null
          and sqrt(power((c.lat - rc.lat) * 111, 2) + power((c.lng - rc.lng) * 82, 2)) <= 35
        )
      )
  );

grant select on public.request_pool to authenticated;
