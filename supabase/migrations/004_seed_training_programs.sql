insert into public.training_programs
  (slug, title_fr, title_en, description_fr, description_en,
   icon, accent, duration_min, group_size_min, group_size_max,
   highlights_fr, highlights_en, display_order)
values

('1-on-1',
 '1-on-1 Private Training', '1-on-1 Private Training',
 'Séance individuelle avec un coach dédié. Le format le plus intensif et le plus personnalisé.',
 'Individual session with a dedicated coach. The most intensive and personalized format.',
 '👤', 'from-resa-navy to-resa-royal', 60, 1, 1,
 ARRAY['Coach 100% dédié','Plan de travail individuel','Suivi de progression'],
 ARRAY['100% dedicated coach','Individual work plan','Progress tracking'], 1),

('semi-private',
 'Semi-Private Training', 'Semi-Private Training',
 'Séance pour 2 joueurs. Idéal pour un frère, une sœur ou un ami de même niveau.',
 'Session for 2 players. Ideal for a sibling or a friend at the same level.',
 '👥', 'from-resa-royal to-resa-navy', 60, 2, 2,
 ARRAY['2 joueurs max','Émulation saine','Tarif partagé'],
 ARRAY['Max 2 players','Healthy competition','Shared cost'], 2),

('small-group',
 'Small Group Training', 'Small Group Training',
 'Groupes de 3 à 6 joueurs. Compétition saine et travail technique collectif.',
 'Groups of 3 to 6 players. Healthy competition and collective technical work.',
 '🧑‍🤝‍🧑', 'from-resa-navy to-resa-navy-deep', 90, 3, 6,
 ARRAY['3 à 6 joueurs','Jeux réduits','Technique collective'],
 ARRAY['3 to 6 players','Small-sided games','Collective technique'], 3),

('team-training',
 'Team Training', 'Team Training',
 'Séances pour équipes complètes. Tactique collective, cohésion, préparation de match.',
 'Sessions for full teams. Collective tactics, cohesion, match preparation.',
 '🛡️', 'from-resa-red to-red-800', 90, 7, 20,
 ARRAY['Équipe complète','Tactique collective','Préparation match'],
 ARRAY['Full team','Collective tactics','Match preparation'], 4),

('goalkeeper',
 'Goalkeeper Training', 'Goalkeeper Training',
 'Programme spécialisé gardiens : réflexes, plongeons, jeu au pied, lecture du jeu.',
 'Specialized goalkeeper program: reflexes, dives, footwork, game reading.',
 '🧤', 'from-amber-500 to-amber-700', 60, 1, 4,
 ARRAY['Coach gardien certifié','Réflexes & plongeons','Jeu au pied'],
 ARRAY['Certified GK coach','Reflexes & dives','Footwork'], 5),

('technical-clinics',
 'Technical Development Clinics', 'Technical Development Clinics',
 'Clinics intensifs sur la technique individuelle : dribble, passe, frappe, contrôle.',
 'Intensive clinics on individual technique: dribbling, passing, shooting, control.',
 '⚽', 'from-emerald-600 to-emerald-800', 120, 6, 12,
 ARRAY['Stage intensif','Technique individuelle','Retour vidéo'],
 ARRAY['Intensive clinic','Individual technique','Video feedback'], 6),

('camps-tryouts',
 'Camps & Tryouts', 'Camps & Tryouts',
 'Stages de vacances et sessions de détection pour intégrer les programmes RESA Academy.',
 'Holiday camps and scouting sessions to join the RESA Academy programs.',
 '🏕️', 'from-purple-600 to-purple-800', 240, 10, 30,
 ARRAY['Vacances scolaires','Détection RESA','Intégration Academy'],
 ARRAY['School holidays','RESA scouting','Academy pathway'], 7)

on conflict (slug) do nothing;