-- Neue Kategorie: Personalvermittlung / Arbeitsvermittlung
-- (bisher landeten solche Betriebe unter "Edukim & Kurse")
insert into public.categories (slug, name_sq, name_de, name_en, name_sr, icon, sort)
values
  ('agjenci-punesimi', 'Agjenci Punësimi', 'Personalagentur',
   'Employment Agency', 'Agencija za zapošljavanje', 'briefcase', 25)
on conflict (slug) do nothing;
