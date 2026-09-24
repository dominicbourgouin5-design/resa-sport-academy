-- Ajouts à la table sponsors
alter table public.sponsors
  add column if not exists long_description_fr text,
  add column if not exists long_description_en text,
  add column if not exists sector_fr         text,
  add column if not exists sector_en         text,
  add column if not exists since_year        int,
  add column if not exists social_linkedin   text,
  add column if not exists social_instagram  text,
  add column if not exists social_facebook   text,
  add column if not exists social_twitter    text;

comment on column public.sponsors.long_description_fr is
  'Texte riche (HTML) affiché sur la page dédiée du sponsor';
  