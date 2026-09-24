-- ============================================================
-- Colonne story_type sur la table news
-- ============================================================

alter table public.news
  add column if not exists story_type text
  check (story_type in ('player', 'coach'));

create index if not exists news_story_type_idx
  on public.news(story_type)
  where story_type is not null;

-- Story_type est NULL pour les articles normaux
comment on column public.news.story_type is
  'Type de contenu : NULL = article standard, player = Player Story, coach = Coach Story';