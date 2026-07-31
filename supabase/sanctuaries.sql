-- ──────────────────────────────────────────────────────────────────────────
-- KindQuest — sanctuaries for the Parents' Corner map.
--
-- Run this ONCE in the Supabase SQL Editor (safe to re-run; it upserts).
-- After this you can add sanctuaries in Table Editor → sanctuaries → Insert row,
-- with no code changes: the app picks them up on the next refresh.
--
-- ⚠️ Coordinates below are APPROXIMATE. Verify each one (and ideally get the
-- sanctuary's permission to be listed) before real families use this.
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.sanctuaries (
  id          bigint generated always as identity primary key,
  name        text not null,
  country     text,
  lat         double precision not null,   -- e.g. 32.36
  lng         double precision not null,   -- e.g. 34.92
  site        text,                        -- full URL incl. https://
  notes       text,                        -- optional: "visits by appointment"
  published   boolean not null default true, -- untick to hide without deleting
  created_at  timestamptz not null default now()
);

-- Public read-only access (same approach as the animals table).
alter table public.sanctuaries enable row level security;

drop policy if exists "Public can read sanctuaries" on public.sanctuaries;
create policy "Public can read sanctuaries"
  on public.sanctuaries
  for select
  using (published);

-- ── Seed data ──────────────────────────────────────────────────────────────
-- Uses name as the natural key so re-running updates rather than duplicates.
create unique index if not exists sanctuaries_name_key on public.sanctuaries (name);

insert into public.sanctuaries (name, country, lat, lng, site) values
  ('Freedom Farm Sanctuary',        'Israel',      32.3600,  34.9200, 'https://www.freedom-farm.org.il/en/'),
  ('Farm Sanctuary — Watkins Glen', 'USA',         42.3800, -76.8700, 'https://www.farmsanctuary.org'),
  ('Woodstock Farm Sanctuary',      'USA',         41.9300, -73.9900, 'https://woodstocksanctuary.org'),
  ('Catskill Animal Sanctuary',     'USA',         41.8400, -74.0500, 'https://casanctuary.org'),
  ('Gentle Barn — California',      'USA',         34.4200,-118.5600, 'https://www.gentlebarn.org'),
  ('PIGS Animal Sanctuary',         'USA',         38.6300, -78.6600, 'https://pigs.org'),
  ('Hillside Animal Sanctuary',     'UK',          52.7300,   1.3200, 'https://www.hillside.org.uk'),
  ('Goodheart Animal Sanctuaries',  'UK',          52.3300,  -2.2500, 'https://goodheartanimalsanctuaries.com'),
  ('Land van Morgen',               'Netherlands', 52.0900,   5.1200, 'https://landvanmorgen.nl'),
  ('Hof Butenland',                 'Germany',     53.4700,   8.0500, 'https://www.hof-butenland.de')
on conflict (name) do update set
  country = excluded.country, lat = excluded.lat, lng = excluded.lng,
  site = excluded.site;
