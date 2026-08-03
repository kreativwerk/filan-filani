-- Härtung nach Advisor-Lauf: Foto-Bucket nicht mehr auflistbar.
-- Öffentliche Datei-URLs (getPublicUrl) funktionieren weiterhin — dafür braucht
-- ein "public" Bucket keine SELECT-Policy auf storage.objects.
--
-- Hinweis: app_role() und is_admin() bleiben bewusst für anon/authenticated
-- ausführbar — sie werden INNERHALB der RLS-Policies aufgerufen; ein Entzug
-- von EXECUTE legt sämtliche Policies lahm (getestet und verworfen).
drop policy if exists "fotos: öffentlich lesen" on storage.objects;

create policy "fotos: eigene + admin listen" on storage.objects
  for select using (
    bucket_id = 'business-photos'
    and (owner_id::text = auth.uid()::text or public.is_admin())
  );
