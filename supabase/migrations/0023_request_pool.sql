-- Auftragspool (MyHammer-Modell): Handwerker sehen offene Anfragen ihres Gewerks
-- und melden selbst Interesse an. Kontaktdaten bleiben verborgen, bis sie
-- Interesse gemeldet haben — schützt Kunden vor Anrufen von Dutzenden Betrieben.

-- Wie viele Betriebe dürfen sich pro Anfrage melden (wie MyHammer/AroundHome:
-- wenige, dafür ernsthafte Angebote).
create or replace function public.request_max_interested()
returns int language sql immutable as $$ select 5 $$;

-- Sicht auf den Pool: OHNE Kontaktdaten, und nur Zeilen, für die der Aufrufer
-- einen passenden Betrieb besitzt. Läuft als Eigentümer (umgeht RLS bewusst),
-- die WHERE-Bedingung ist der Schutz.
create or replace view public.request_pool as
select
  r.id,
  r.category_id,
  r.city_id,
  r.title,
  r.description,
  r.timeframe,
  r.budget,
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

-- Interesse melden: prüft Eigentümerschaft, Passung und Platzlimit und legt
-- die Empfänger-Zeile an. Danach sieht der Betrieb die Kontaktdaten.
create or replace function public.claim_request(p_request uuid, p_business uuid)
returns text
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  v_req public.service_requests;
  v_biz public.businesses;
  v_taken int;
  v_ok boolean;
  v_rlat double precision; v_rlng double precision;
  v_blat double precision; v_blng double precision;
begin
  select * into v_req from public.service_requests where id = p_request;
  if v_req.id is null or v_req.status <> 'open' then
    return 'not-open';
  end if;

  select * into v_biz from public.businesses
   where id = p_business and owner_id = auth.uid() and status = 'approved';
  if v_biz.id is null then
    return 'forbidden';
  end if;
  if not v_biz.accepts_requests then
    return 'requests-off';
  end if;

  -- Gewerk muss passen
  if not exists (
    select 1 from public.business_categories bc
    where bc.business_id = p_business and bc.category_id = v_req.category_id
  ) then
    return 'wrong-category';
  end if;

  -- Einsatzgebiet muss passen
  select lat, lng into v_rlat, v_rlng from public.cities where id = v_req.city_id;
  select lat, lng into v_blat, v_blng from public.cities where id = v_biz.city_id;
  v_ok := v_biz.service_area = 'country'
    or (v_biz.service_area = 'city' and v_biz.city_id = v_req.city_id)
    or (
      v_biz.service_area = 'region' and v_rlat is not null and v_blat is not null
      and sqrt(power((v_blat - v_rlat) * 111, 2) + power((v_blng - v_rlng) * 82, 2)) <= 35
    );
  if not v_ok then
    return 'wrong-area';
  end if;

  -- Platzlimit
  select count(*) into v_taken from public.request_recipients where request_id = p_request;
  if v_taken >= public.request_max_interested()
     and not exists (
       select 1 from public.request_recipients
        where request_id = p_request and business_id = p_business
     ) then
    return 'full';
  end if;

  insert into public.request_recipients (request_id, business_id, status)
  values (p_request, p_business, 'viewed')
  on conflict (request_id, business_id) do nothing;

  return 'ok';
end;
$$;

revoke execute on function public.claim_request(uuid, uuid) from public, anon;
grant execute on function public.claim_request(uuid, uuid) to authenticated;
