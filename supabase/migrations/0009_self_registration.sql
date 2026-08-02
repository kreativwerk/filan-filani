-- Selbst-Registrierung in der Filan-Filani-App:
-- Jeder angemeldete Nutzer darf Betriebe zur Prüfung einreichen (source 'self',
-- ohne Runner-Vergütung — die 0,50-€-Gutschrift greift nur bei source 'scout').
-- Inhaber dürfen sich dabei direkt als Eigentümer eintragen.

create policy "businesses: nutzer reicht selbst ein" on public.businesses
  for insert with check (
    auth.uid() is not null
    and created_by = auth.uid()
    and source = 'self'
    and status = 'pending'
    and scout_id is null
    and (owner_id is null or owner_id = auth.uid())
  );

-- Einreicher sehen ihre eigenen, noch nicht freigegebenen Einträge
drop policy "businesses: genehmigte öffentlich" on public.businesses;
create policy "businesses: genehmigte öffentlich" on public.businesses
  for select using (
    status = 'approved'
    or scout_id = auth.uid()
    or owner_id = auth.uid()
    or created_by = auth.uid()
    or public.is_admin()
  );

-- Kategorien & Fotos auch für Einreicher ohne Scout-/Inhaber-Rolle
drop policy "business_categories: schreiben" on public.business_categories;
create policy "business_categories: schreiben" on public.business_categories
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and (public.is_admin() or b.scout_id = auth.uid() or b.owner_id = auth.uid()
             or b.created_by = auth.uid())
    )
  );

drop policy "business_photos: schreiben" on public.business_photos;
create policy "business_photos: schreiben" on public.business_photos
  for all using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id
        and (public.is_admin() or b.scout_id = auth.uid() or b.owner_id = auth.uid()
             or b.created_by = auth.uid())
    )
  );
