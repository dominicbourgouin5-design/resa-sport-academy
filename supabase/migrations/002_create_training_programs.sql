-- ============================================================
-- Table : training_programs
-- ============================================================

create table if not exists public.training_programs (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  title_fr              text not null,
  title_en              text not null,
  description_fr        text,
  description_en        text,
  long_description_fr   text,
  long_description_en   text,

  icon                  text,
  image_url             text,
  accent                text default 'from-resa-navy to-resa-royal',

  duration_min          int,
  group_size_min        int,
  group_size_max        int,
  price_fr              text,
  price_en              text,

  highlights_fr         text[] default '{}',
  highlights_en         text[] default '{}',

  region                text default 'both' check (region in ('usa','africa','both')),
  display_order         int default 100,
  is_active             boolean default true,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists training_programs_slug_idx   on public.training_programs(slug);
create index if not exists training_programs_active_idx on public.training_programs(is_active);
create index if not exists training_programs_region_idx on public.training_programs(region);

drop trigger if exists training_programs_set_updated_at on public.training_programs;
create trigger training_programs_set_updated_at
  before update on public.training_programs
  for each row execute function public.set_updated_at();

alter table public.training_programs enable row level security;

drop policy if exists "Programmes lecture publique" on public.training_programs;
create policy "Programmes lecture publique"
  on public.training_programs for select
  using (is_active = true);

drop policy if exists "Programmes gestion admin" on public.training_programs;
create policy "Programmes gestion admin"
  on public.training_programs for all
  using (public.is_admin())
  with check (public.is_admin());