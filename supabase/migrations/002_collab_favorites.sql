-- Collaborators + favorite places
create extension if not exists "pgcrypto";

create table if not exists public.trip_collaborators (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  email text not null,
  user_id uuid references public.profiles (id) on delete set null,
  role text not null default 'viewer' check (role in ('editor', 'viewer')),
  invite_token text unique not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (trip_id, email)
);

create index if not exists trip_collaborators_trip_id_idx on public.trip_collaborators (trip_id);
create index if not exists trip_collaborators_user_id_idx on public.trip_collaborators (user_id);
create index if not exists trip_collaborators_token_idx on public.trip_collaborators (invite_token);

create table if not exists public.favorite_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  type text not null default 'other',
  destination text,
  address text,
  lat double precision,
  lng double precision,
  image_url text,
  notes text,
  activity_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists favorite_places_user_id_idx on public.favorite_places (user_id);

alter table public.trip_collaborators enable row level security;
alter table public.favorite_places enable row level security;

-- Helpers
create or replace function public.is_trip_owner(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trips t
    where t.id = p_trip_id and t.owner_id = auth.uid()
  );
$$;

create or replace function public.can_access_trip(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trips t
    where t.id = p_trip_id and t.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.trip_collaborators c
    where c.trip_id = p_trip_id
      and c.status = 'accepted'
      and c.user_id = auth.uid()
  );
$$;

grant execute on function public.is_trip_owner(uuid) to authenticated;
grant execute on function public.can_access_trip(uuid) to authenticated;

-- Collaborators policies
create policy "collab_select" on public.trip_collaborators
  for select using (
    public.is_trip_owner(trip_id)
    or user_id = auth.uid()
    or email = (auth.jwt() ->> 'email')
  );

create policy "collab_insert_owner" on public.trip_collaborators
  for insert with check (public.is_trip_owner(trip_id) and invited_by = auth.uid());

create policy "collab_update" on public.trip_collaborators
  for update using (
    public.is_trip_owner(trip_id)
    or user_id = auth.uid()
    or email = (auth.jwt() ->> 'email')
  );

create policy "collab_delete_owner" on public.trip_collaborators
  for delete using (public.is_trip_owner(trip_id));

-- Favorites policies
create policy "favorites_select_own" on public.favorite_places
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorite_places
  for insert with check (auth.uid() = user_id);
create policy "favorites_update_own" on public.favorite_places
  for update using (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorite_places
  for delete using (auth.uid() = user_id);

-- Expand trip read access for accepted collaborators
drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own_or_collab" on public.trips
  for select using (
    auth.uid() = owner_id
    or public.can_access_trip(id)
  );

-- Days / activities readable by collaborators
drop policy if exists "days_select_own" on public.days;
create policy "days_select_access" on public.days
  for select using (public.can_access_trip(trip_id));

drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_access" on public.activities
  for select using (
    exists (
      select 1 from public.days d
      where d.id = activities.day_id and public.can_access_trip(d.trip_id)
    )
  );

drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_access" on public.expenses
  for select using (public.can_access_trip(trip_id));

-- Accept invite RPC
create or replace function public.accept_trip_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_trip uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.trip_collaborators c
  set
    status = 'accepted',
    user_id = auth.uid()
  where c.invite_token = p_token
    and c.status = 'pending'
    and (
      c.email = (auth.jwt() ->> 'email')
      or c.email ilike (auth.jwt() ->> 'email')
    )
  returning c.id, c.trip_id into v_id, v_trip;

  if v_id is null then
    -- allow accept if email was approximate / owner shared open invite to this account
    update public.trip_collaborators c
    set status = 'accepted', user_id = auth.uid()
    where c.invite_token = p_token
      and c.status = 'pending'
    returning c.id, c.trip_id into v_id, v_trip;
  end if;

  if v_trip is null then
    raise exception 'Invite not found or already used';
  end if;

  return v_trip;
end;
$$;

grant execute on function public.accept_trip_invite(text) to authenticated;
