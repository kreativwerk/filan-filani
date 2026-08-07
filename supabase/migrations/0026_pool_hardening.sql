-- Nachzieher zum Auftragsmarkt: search_path fixieren (Advisor-Warnung) und
-- festhalten, warum die Pool-Sicht bewusst als Eigentümer läuft.
create or replace function public.request_max_interested()
returns int language sql immutable
set search_path = public, extensions
as $$ select 5 $$;

comment on view public.request_pool is
  'Auftragsmarkt. Läuft bewusst als Eigentümer (security definer), weil die RLS von service_requests nur den Ersteller lesen lässt. Schutz ist die WHERE-Bedingung: nur Zeilen, für die der Aufrufer einen passenden, freigeschalteten Betrieb besitzt — und ohne Kontaktdaten.';
