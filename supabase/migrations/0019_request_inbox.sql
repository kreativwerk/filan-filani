-- Anfragen erreichen die Betriebe IN der App: pro Anfrage entsteht für jeden
-- passenden Betrieb eine Empfänger-Zeile (Posteingang). E-Mail ist später nur
-- eine Benachrichtigung, die auf die App verlinkt.

-- Rückrufdaten des Kunden (nur für Empfänger sichtbar, siehe Policies unten)
alter table public.service_requests
  add column if not exists contact_phone text,
  add column if not exists contact_name text;

create type public.recipient_status as enum ('new', 'viewed', 'responded', 'declined');

create table if not exists public.request_recipients (
  request_id uuid not null references public.service_requests (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  status public.recipient_status not null default 'new',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (request_id, business_id)
);

alter table public.request_recipients enable row level security;

-- Betrieb sieht die an ihn gerichteten Anfragen; Ersteller sieht, wer sie bekam
create policy "recipients: betrieb + ersteller" on public.request_recipients
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.service_requests r
      where r.id = request_id and r.user_id = auth.uid()
    )
  );

-- Betrieb aktualisiert nur den eigenen Status (gesehen/geantwortet/abgelehnt)
create policy "recipients: betrieb aktualisiert" on public.request_recipients
  for update using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid()
    )
  );

-- Empfänger dürfen die Anfrage selbst lesen
drop policy if exists "service_requests: eigene + admin" on public.service_requests;
create policy "service_requests: eigene, empfänger + admin" on public.service_requests
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.request_recipients rr
      join public.businesses b on b.id = rr.business_id
      where rr.request_id = service_requests.id and b.owner_id = auth.uid()
    )
  );

-- Verteilung: passende Betriebe finden (Kategorie + Einsatzgebiet) und eintragen.
-- 'city' = gleiche Stadt, 'region' = bis 35 km Luftlinie, 'country' = überall.
create or replace function public.distribute_request(p_request uuid)
returns int
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  v_req public.service_requests;
  v_lat double precision;
  v_lng double precision;
  v_count int;
begin
  select * into v_req from public.service_requests where id = p_request;
  if v_req.id is null then
    raise exception 'request not found';
  end if;
  -- Nur der Ersteller (oder ein Admin) darf verteilen
  if v_req.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select lat, lng into v_lat, v_lng from public.cities where id = v_req.city_id;

  insert into public.request_recipients (request_id, business_id)
  select p_request, b.id
  from public.businesses b
  join public.business_categories bc on bc.business_id = b.id
  join public.cities c on c.id = b.city_id
  where b.status = 'approved'
    and b.accepts_requests
    and bc.category_id = v_req.category_id
    and (
      b.service_area = 'country'
      or (b.service_area = 'city' and b.city_id = v_req.city_id)
      or (
        b.service_area = 'region'
        and v_lat is not null and c.lat is not null
        -- grobe Distanz in km (1° Breite ≈ 111 km, Länge auf 42° ≈ 82 km)
        and sqrt(
              power((c.lat - v_lat) * 111, 2) +
              power((c.lng - v_lng) * 82, 2)
            ) <= 35
      )
    )
  on conflict do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.distribute_request(uuid) from public, anon;
grant execute on function public.distribute_request(uuid) to authenticated;

create index if not exists request_recipients_business_idx
  on public.request_recipients (business_id, status, created_at desc);
