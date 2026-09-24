-- ============================================================
-- Table : coach_testimonials (témoignages)
-- ============================================================

create table if not exists public.coach_testimonials (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references public.coaches(id) on delete cascade,

  author_name   text not null,
  author_role_fr text,             -- ex: "Parent de joueur U9"
  author_role_en text,
  author_photo_url text,

  content_fr    text not null,
  content_en    text,

  rating        int check (rating between 1 and 5),
  is_featured   boolean default false,
  display_order int default 100,
  is_active     boolean default true,

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists coach_testimonials_coach_idx on public.coach_testimonials(coach_id);
create index if not exists coach_testimonials_active_idx on public.coach_testimonials(is_active);

drop trigger if exists coach_testimonials_set_updated_at on public.coach_testimonials;
create trigger coach_testimonials_set_updated_at
  before update on public.coach_testimonials
  for each row execute function public.set_updated_at();

alter table public.coach_testimonials enable row level security;

drop policy if exists "Témoignages lecture publique" on public.coach_testimonials;
create policy "Témoignages lecture publique"
  on public.coach_testimonials for select
  using (is_active = true);

drop policy if exists "Témoignages gestion admin" on public.coach_testimonials;
create policy "Témoignages gestion admin"
  on public.coach_testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- Table : coach_media (photos / vidéos)
-- ============================================================

create table if not exists public.coach_media (
  id            uuid primary key default gen_random_uuid(),
  coach_id      uuid not null references public.coaches(id) on delete cascade,

  media_type    text not null check (media_type in ('photo','video')),
  url           text not null,
  thumbnail_url text,
  caption_fr    text,
  caption_en    text,

  display_order int default 100,
  is_active     boolean default true,

  created_at    timestamptz default now()
);

create index if not exists coach_media_coach_idx  on public.coach_media(coach_id);
create index if not exists coach_media_active_idx on public.coach_media(is_active);

alter table public.coach_media enable row level security;

drop policy if exists "Médias coach lecture publique" on public.coach_media;
create policy "Médias coach lecture publique"
  on public.coach_media for select
  using (is_active = true);

drop policy if exists "Médias coach gestion admin" on public.coach_media;
create policy "Médias coach gestion admin"
  on public.coach_media for all
  using (public.is_admin())
  with check (public.is_admin());