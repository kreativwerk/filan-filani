-- Anfragen-Einstellungen ("AroundHome-Modell"): Möchte der Betrieb Kundenanfragen
-- erhalten, wohin gehen sie, und für welches Gebiet gilt das?
alter table public.businesses
  add column if not exists accepts_requests boolean not null default false,
  add column if not exists request_email text,
  add column if not exists service_area text not null default 'city'
    check (service_area in ('city', 'region', 'country'));

-- Schnelles Finden passender Betriebe beim späteren Verteilen von Anfragen
create index if not exists businesses_accepts_requests_idx
  on public.businesses (accepts_requests, city_id)
  where accepts_requests;
