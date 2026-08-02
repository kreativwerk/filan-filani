-- KS Data / Filan Filani — Update-Paket 3
-- Enthält: Favoriten-Tabelle (Migration 0010) + Alt-Einträge aus der ersten KS-Data-App.
-- Einfach komplett in den Supabase SQL Editor einfügen und einmal ausführen.

-- ============================================================
-- 0010_favorites
-- ============================================================
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

-- ============================================================
-- Alt-Einträge (Arjan & Kastriot, 33 Betriebe)
-- ============================================================
-- Import der Alt-Einträge aus der ersten KS-Data-App (Arjan & Kastriot, 33 Stück).
-- Alberts Test-Einträge (Kreativwerk, Arion Logistics GmbH) sind ausgenommen und
-- werden — falls schon importiert — wieder entfernt.
delete from public.businesses
 where source = 'admin'
   and name in ('Kreativwerk', 'Arion Logistics GmbH')
   and city_id = (select id from public.cities where slug = 'prishtina');

do $$
declare
  v_admin uuid;
  e jsonb;
  v_city int; v_cat int; v_biz uuid;
  entries jsonb := '[{"name": "Alb Optika", "address": "Skenderbeu 12", "phone": "", "email": "", "city": "podujeva", "cat": "shendetesi", "photo": "https://filan-filani.vercel.app/legacy-ksdata/1YdA7sUbq5BxI8mexlbr.jpg"}, {"name": "Bedi Market", "address": "Skenderbeu 791", "phone": "", "email": "", "city": "podujeva", "cat": "shitore", "photo": "https://filan-filani.vercel.app/legacy-ksdata/2HPz0WUjADTf5K5u1pdr.jpg"}, {"name": "Eva''s brew & bites", "address": "", "phone": "", "email": "", "city": "podujeva", "cat": "kafene", "photo": ""}, {"name": "MAROCCO", "address": "Skenderbeu 16", "phone": "", "email": "", "city": "podujeva", "cat": "kafene", "photo": "https://filan-filani.vercel.app/legacy-ksdata/BPuCPh8sfH5q68TB9NGv.jpg"}, {"name": "NAKAMA", "address": "Skenderbeu Skenderbeu", "phone": "", "email": "", "city": "podujeva", "cat": "evente", "photo": "https://filan-filani.vercel.app/legacy-ksdata/DOUkkG4SWOe4CaQtZPZa.jpg"}, {"name": "Dream''s coffe", "address": "skenderbeu 6", "phone": "", "email": "", "city": "podujeva", "cat": "kafene", "photo": "https://filan-filani.vercel.app/legacy-ksdata/DyajjbwwKqz0tJzybEAD.jpg"}, {"name": "Lingua", "address": "Skenderbeu 9", "phone": "", "email": "", "city": "podujeva", "cat": "edukim", "photo": "https://filan-filani.vercel.app/legacy-ksdata/GCPAYp3jE7ZGOePyDhx2.jpg"}, {"name": "HOTEL NARTEL", "address": "Lagjja A1/1", "phone": "+38345707080", "email": "contact@hotelnartel.com", "city": "prishtina", "cat": "hotel", "photo": "https://filan-filani.vercel.app/legacy-ksdata/H97jLoZFACpfVw4UNNbW.jpg"}, {"name": "Te Trimi", "address": "Besnik Restelica 227", "phone": "", "email": "", "city": "podujeva", "cat": "restorant", "photo": "https://filan-filani.vercel.app/legacy-ksdata/JXvePnq0PRsh3KM3L2kj.jpg"}, {"name": "Timoni", "address": "Skenderbeu 973", "phone": "", "email": "", "city": "podujeva", "cat": "auto-servis", "photo": "https://filan-filani.vercel.app/legacy-ksdata/LC984WVNyKROJzTBevP6.jpg"}, {"name": "Mirage", "address": "Besnik Restelica 228", "phone": "", "email": "", "city": "podujeva", "cat": "evente", "photo": "https://filan-filani.vercel.app/legacy-ksdata/QGhzK0Pvv8DYE11lEPnF.jpg"}, {"name": "Elsa Silver", "address": "Skenderbeu 21", "phone": "", "email": "", "city": "podujeva", "cat": "mode", "photo": "https://filan-filani.vercel.app/legacy-ksdata/Qa4aUoXWLnyV7cOwtCVf.jpg"}, {"name": "Mobi Shop Lila", "address": "Skenderbeu 6", "phone": "", "email": "", "city": "podujeva", "cat": "teknologji", "photo": "https://filan-filani.vercel.app/legacy-ksdata/RubI6HPBW7115mmPedJF.jpg"}, {"name": "Nails. by Erëza", "address": "Skenderbeu 60", "phone": "", "email": "", "city": "podujeva", "cat": "bukuri", "photo": "https://filan-filani.vercel.app/legacy-ksdata/UXCY4mggfZT3yrHtexX8.jpg"}, {"name": "Clean Up", "address": "Besnik Restelica 229", "phone": "", "email": "", "city": "podujeva", "cat": "pastrim", "photo": "https://filan-filani.vercel.app/legacy-ksdata/WbZNDgsCrAdoLyL8HnqY.jpg"}, {"name": "Furra Graniti", "address": "Skenderbeu 890", "phone": "", "email": "", "city": "podujeva", "cat": "restorant", "photo": "https://filan-filani.vercel.app/legacy-ksdata/ZBGd9eNAVBWsM89McKMZ.jpg"}, {"name": "Leo pump", "address": "Skenderbeu 71", "phone": "", "email": "", "city": "podujeva", "cat": "hidraulik", "photo": ""}, {"name": "PDK", "address": "Skenderbeu 14", "phone": "", "email": "", "city": "podujeva", "cat": "", "photo": "https://filan-filani.vercel.app/legacy-ksdata/arZzvcOP2mMS797evnhC.jpg"}, {"name": "Noter Shqipo Sejdii", "address": "Skenderbeu 7", "phone": "", "email": "", "city": "podujeva", "cat": "avokat", "photo": "https://filan-filani.vercel.app/legacy-ksdata/cKegJIbN7OcCsDisXtDD.jpg"}, {"name": "D&P perfumum", "address": "Skenderbeu 12", "phone": "", "email": "", "city": "podujeva", "cat": "bukuri", "photo": "https://filan-filani.vercel.app/legacy-ksdata/czgnRl1C7lN3dbmjN5nJ.jpg"}, {"name": "Hareja", "address": "Besnik Restelica 31", "phone": "", "email": "", "city": "podujeva", "cat": "restorant", "photo": "https://filan-filani.vercel.app/legacy-ksdata/e0uvhCZ53jBGLOiMgKN8.jpg"}, {"name": "Barber''s House", "address": "Skenderbeu 10", "phone": "", "email": "", "city": "podujeva", "cat": "bukuri", "photo": "https://filan-filani.vercel.app/legacy-ksdata/g2ooFmmUv9MCVvCYp960.jpg"}, {"name": "REXHEPI", "address": "Skenderbeu 755", "phone": "", "email": "", "city": "podujeva", "cat": "hidraulik", "photo": "https://filan-filani.vercel.app/legacy-ksdata/lSP5og9eC9LgSk7wxx40.jpg"}, {"name": "Star GYM", "address": "Besnik Restelica 20", "phone": "", "email": "", "city": "podujeva", "cat": "shendetesi", "photo": "https://filan-filani.vercel.app/legacy-ksdata/m48DfuUn3NphoCEn3V8Y.jpg"}, {"name": "NLB Banka", "address": "Skenderbeu 2", "phone": "", "email": "", "city": "podujeva", "cat": "sigurime-financa", "photo": "https://filan-filani.vercel.app/legacy-ksdata/mmsU9sYkFl0PKgty8haZ.jpg"}, {"name": "Agentur Gashi", "address": "28 Nentor 52", "phone": "+38348119114", "email": "Info@kosovo-personal.com", "city": "prishtina", "cat": "edukim", "photo": "https://filan-filani.vercel.app/legacy-ksdata/nikIUf89KgkmksFFRro2.jpg"}, {"name": "Stallion", "address": "Skenderbeu 9", "phone": "", "email": "", "city": "podujeva", "cat": "mode", "photo": "https://filan-filani.vercel.app/legacy-ksdata/ogjaciykR8YSToaFYnOR.jpg"}, {"name": "Market Ardi", "address": "Skenderbeu 813", "phone": "", "email": "", "city": "podujeva", "cat": "shitore", "photo": "https://filan-filani.vercel.app/legacy-ksdata/pGgn3DDTT0DzparNtMeU.jpg"}, {"name": "White store", "address": "Skenderbeu 90", "phone": "", "email": "", "city": "podujeva", "cat": "mode", "photo": "https://filan-filani.vercel.app/legacy-ksdata/rghwUyQ9SdbKbEOKYWVu.jpg"}, {"name": "Leoni", "address": "Skenderbeu 759", "phone": "", "email": "", "city": "podujeva", "cat": "transport", "photo": "https://filan-filani.vercel.app/legacy-ksdata/s14LNqZ81ThooRYYBNvp.jpg"}, {"name": "METTON", "address": "Skenderbeu 926", "phone": "", "email": "", "city": "podujeva", "cat": "evente", "photo": "https://filan-filani.vercel.app/legacy-ksdata/tz6mMxNwrNK2VI9eO5mm.jpg"}, {"name": "Premium Auto", "address": "Besnik Restelica 226", "phone": "", "email": "", "city": "podujeva", "cat": "auto-servis", "photo": "https://filan-filani.vercel.app/legacy-ksdata/vVo5gq6wMcIfxmhEjEZl.jpg"}, {"name": "Ardi Plast", "address": "Besnik Restelica 30", "phone": "", "email": "", "city": "podujeva", "cat": "ndertim", "photo": "https://filan-filani.vercel.app/legacy-ksdata/w9fkzuOkTvl1DuJUqQCC.jpg"}]'::jsonb;
begin
  select id into v_admin from auth.users where email = 'info@filan-filani.com';
  for e in select * from jsonb_array_elements(entries) loop
    select id into v_city from public.cities where slug = e->>'city';
    if v_city is null then continue; end if;
    if exists (
      select 1 from public.businesses b
      where b.city_id = v_city and lower(b.name) = lower(e->>'name')
    ) then continue; end if;

    insert into public.businesses
      (name, address, phone, email, city_id, status, source, created_by, cover_url)
    values
      (e->>'name', nullif(e->>'address',''), nullif(e->>'phone',''),
       nullif(e->>'email',''), v_city, 'approved', 'admin', v_admin,
       nullif(e->>'photo',''))
    returning id into v_biz;

    if coalesce(e->>'cat','') <> '' then
      select id into v_cat from public.categories where slug = e->>'cat';
      if v_cat is not null then
        insert into public.business_categories (business_id, category_id)
        values (v_biz, v_cat);
      end if;
    end if;

    if coalesce(e->>'photo','') <> '' then
      insert into public.business_photos (business_id, url, sort)
      values (v_biz, e->>'photo', 0);
    end if;
  end loop;
end $$;

-- ============================================================
-- 0011_export_countries
-- ============================================================
-- B2B-Grundlage: Betriebe geben an, in welche Länder sie auch liefern/leisten.
-- Vordefinierte Länder als ISO-Codes (DE, AT, CH, SE, FI, IT, AL),
-- frei ergänzte Länder als Klartext im selben Array.
alter table public.businesses
  add column if not exists export_countries text[] not null default '{}';

create index if not exists businesses_export_countries_idx
  on public.businesses using gin (export_countries);

-- Inhaber dürfen ihren übernommenen Betrieb selbst bearbeiten
create policy "businesses: inhaber bearbeitet eigenen" on public.businesses
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
