-- Stadtzentren für Umkreis-Importe (OpenStreetMap) und spätere "In meiner Nähe"-Suche
alter table public.cities add column if not exists lat double precision;
alter table public.cities add column if not exists lng double precision;

update public.cities set lat = v.lat, lng = v.lng
from (values
  ('prishtina', 42.6629, 21.1655), ('prizren', 42.2139, 20.7397),
  ('peja', 42.6593, 20.2887), ('gjakova', 42.3803, 20.4308),
  ('mitrovica', 42.8914, 20.8660), ('mitrovica-veriore', 42.8988, 20.8623),
  ('ferizaj', 42.3702, 21.1483), ('gjilan', 42.4635, 21.4694),
  ('podujeva', 42.9106, 21.1930), ('vushtrri', 42.8231, 20.9675),
  ('suhareka', 42.3585, 20.8250), ('rahovec', 42.3994, 20.6547),
  ('drenas', 42.6236, 20.8939), ('lipjan', 42.5217, 21.1258),
  ('malisheva', 42.4844, 20.7458), ('kamenica', 42.5781, 21.5803),
  ('viti', 42.3214, 21.3583), ('decan', 42.5403, 20.2875),
  ('istog', 42.7808, 20.4875), ('klina', 42.6203, 20.5775),
  ('skenderaj', 42.7469, 20.7886), ('dragash', 42.0611, 20.6528),
  ('fushe-kosova', 42.6300, 21.0958), ('kacanik', 42.2319, 21.2594),
  ('shtime', 42.4331, 21.0397), ('obiliq', 42.6869, 21.0700),
  ('junik', 42.4761, 20.2775), ('hani-i-elezit', 42.1503, 21.2961),
  ('mamusha', 42.3247, 20.7225), ('gracanica', 42.5989, 21.1942),
  ('ranillug', 42.4922, 21.5533), ('partesh', 42.4022, 21.4336),
  ('kllokot', 42.3672, 21.3744), ('novoberda', 42.6167, 21.4333),
  ('shterpca', 42.2394, 21.0272), ('zubin-potok', 42.9147, 20.6897),
  ('zvecan', 42.9075, 20.8400), ('leposaviq', 43.1039, 20.8017)
) as v(slug, lat, lng)
where cities.slug = v.slug;
