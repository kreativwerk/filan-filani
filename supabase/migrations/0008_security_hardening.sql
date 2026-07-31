-- Sicherheits-Härtung nach Supabase-Advisor:
-- Extensions raus aus public, search_path fixieren, RPC-Rechte einschränken.

-- 1) Extensions in eigenes Schema verschieben
create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated;
alter extension unaccent set schema extensions;
alter extension pg_trgm set schema extensions;

-- 2) search_path der Suchfunktionen fixieren (finden pg_trgm/unaccent weiterhin)
alter function public.slugify(text) set search_path = public, extensions;
alter function public.search_businesses(text, int, int, int) set search_path = public, extensions;

-- 3) Trigger-Funktionen dürfen nicht per REST-RPC aufrufbar sein
revoke execute on function public.ensure_business_slug() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_business_approved() from public, anon, authenticated;

-- 4) RPCs nur für eingeloggte Nutzer (interne Checks bleiben zusätzlich bestehen)
revoke execute on function public.approve_business_claim(uuid) from public, anon;
grant execute on function public.approve_business_claim(uuid) to authenticated;
revoke execute on function public.become_scout() from public, anon;
grant execute on function public.become_scout() to authenticated;
revoke execute on function public.business_duplicate_exists(text, text, int) from public, anon;
grant execute on function public.business_duplicate_exists(text, text, int) to authenticated;
