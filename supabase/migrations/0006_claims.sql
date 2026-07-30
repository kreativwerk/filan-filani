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
