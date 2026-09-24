-- ============================================================
-- Seed : témoignages + médias pour Roger Sampah
-- ⚠️ Placeholders — le client pourra les modifier via admin
-- ============================================================

do $$
declare
  roger_id uuid;
begin
  select id into roger_id from public.coaches where slug = 'roger-sampah';
  if roger_id is null then
    raise notice 'Coach roger-sampah introuvable — skip seed';
    return;
  end if;

  -- ─── Témoignages (placeholders) ───
  insert into public.coach_testimonials
    (coach_id, author_name, author_role_fr, author_role_en, content_fr, content_en, rating, is_featured, display_order)
  values
    (roger_id, 'Mme Kouassi', 'Parent de joueur U9', 'Parent of U9 player',
     'Coach Roger a transformé la confiance de mon fils. En 6 mois, il est passé d''un enfant timide à un joueur qui prend des initiatives sur le terrain.',
     'Coach Roger transformed my son''s confidence. In 6 months, he went from a shy child to a player who takes initiative on the pitch.',
     5, true, 1),

    (roger_id, 'M. Traoré', 'Parent de joueur U11', 'Parent of U11 player',
     'Un encadrement exigeant mais bienveillant. Mon fils progresse chaque semaine et surtout, il aime ce qu''il fait.',
     'Demanding but caring coaching. My son improves every week and most of all, he loves what he does.',
     5, true, 2),

    (roger_id, 'Coach Amadou', 'Directeur technique RESA', 'RESA Technical Director',
     'Travailler aux côtés de Roger, c''est apprendre chaque jour. Sa vision du développement du jeune joueur est unique en Côte d''Ivoire.',
     'Working alongside Roger means learning every day. His vision for developing young players is unique in Côte d''Ivoire.',
     5, false, 3),

    (roger_id, 'Famille Bamba', 'Parents de deux joueurs U7 et U9', 'Parents of two U7 and U9 players',
     'Nos deux garçons ont commencé avec Roger. Nous apprécions son professionnalisme et sa capacité à s''adapter à chaque enfant.',
     'Both our boys started with Roger. We appreciate his professionalism and his ability to adapt to each child.',
     5, false, 4);

  -- ─── Médias (placeholders — remplacer par les vraies vidéos/photos) ───
  insert into public.coach_media
    (coach_id, media_type, url, thumbnail_url, caption_fr, caption_en, display_order)
  values
    (roger_id, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ',
     'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
     'Session type — 1-on-1 avec un U11',
     'Sample session — 1-on-1 with a U11',
     1),

    (roger_id, 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ',
     'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
     'Atelier technique — contrôle orienté',
     'Technical clinic — oriented control',
     2),

    (roger_id, 'photo', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80',
     null,
     'Séance sur le terrain — Abidjan',
     'Session on the pitch — Abidjan',
     3),

    (roger_id, 'photo', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&q=80',
     null,
     'Travail avec les U9',
     'Working with the U9s',
     4),

    (roger_id, 'photo', 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=1200&q=80',
     null,
     'Match de la Ligue Scolaire',
     'School League match',
     5),

    (roger_id, 'photo', 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200&q=80',
     null,
     'Cérémonie de remise des trophées',
     'Trophy ceremony',
     6);
end $$;