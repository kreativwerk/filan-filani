-- Hilfsfunktionen für das KS-Data-Portal

-- Wer sich im Runner-Portal per OAuth anmeldet, wird vom 'user' zum 'scout'
-- (bei Email-Registrierung setzt das Portal die Rolle schon über die Metadaten).
create or replace function public.become_scout()
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles set role = 'scout' where id = auth.uid() and role = 'user';
$$;

-- Duplikat-Prüfung über alle Status hinweg (RLS würde Scouts sonst
-- fremde, noch nicht genehmigte Einträge verbergen).
create or replace function public.business_duplicate_exists(
  p_name text,
  p_phone text,
  p_city int
)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1
    from public.businesses
    where city_id = p_city
      and status <> 'rejected'
      and (
        lower(name) = lower(p_name)
        or (p_phone is not null and p_phone <> '' and phone = p_phone)
      )
  );
$$;
