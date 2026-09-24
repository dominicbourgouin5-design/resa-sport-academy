-- ============================================================
-- Table : coaches
-- ============================================================

create table if not exists public.coaches (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  initials          text,
  photo_url         text,
  cover_url         text,
  flag              text,
  location          text,
  nationality_fr    text,
  nationality_en    text,
  email             text,
  phone             text,
  whatsapp          text,

  role_fr           text,
  role_en           text,

  specialties_fr    text[] default '{}',
  specialties_en    text[] default '{}',

  bio_short_fr      text,
  bio_short_en      text,
  bio_long_fr       text,
  bio_long_en       text,

  philosophy_fr     text,
  philosophy_en     text,

  experience_years  int,
  certifications    text[] default '{}',
  languages         text[] default '{}',

  -- Format : [{ "period": "2018 – 2022", "role_fr": "…", "role_en": "…", "club": "…" }]
  career            jsonb default '[]'::jsonb,

  social_instagram  text,
  social_linkedin   text,
  social_twitter    text,

  is_featured       boolean default false,
  region            text default 'both' check (region in ('usa','africa','both')),
  display_order     int default 100,
  is_active         boolean default true,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists coaches_slug_idx    on public.coaches(slug);
create index if not exists coaches_active_idx  on public.coaches(is_active);
create index if not exists coaches_region_idx  on public.coaches(region);
create index if not exists coaches_featured_idx on public.coaches(is_featured);

-- Trigger updated_at
drop trigger if exists coaches_set_updated_at on public.coaches;
create trigger coaches_set_updated_at
  before update on public.coaches
  for each row execute function public.set_updated_at();

-- RLS
alter table public.coaches enable row level security;

drop policy if exists "Coaches lecture publique" on public.coaches;
create policy "Coaches lecture publique"
  on public.coaches for select
  using (is_active = true);

drop policy if exists "Coaches gestion admin" on public.coaches;
create policy "Coaches gestion admin"
  on public.coaches for all
  using (public.is_admin())
  with check (public.is_admin());