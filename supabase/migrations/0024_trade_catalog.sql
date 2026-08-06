-- Gewerke-Katalog für Anfragen (Vorbild MyHammer / AroundHome).
-- Anfragen sollen ausschließlich handwerkliche Leistungen rund um Gebäude
-- abdecken. Autowerkstatt, Reinigung und Transport fliegen deshalb aus der
-- Anfrage-Logik (sie bleiben als Verzeichnis-Kategorien selbstverständlich
-- erhalten), dafür kommen die klassischen Bau-Gewerke dazu.

-- 1) Bestehende Kategorie schärfen: Sanierung gehört ausdrücklich dazu.
update public.categories set
  name_sq = 'Ndërtim, Renovim & Sanim',
  name_de = 'Bau, Renovierung & Sanierung',
  name_en = 'Construction & Renovation',
  name_sr = 'Građevina i renoviranje'
where slug = 'ndertim';

-- 2) Neue Gewerke
insert into public.categories (slug, name_sq, name_de, name_en, name_sr, icon, sort) values
  ('bojatis',       'Bojatisje & Suvatim',        'Maler & Verputz',         'Painting & Plastering',   'Molerski radovi',         'paint-roller', 100),
  ('kulme',         'Kulme & Izolim',             'Dach & Dämmung',          'Roofing & Insulation',    'Krov i izolacija',        'layers',       101),
  ('dritare-dyer',  'Dritare & Dyer',             'Fenster & Türen',         'Windows & Doors',         'Prozori i vrata',         'door-open',    102),
  ('pllakosje',     'Pllakosje & Dysheme',        'Fliesen & Böden',         'Tiling & Flooring',       'Pločice i podovi',        'grid-2x2',     103),
  ('solar',         'Solar & Fotovoltaikë',       'Solar & Photovoltaik',    'Solar & Photovoltaics',   'Solarni paneli',          'sun',          104),
  ('metalpunues',   'Punime metalike & Alumin',   'Metallbau & Aluminium',   'Metalwork & Aluminium',   'Bravarija i aluminijum',  'fence',        105),
  ('kopsht-oborr',  'Kopsht & Oborr',             'Garten & Außenanlagen',   'Garden & Outdoor',        'Bašta i dvorište',        'trees',        106)
on conflict (slug) do nothing;

-- 3) Anfrage-Gewerke neu setzen: erst alles aus, dann die echte Handwerksliste.
update public.categories set is_trade = false;

update public.categories set is_trade = true
where slug in (
  'ndertim',        -- Bau, Renovierung & Sanierung
  'bojatis',        -- Maler & Verputz
  'elektricist',    -- Elektriker
  'hidraulik',      -- Klempner / Sanitär
  'klima-ngrohje',  -- Klima & Heizung
  'solar',          -- Solar & Photovoltaik
  'kulme',          -- Dach & Dämmung
  'dritare-dyer',   -- Fenster & Türen
  'pllakosje',      -- Fliesen & Böden
  'mobileri',       -- Schreiner / Innenausbau
  'metalpunues',    -- Metallbau & Aluminium
  'kopsht-oborr'    -- Garten & Außenanlagen
);

-- 4) Sortierung: Gewerke zuerst (sie tragen die Anfragen), danach der Rest.
update public.categories set sort = v.sort
from (values
  ('ndertim', 1), ('bojatis', 2), ('elektricist', 3), ('hidraulik', 4),
  ('klima-ngrohje', 5), ('solar', 6), ('kulme', 7), ('dritare-dyer', 8),
  ('pllakosje', 9), ('mobileri', 10), ('metalpunues', 11), ('kopsht-oborr', 12),
  ('pastrim', 13), ('transport', 14), ('auto-servis', 15),
  ('restorant', 16), ('kafene', 17), ('hotel', 18), ('bukuri', 19),
  ('shendetesi', 20), ('stomatolog', 21), ('avokat', 22), ('kontabilitet', 23),
  ('patundshmeri', 24), ('teknologji', 25), ('shitore', 26), ('mode', 27),
  ('evente', 28), ('edukim', 29), ('bujqesi', 30), ('sigurime-financa', 31),
  ('agjenci-punesimi', 32)
) as v(slug, sort)
where public.categories.slug = v.slug;
