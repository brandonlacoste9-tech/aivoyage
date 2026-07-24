-- Multi-city support: optional city label per day + structured cities on trip

alter table public.days
  add column if not exists city text;

alter table public.trips
  add column if not exists cities jsonb not null default '[]'::jsonb;

comment on column public.trips.cities is
  'Array of { name, nights, order, arrival_date? } for multi-city itineraries';

comment on column public.days.city is
  'City/region this day is based in for multi-city trips';
