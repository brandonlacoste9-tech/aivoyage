-- VoyageAI initial schema + RLS

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  ai_generations_month int not null default 0,
  ai_generations_reset_at timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget_cents int,
  currency text not null default 'USD',
  preferences jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'generating', 'ready', 'failed', 'archived')),
  share_token text unique,
  cover_url text,
  error_message text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trips_owner_id_idx on public.trips (owner_id);
create index if not exists trips_share_token_idx on public.trips (share_token);

create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  date date not null,
  day_order int not null default 0,
  notes text
);

create index if not exists days_trip_id_idx on public.days (trip_id);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.days (id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'other'
    check (type in ('food', 'culture', 'nature', 'nightlife', 'shopping', 'transport', 'stay', 'other')),
  start_time text,
  duration_min int,
  cost_cents int,
  lat double precision,
  lng double precision,
  place_id text,
  address text,
  sort_order int not null default 0,
  notes text
);

create index if not exists activities_day_id_idx on public.activities (day_id);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  activity_id uuid references public.activities (id) on delete set null,
  amount_cents int not null,
  category text not null default 'misc',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists expenses_trip_id_idx on public.expenses (trip_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_updated_at on public.trips;
create trigger trips_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.days enable row level security;
alter table public.activities enable row level security;
alter table public.expenses enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Trips
create policy "trips_select_own" on public.trips
  for select using (auth.uid() = owner_id);
create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = owner_id);
create policy "trips_update_own" on public.trips
  for update using (auth.uid() = owner_id);
create policy "trips_delete_own" on public.trips
  for delete using (auth.uid() = owner_id);

-- Public share read via token (anon can read trip when token present in request
-- is handled through a security definer function)
create or replace function public.get_shared_trip(p_token text)
returns setof public.trips
language sql
security definer
set search_path = public
stable
as $$
  select * from public.trips
  where share_token = p_token and status in ('ready', 'draft', 'generating');
$$;

grant execute on function public.get_shared_trip(text) to anon, authenticated;

create or replace function public.get_shared_days(p_token text)
returns setof public.days
language sql
security definer
set search_path = public
stable
as $$
  select d.* from public.days d
  join public.trips t on t.id = d.trip_id
  where t.share_token = p_token;
$$;

grant execute on function public.get_shared_days(text) to anon, authenticated;

create or replace function public.get_shared_activities(p_token text)
returns setof public.activities
language sql
security definer
set search_path = public
stable
as $$
  select a.* from public.activities a
  join public.days d on d.id = a.day_id
  join public.trips t on t.id = d.trip_id
  where t.share_token = p_token;
$$;

grant execute on function public.get_shared_activities(text) to anon, authenticated;

-- Days
create policy "days_select_own" on public.days
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = days.trip_id and t.owner_id = auth.uid()
    )
  );
create policy "days_insert_own" on public.days
  for insert with check (
    exists (
      select 1 from public.trips t
      where t.id = days.trip_id and t.owner_id = auth.uid()
    )
  );
create policy "days_update_own" on public.days
  for update using (
    exists (
      select 1 from public.trips t
      where t.id = days.trip_id and t.owner_id = auth.uid()
    )
  );
create policy "days_delete_own" on public.days
  for delete using (
    exists (
      select 1 from public.trips t
      where t.id = days.trip_id and t.owner_id = auth.uid()
    )
  );

-- Activities
create policy "activities_select_own" on public.activities
  for select using (
    exists (
      select 1 from public.days d
      join public.trips t on t.id = d.trip_id
      where d.id = activities.day_id and t.owner_id = auth.uid()
    )
  );
create policy "activities_insert_own" on public.activities
  for insert with check (
    exists (
      select 1 from public.days d
      join public.trips t on t.id = d.trip_id
      where d.id = activities.day_id and t.owner_id = auth.uid()
    )
  );
create policy "activities_update_own" on public.activities
  for update using (
    exists (
      select 1 from public.days d
      join public.trips t on t.id = d.trip_id
      where d.id = activities.day_id and t.owner_id = auth.uid()
    )
  );
create policy "activities_delete_own" on public.activities
  for delete using (
    exists (
      select 1 from public.days d
      join public.trips t on t.id = d.trip_id
      where d.id = activities.day_id and t.owner_id = auth.uid()
    )
  );

-- Expenses
create policy "expenses_select_own" on public.expenses
  for select using (
    exists (
      select 1 from public.trips t
      where t.id = expenses.trip_id and t.owner_id = auth.uid()
    )
  );
create policy "expenses_insert_own" on public.expenses
  for insert with check (
    exists (
      select 1 from public.trips t
      where t.id = expenses.trip_id and t.owner_id = auth.uid()
    )
  );
create policy "expenses_update_own" on public.expenses
  for update using (
    exists (
      select 1 from public.trips t
      where t.id = expenses.trip_id and t.owner_id = auth.uid()
    )
  );
create policy "expenses_delete_own" on public.expenses
  for delete using (
    exists (
      select 1 from public.trips t
      where t.id = expenses.trip_id and t.owner_id = auth.uid()
    )
  );
