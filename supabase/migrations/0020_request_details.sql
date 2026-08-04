-- Strukturierte Angaben wie bei AroundHome: Zeitrahmen und Budget-Rahmen
alter table public.service_requests
  add column if not exists timeframe text
    check (timeframe is null or timeframe in ('urgent','soon','month','flexible')),
  add column if not exists budget text
    check (budget is null or budget in ('open','lt100','100_500','500_2000','gt2000')),
  add column if not exists contact_email text;
