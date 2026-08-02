-- Favoriten ("Të ruajtura"): Nutzer merken sich Betriebe
create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, business_id)
);

alter table public.favorites enable row level security;

create policy "favorites: eigene lesen" on public.favorites
  for select using (user_id = auth.uid());
create policy "favorites: eigene anlegen" on public.favorites
  for insert with check (user_id = auth.uid());
create policy "favorites: eigene löschen" on public.favorites
  for delete using (user_id = auth.uid());
