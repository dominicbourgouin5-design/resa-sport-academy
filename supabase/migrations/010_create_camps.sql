-- ═══════════════════════════════════════════════════════════
-- Table : camps (et tryouts)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.camps (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text unique not null,
  type                  text not null default 'camp'
                        check (type in ('camp','tryout')),

  title_fr              text not null,
  title_en              text not null,
  description_fr        text,
  description_en        text,
  long_description_fr   text,
  long_description_en   text,

  image_url             text,

  date_start            date not null,
  date_end              date,
  time_start            text,        -- "09:00"
  time_end              text,        -- "17:00"

  location              text,
  age_min               int,
  age_max               int,
  capacity              int,

  price_fr              text,        -- "25 000 FCFA"
  price_en              text,        -- "$40"
  price_amount          int,         -- montant brut (pour FedaPay)

  -- Lien vers un programme training (optionnel)
  program_slug          text,

  status                text default 'open'
                        check (status in ('open','full','closed','cancelled')),

  region                text default 'both'
                        check (region in ('usa','africa','both')),

  is_active             boolean default true,
  display_order         int default 100,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists camps_slug_idx    on public.camps(slug);
create index if not exists camps_date_idx    on public.camps(date_start);
create index if not exists camps_active_idx  on public.camps(is_active);
create index if not exists camps_type_idx    on public.camps(type);

drop trigger if exists camps_set_updated_at on public.camps;
create trigger camps_set_updated_at
  before update on public.camps
  for each row execute function public.set_updated_at();

alter table public.camps enable row level security;

drop policy if exists "Camps lecture publique" on public.camps;
create policy "Camps lecture publique"
  on public.camps for select
  using (is_active = true);

drop policy if exists "Camps gestion admin" on public.camps;
create policy "Camps gestion admin"
  on public.camps for all
  using (public.is_admin())
  with check (public.is_admin());


-- ═══════════════════════════════════════════════════════════
-- Table : camp_registrations (inscriptions aux camps/tryouts)
-- ═══════════════════════════════════════════════════════════

create table if not exists public.camp_registrations (
  id                uuid primary key default gen_random_uuid(),
  camp_id           uuid not null references public.camps(id) on delete cascade,

  -- Parent / référent
  parent_name       text not null,
  parent_email      text not null,
  parent_phone      text,

  -- Joueur
  player_name       text not null,
  player_age        int,
  player_birth_date date,

  -- Notes libres
  notes             text,

  -- Paiement
  payment_status    text not null default 'pending'
                    check (payment_status in ('pending','paid','failed','refunded','cancelled')),
  payment_method    text,        -- 'fedapay' | 'paypal' | 'manual'
  payment_provider_id text,      -- ID transaction chez FedaPay/PayPal
  amount_paid       int,
  paid_at           timestamptz,

  -- Admin
  admin_notes       text,
  status            text default 'new'
                    check (status in ('new','contacted','confirmed','cancelled')),

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists camp_regs_camp_idx    on public.camp_registrations(camp_id);
create index if not exists camp_regs_status_idx  on public.camp_registrations(status);
create index if not exists camp_regs_payment_idx on public.camp_registrations(payment_status);

drop trigger if exists camp_regs_set_updated_at on public.camp_registrations;
create trigger camp_regs_set_updated_at
  before update on public.camp_registrations
  for each row execute function public.set_updated_at();

alter table public.camp_registrations enable row level security;

drop policy if exists "Inscriptions camps insert public" on public.camp_registrations;
create policy "Inscriptions camps insert public"
  on public.camp_registrations for insert
  with check (true);

drop policy if exists "Inscriptions camps gestion admin" on public.camp_registrations;
create policy "Inscriptions camps gestion admin"
  on public.camp_registrations for all
  using (public.is_admin())
  with check (public.is_admin());

grant insert on public.camp_registrations to anon, authenticated;
grant select, update, delete on public.camp_registrations to authenticated;