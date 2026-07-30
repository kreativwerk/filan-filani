-- Nachweis-Dokumente für Inhaberschafts-Anträge (Gewerbenachweis + Ausweis).
-- Privater Bucket: nur Antragsteller (eigener Ordner) und Admins haben Zugriff.

alter table public.business_claims
  add column if not exists document_paths jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict (id) do nothing;

-- Upload nur in den eigenen Ordner (Pfad beginnt mit der eigenen User-ID)
create policy "claim-docs: eigener upload" on storage.objects
  for insert with check (
    bucket_id = 'claim-documents'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "claim-docs: eigene + admin lesen" on storage.objects
  for select using (
    bucket_id = 'claim-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "claim-docs: eigene + admin löschen" on storage.objects
  for delete using (
    bucket_id = 'claim-documents'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
