insert into public.coaches
  (slug, name, initials, flag, location, role_fr, role_en,
   specialties_fr, specialties_en,
   bio_short_fr, bio_short_en,
   experience_years, certifications, languages,
   career, is_featured, region, display_order)
values

-- 1. Roger Sampah (fondateur, featured)
(
  'roger-sampah', 'Roger Sampah', 'RS', '🇨🇮', 'Abidjan, Côte d''Ivoire',
  'Fondateur & Head Coach', 'Founder & Head Coach',
  ARRAY['Head coaching','Développement joueur','Détection'],
  ARRAY['Head coaching','Player development','Scouting'],
  'Fondateur de RESA Sport Academy. Plus de 15 ans d''expérience dans la formation de jeunes joueurs en Côte d''Ivoire et aux États-Unis.',
  'Founder of RESA Sport Academy. Over 15 years of experience developing young players in Côte d''Ivoire and the USA.',
  15,
  ARRAY['CAF B','US Soccer Grassroots'],
  ARRAY['Français','Anglais'],
  '[
    {"period":"2015 – aujourd''hui","role_fr":"Fondateur & Head Coach","role_en":"Founder & Head Coach","club":"RESA Sport Academy"},
    {"period":"2010 – 2015","role_fr":"Entraîneur jeunes","role_en":"Youth Coach","club":"Académie locale – Abidjan"}
  ]'::jsonb,
  true, 'both', 1
),

-- 2. Coach Amadou (technique, CI)
(
  'amadou-kone', 'Coach Amadou', 'AK', '🇨🇮', 'Abidjan, Côte d''Ivoire',
  'Directeur technique', 'Technical Director',
  ARRAY['Technique','Tactique','Jeunes'],
  ARRAY['Technical','Tactical','Youth'],
  'Spécialiste du développement technique individuel. Forme les jeunes joueurs U9 à U13 sur les fondamentaux.',
  'Specialist in individual technical development. Trains U9 to U13 players on the fundamentals.',
  10,
  ARRAY['CAF C'],
  ARRAY['Français'],
  '[]'::jsonb,
  false, 'africa', 10
),

-- 3. Coach David (GK, USA)
(
  'david-kim', 'Coach David', 'DK', '🇺🇸', 'Atlanta, USA',
  'Coach des gardiens', 'Goalkeeper Coach',
  ARRAY['Gardiens','Réflexes'],
  ARRAY['Goalkeeping','Reflexes'],
  'Ancien gardien universitaire, spécialisé dans la formation des gardiens de 8 à 15 ans.',
  'Former collegiate goalkeeper, specialized in training goalkeepers aged 8 to 15.',
  8,
  ARRAY['US Soccer C','US Soccer GK License'],
  ARRAY['English'],
  '[]'::jsonb,
  false, 'usa', 20
),

-- 4. Coach Mike (physique, USA)
(
  'mike-johnson', 'Coach Mike', 'MJ', '🇺🇸', 'Atlanta, USA',
  'Préparateur physique', 'Physical Trainer',
  ARRAY['Physique','Vitesse'],
  ARRAY['Physical','Speed'],
  'Préparateur physique certifié, spécialisé dans la vitesse et l''agilité pour jeunes athlètes.',
  'Certified physical trainer, specialized in speed and agility for young athletes.',
  7,
  ARRAY['NSCA-CPT'],
  ARRAY['English'],
  '[]'::jsonb,
  false, 'usa', 30
),

-- 5. Coach Fatou (jeunes, CI)
(
  'fatou-bamba', 'Coach Fatou', 'FB', '🇨🇮', 'Abidjan, Côte d''Ivoire',
  'Éducatrice jeunes', 'Youth Educator',
  ARRAY['U7 – U9','Motricité'],
  ARRAY['U7 – U9','Motor skills'],
  'Éducatrice spécialisée dans l''initiation des tout-petits (U7 – U9). Approche ludique et progressive.',
  'Educator specialized in introducing the youngest (U7 – U9). Playful and progressive approach.',
  6,
  ARRAY['CAF D'],
  ARRAY['Français'],
  '[]'::jsonb,
  false, 'africa', 40
),

-- 6. Coach James (USA dev)
(
  'james-carter', 'Coach James', 'JC', '🇺🇸', 'Miami, USA',
  'Coach développement USA', 'USA Development Coach',
  ARRAY['Tactique','Team training'],
  ARRAY['Tactical','Team training'],
  'Entraîneur diplômé US Soccer, spécialisé dans la tactique collective et le team training.',
  'US Soccer certified coach, specialized in collective tactics and team training.',
  9,
  ARRAY['US Soccer B'],
  ARRAY['English','Spanish'],
  '[]'::jsonb,
  false, 'usa', 50
)

on conflict (slug) do nothing;