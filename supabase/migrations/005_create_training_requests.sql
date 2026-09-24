-- ============================================================
-- Table : training_requests
-- Demandes de réservation (Private Training)
-- ============================================================

create table if not exists public.training_requests (
  id              uuid primary key default gen_random_uuid(),

  -- Programme ciblé
  program_slug    text,
  program_title   text,

  -- Contact parent / tuteur
  parent_name     text not null,
  parent_email    text not null,
  parent_phone    text,

  -- Joueur
  player_name     text,
  player_age      int,
  player_level    text,   -- 'beginner' | 'intermediate' | 'advanced'

  -- Préférences
  region          text,   -- 'usa' | 'africa'
  preferred_coach text,
  availability    text,
  message         text,

  -- Suivi admin
  status          text default 'pending'
    check (status in ('pending','contacted','booked','cancelled')),
  admin_notes     text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists training_requests_status_idx     on public.training_requests(status);
create index if not exists training_requests_created_at_idx on public.training_requests(created_at desc);
create index if not exists training_requests_program_idx    on public.training_requests(program_slug);

-- Trigger updated_at
drop trigger if exists training_requests_set_updated_at on public.training_requests;
create trigger training_requests_set_updated_at
  before update on public.training_requests
  for each row execute function public.set_updated_at();

-- RLS
alter table public.training_requests enable row level security;

-- Insert public (formulaire)
drop policy if exists "Demandes training insert public" on public.training_requests;
create policy "Demandes training insert public"
  on public.training_requests for insert
  with check (true);

-- Lecture / modification admin
drop policy if exists "Demandes training gestion admin" on public.training_requests;
create policy "Demandes training gestion admin"
  on public.training_requests for all
  using (public.is_admin())
  with check (public.is_admin());

-- GRANTs (au cas où)
grant insert on public.training_requests to anon, authenticated;
grant select, update, delete on public.training_requests to authenticated;