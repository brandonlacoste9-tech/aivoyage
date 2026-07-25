-- Promo codes + redemptions

alter table public.profiles
  add column if not exists promo_code text,
  add column if not exists promo_expires_at timestamptz;

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  code text not null,
  effect text not null,
  created_at timestamptz not null default now(),
  unique (user_id, code)
);

create index if not exists promo_redemptions_user_id_idx
  on public.promo_redemptions (user_id);

alter table public.promo_redemptions enable row level security;

create policy "promo_redemptions_select_own" on public.promo_redemptions
  for select using (auth.uid() = user_id);

create policy "promo_redemptions_insert_own" on public.promo_redemptions
  for insert with check (auth.uid() = user_id);
