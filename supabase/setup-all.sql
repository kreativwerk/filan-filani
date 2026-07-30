-- ============================================================
-- Filan Filani — komplettes Datenbank-Setup in EINER Datei.
-- Anwendung: Supabase-Dashboard → SQL Editor → alles einfügen → Run.
-- (Entspricht migrations/0001 + 0002 + 0003, nur zusammengefasst.)
-- ============================================================

-- Filan Filani — vollständiges Datenmodell (Phase 0: KS Data befüllt es, die App liest es später)

create type public.user_role as enum ('user', 'business_owner', 'scout', 'admin');
create type public.business_status as enum ('draft', 'pending', 'approved', 'rejected');
create type public.business_source as enum ('scout', 'self', 'admin');
create type public.ledger_type as enum ('credit', 'payout');
create type public.request_status as enum ('open', 'closed');
create type public.review_status as enum ('visible', 'reported', 'removed');

-- ---------------------------------------------------------------------------
-- Profile (1:1 zu auth.users, per Trigger angelegt)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'user',
  locale text not null default 'sq',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'user'),
    coalesce(new.raw_user_meta_data ->> 'locale', 'sq')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rollen-Helfer (security definer, damit RLS-Policies nicht rekursiv werden)
create or replace function public.app_role()
returns public.user_role
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'user');
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select public.app_role() = 'admin';
$$;

-- ---------------------------------------------------------------------------
-- Stammdaten: Städte/Gemeinden & Kategorien (mehrsprachig)
-- ---------------------------------------------------------------------------
create table public.cities (
  id serial primary key,
  slug text not null unique,
  name_sq text not null,
  name_sr text not null,
  name_en text not null,
  name_de text not null
);

create table public.categories (
  id serial primary key,
  slug text not null unique,
  parent_id int references public.categories (id) on delete set null,
  name_sq text not null,
  name_de text not null,
  name_en text not null,
  name_sr text not null,
  icon text,
  sort int not null default 0
);

-- ---------------------------------------------------------------------------
-- Betriebe — Kern der Plattform
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  description text,
  city_id int not null references public.cities (id),
  address text,
  lat double precision,
  lng double precision,
  phone text,
  whatsapp text,
  viber text,
  email text,
  website text,
  facebook text,
  instagram text,
  logo_url text,
  cover_url text,
  opening_hours jsonb,          -- { "mon": [["08:00","18:00"]], ... }
  status public.business_status not null default 'pending',
  source public.business_source not null default 'scout',
  scout_id uuid references public.profiles (id) on delete set null,
  owner_id uuid references public.profiles (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,
  review_note text,             -- Ablehnungsgrund / Admin-Notiz
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index businesses_city_idx on public.businesses (city_id);
create index businesses_status_idx on public.businesses (status);
create index businesses_scout_idx on public.businesses (scout_id);
create index businesses_name_city_idx on public.businesses (lower(name), city_id);
create index businesses_phone_idx on public.businesses (phone);

create table public.business_categories (
  business_id uuid not null references public.businesses (id) on delete cascade,
  category_id int not null references public.categories (id) on delete cascade,
  primary key (business_id, category_id)
);

create table public.business_photos (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  url text not null,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- Produkte/Leistungen — vom Betrieb gepflegter Mini-Katalog
create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  currency text not null default 'EUR',
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bewertungen (App-Phase; Schema steht schon fest)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  reply text,
  status public.review_status not null default 'visible',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

-- Dienstleistungs-Anfragen ("Auftrag an alle passenden Betriebe")
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category_id int not null references public.categories (id),
  city_id int not null references public.cities (id),
  title text not null,
  description text,
  photo_urls jsonb not null default '[]'::jsonb,
  status public.request_status not null default 'open',
  created_at timestamptz not null default now()
);

-- Chat: Konversation Nutzer <-> Betrieb (optional an eine Anfrage geknüpft)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests (id) on delete set null,
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (business_id, user_id, request_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Scout-Vergütung: 0,50 € je genehmigtem Eintrag, Auszahlungen als 'payout'
-- ---------------------------------------------------------------------------
create table public.scout_ledger (
  id uuid primary key default gen_random_uuid(),
  scout_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  type public.ledger_type not null,
  amount numeric(10, 2) not null,   -- credit: +0.50, payout: negativ
  note text,
  created_at timestamptz not null default now(),
  unique (business_id, type)        -- max. eine Gutschrift pro Betrieb
);

create or replace function public.handle_business_approved()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.source = 'scout'
     and new.scout_id is not null then
    insert into public.scout_ledger (scout_id, business_id, type, amount, note)
    values (new.scout_id, new.id, 'credit', 0.50, 'Eintrag genehmigt')
    on conflict (business_id, type) do nothing;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_business_status_change
  before update on public.businesses
  for each row execute function public.handle_business_approved();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.business_categories enable row level security;
alter table public.business_photos enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.service_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.scout_ledger enable row level security;

-- Profile
create policy "profiles: eigenes lesen" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: eigenes ändern" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles: admin ändert alles" on public.profiles
  for update using (public.is_admin());

-- Stammdaten sind öffentlich lesbar, nur Admin schreibt
create policy "cities: öffentlich" on public.cities for select using (true);
create policy "cities: admin schreibt" on public.cities for all using (public.is_admin());
create policy "categories: öffentlich" on public.categories for select using (true);
create policy "categories: admin schreibt" on public.categories for all using (public.is_admin());

-- Betriebe
create policy "businesses: genehmigte öffentlich" on public.businesses
  for select using (
    status = 'approved'
    or scout_id = auth.uid()
    or owner_id = auth.uid()
    or public.is_admin()
  );
create policy "businesses: scout legt an" on public.businesses
  for insert with check (
    (public.app_role() in ('scout', 'admin'))
    and created_by = auth.uid()
    and (public.is_admin() or (source = 'scout' and scout_id = auth.uid() and status = 'pending'))
  );
create policy "businesses: scout bearbeitet eigene offene" on public.businesses
  for update using (
    public.is_admin()
    or (scout_id = auth.uid() and status in ('pending', 'rejected'))
  );
create policy "businesses: admin löscht" on public.businesses
  for delete using (public.is_admin());

-- Zuordnungen & Fotos folgen dem Betrieb
create policy "business_categories: lesen" on public.business_categories
  for select using (true);
create policy "business_categories: schreiben" on public.business_categories
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and (public.is_admin() or b.scout_id = auth.uid() or b.owner_id = auth.uid())
    )
  );
create policy "business_photos: lesen" on public.business_photos
  for select using (true);
create policy "business_photos: schreiben" on public.business_photos
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and (public.is_admin() or b.scout_id = auth.uid() or b.owner_id = auth.uid())
    )
  );

-- Produkte
create policy "products: aktive öffentlich" on public.products
  for select using (
    active or public.is_admin()
    or exists (select 1 from public.businesses b where b.id = business_id and (b.owner_id = auth.uid() or b.scout_id = auth.uid()))
  );
create policy "products: betrieb pflegt" on public.products
  for all using (
    public.is_admin()
    or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- Bewertungen
create policy "reviews: sichtbare öffentlich" on public.reviews
  for select using (status = 'visible' or user_id = auth.uid() or public.is_admin());
create policy "reviews: nutzer schreibt eigene" on public.reviews
  for insert with check (user_id = auth.uid());
create policy "reviews: nutzer ändert eigene" on public.reviews
  for update using (user_id = auth.uid() or public.is_admin());
create policy "reviews: admin löscht" on public.reviews
  for delete using (public.is_admin());

-- Anfragen: Ersteller + Betriebe der Kategorie/Stadt (App-Phase; vorerst restriktiv)
create policy "service_requests: eigene + admin" on public.service_requests
  for select using (user_id = auth.uid() or public.is_admin());
create policy "service_requests: nutzer erstellt" on public.service_requests
  for insert with check (user_id = auth.uid());
create policy "service_requests: nutzer schließt" on public.service_requests
  for update using (user_id = auth.uid() or public.is_admin());

-- Chat: nur Beteiligte
create policy "conversations: beteiligte" on public.conversations
  for select using (
    user_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "conversations: nutzer startet" on public.conversations
  for insert with check (user_id = auth.uid());
create policy "messages: beteiligte lesen" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid() or public.is_admin()
             or exists (select 1 from public.businesses b where b.id = c.business_id and b.owner_id = auth.uid()))
    )
  );
create policy "messages: beteiligte schreiben" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.user_id = auth.uid()
             or exists (select 1 from public.businesses b where b.id = c.business_id and b.owner_id = auth.uid()))
    )
  );

-- Scout-Konto: Scout liest eigenes, Admin alles; geschrieben wird nur per Trigger/Admin
create policy "scout_ledger: eigenes lesen" on public.scout_ledger
  for select using (scout_id = auth.uid() or public.is_admin());
create policy "scout_ledger: admin bucht" on public.scout_ledger
  for insert with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: Bucket für Betriebsfotos (öffentlich lesbar)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('business-photos', 'business-photos', true)
on conflict (id) do nothing;

create policy "fotos: öffentlich lesen" on storage.objects
  for select using (bucket_id = 'business-photos');
create policy "fotos: angemeldete laden hoch" on storage.objects
  for insert with check (bucket_id = 'business-photos' and auth.uid() is not null);
create policy "fotos: eigene löschen" on storage.objects
  for delete using (bucket_id = 'business-photos' and (owner_id::uuid = auth.uid() or public.is_admin()));

-- ===== Ende 0001 / Beginn 0002 (Stammdaten) =====

-- Stammdaten: 38 Gemeinden des Kosovo + Start-Kategorien

insert into public.cities (slug, name_sq, name_sr, name_en, name_de) values
  ('prishtina',      'Prishtinë',      'Priština',            'Pristina',        'Pristina'),
  ('prizren',        'Prizren',        'Prizren',             'Prizren',         'Prizren'),
  ('peja',           'Pejë',           'Peć',                 'Peja',            'Peja'),
  ('gjakova',        'Gjakovë',        'Đakovica',            'Gjakova',         'Gjakova'),
  ('mitrovica',      'Mitrovicë',      'Kosovska Mitrovica',  'Mitrovica',       'Mitrovica'),
  ('mitrovica-veriore', 'Mitrovicë e Veriut', 'Severna Mitrovica', 'North Mitrovica', 'Nord-Mitrovica'),
  ('ferizaj',        'Ferizaj',        'Uroševac',            'Ferizaj',         'Ferizaj'),
  ('gjilan',         'Gjilan',         'Gnjilane',            'Gjilan',          'Gjilan'),
  ('podujeva',       'Podujevë',       'Podujevo',            'Podujeva',        'Podujeva'),
  ('vushtrri',       'Vushtrri',       'Vučitrn',             'Vushtrri',        'Vushtrri'),
  ('suhareka',       'Suharekë',       'Suva Reka',           'Suhareka',        'Suhareka'),
  ('rahovec',        'Rahovec',        'Orahovac',            'Rahovec',         'Rahovec'),
  ('drenas',         'Drenas',         'Glogovac',            'Drenas',          'Drenas'),
  ('lipjan',         'Lipjan',         'Lipljan',             'Lipjan',          'Lipjan'),
  ('malisheva',      'Malishevë',      'Mališevo',            'Malisheva',       'Malisheva'),
  ('kamenica',       'Kamenicë',       'Kosovska Kamenica',   'Kamenica',        'Kamenica'),
  ('viti',           'Viti',           'Vitina',              'Viti',            'Viti'),
  ('decan',          'Deçan',          'Dečani',              'Decan',           'Decan'),
  ('istog',          'Istog',          'Istok',               'Istog',           'Istog'),
  ('klina',          'Klinë',          'Klina',               'Klina',           'Klina'),
  ('skenderaj',      'Skenderaj',      'Srbica',              'Skenderaj',       'Skenderaj'),
  ('dragash',        'Dragash',        'Dragaš',              'Dragash',         'Dragash'),
  ('fushe-kosova',   'Fushë Kosovë',   'Kosovo Polje',        'Fushe Kosova',    'Fushe Kosova'),
  ('kacanik',        'Kaçanik',        'Kačanik',             'Kacanik',         'Kacanik'),
  ('shtime',         'Shtime',         'Štimlje',             'Shtime',          'Shtime'),
  ('obiliq',         'Obiliq',         'Obilić',              'Obiliq',          'Obiliq'),
  ('junik',          'Junik',          'Junik',               'Junik',           'Junik'),
  ('hani-i-elezit',  'Hani i Elezit',  'Elez Han',            'Hani i Elezit',   'Hani i Elezit'),
  ('mamusha',        'Mamushë',        'Mamuša',              'Mamusha',         'Mamusha'),
  ('gracanica',      'Graçanicë',      'Gračanica',           'Gracanica',       'Gracanica'),
  ('ranillug',       'Ranillug',       'Ranilug',             'Ranillug',        'Ranillug'),
  ('partesh',        'Partesh',        'Parteš',              'Partesh',         'Partesh'),
  ('kllokot',        'Kllokot',        'Klokot',              'Kllokot',         'Kllokot'),
  ('novoberda',      'Novobërdë',      'Novo Brdo',           'Novoberda',       'Novoberda'),
  ('shterpca',       'Shtërpcë',       'Štrpce',              'Shterpca',        'Shterpca'),
  ('zubin-potok',    'Zubin Potok',    'Zubin Potok',         'Zubin Potok',     'Zubin Potok'),
  ('zvecan',         'Zveçan',         'Zvečan',              'Zvecan',          'Zvecan'),
  ('leposaviq',      'Leposaviq',      'Leposavić',           'Leposaviq',       'Leposaviq');

insert into public.categories (slug, name_sq, name_de, name_en, name_sr, icon, sort) values
  ('ndertim',           'Ndërtim & Renovim',      'Bau & Renovierung',       'Construction & Renovation', 'Građevina i renoviranje',  'hammer',        1),
  ('elektricist',       'Elektricist',            'Elektriker',              'Electrician',               'Električar',               'zap',           2),
  ('hidraulik',         'Hidraulik',              'Klempner / Sanitär',      'Plumber',                   'Vodoinstalater',           'droplets',      3),
  ('klima-ngrohje',     'Klimë & Ngrohje',        'Klima & Heizung',         'AC & Heating',              'Klima i grejanje',         'thermometer',   4),
  ('auto-servis',       'Auto Servis',            'Autowerkstatt',           'Car Repair',                'Auto servis',              'car',           5),
  ('pastrim',           'Pastrim',                'Reinigung',               'Cleaning',                  'Čišćenje',                 'sparkles',      6),
  ('mobileri',          'Mobileri & Dizajn',      'Möbel & Einrichtung',     'Furniture & Interior',      'Nameštaj i enterijer',     'armchair',      7),
  ('transport',         'Transport & Logjistikë', 'Transport & Logistik',    'Transport & Logistics',     'Prevoz i logistika',       'truck',         8),
  ('restorant',         'Restorant',              'Restaurant',              'Restaurant',                'Restoran',                 'utensils',      9),
  ('kafene',            'Kafene & Ëmbëltore',     'Café & Konditorei',       'Café & Pastry',             'Kafić i poslastičarnica',  'coffee',       10),
  ('hotel',             'Hotel & Bujtinë',        'Hotel & Unterkunft',      'Hotel & Accommodation',     'Hotel i smeštaj',          'bed',          11),
  ('bukuri',            'Floktore & Bukuri',      'Friseur & Kosmetik',      'Hair & Beauty',             'Frizer i lepota',          'scissors',     12),
  ('shendetesi',        'Shëndetësi',             'Gesundheit',              'Health',                    'Zdravlje',                 'stethoscope',  13),
  ('stomatolog',        'Stomatolog',             'Zahnarzt',                'Dentist',                   'Zubar',                    'smile',        14),
  ('avokat',            'Avokat & Noter',         'Anwalt & Notar',          'Lawyer & Notary',           'Advokat i notar',          'scale',        15),
  ('kontabilitet',      'Kontabilitet',           'Buchhaltung',             'Accounting',                'Računovodstvo',            'calculator',   16),
  ('patundshmeri',      'Patundshmëri',           'Immobilien',              'Real Estate',               'Nekretnine',               'home',         17),
  ('teknologji',        'IT & Elektronikë',       'IT & Elektronik',         'IT & Electronics',          'IT i elektronika',         'laptop',       18),
  ('shitore',           'Shitore & Ushqimore',    'Läden & Lebensmittel',    'Shops & Groceries',         'Prodavnice i namirnice',   'shopping-cart',19),
  ('mode',              'Modë & Veshje',          'Mode & Bekleidung',       'Fashion & Clothing',        'Moda i odeća',             'shirt',        20),
  ('evente',            'Evente & Dasma',         'Events & Hochzeiten',     'Events & Weddings',         'Događaji i svadbe',        'party-popper', 21),
  ('edukim',            'Edukim & Kurse',         'Bildung & Kurse',         'Education & Courses',       'Obrazovanje i kursevi',    'graduation-cap',22),
  ('bujqesi',           'Bujqësi',                'Landwirtschaft',          'Agriculture',               'Poljoprivreda',            'tractor',      23),
  ('sigurime-financa',  'Sigurime & Financa',     'Versicherung & Finanzen', 'Insurance & Finance',       'Osiguranje i finansije',   'shield',       24);

-- ===== Ende 0002 / Beginn 0003 (Funktionen) =====

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
