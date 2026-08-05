-- Admins sehen alle Kundenanfragen (Anlaufphase: Anfragen ohne Empfänger
-- werden von Hand an Betriebe weitergegeben).
-- Die bestehende Policy deckt Admins schon ab; hier nur die Empfänger-Sicht
-- für den Kunden ergänzen, damit er den Stand seiner Anfrage sieht.
drop policy if exists "recipients: betrieb + ersteller" on public.request_recipients;
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
