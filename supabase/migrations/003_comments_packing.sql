-- Activity comments + packing lists on trips

create table if not exists public.activity_comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_comments_activity_id_idx on public.activity_comments (activity_id);
create index if not exists activity_comments_trip_id_idx on public.activity_comments (trip_id);

alter table public.trips
  add column if not exists packing_list jsonb not null default '[]'::jsonb;

alter table public.activity_comments enable row level security;

create policy "comments_select_access" on public.activity_comments
  for select using (public.can_access_trip(trip_id));

create policy "comments_insert_access" on public.activity_comments
  for insert with check (
    public.can_access_trip(trip_id) and user_id = auth.uid()
  );

create policy "comments_delete_own" on public.activity_comments
  for delete using (user_id = auth.uid() or public.is_trip_owner(trip_id));

-- Allow trip owners to update packing_list (covered by trips_update_own)
