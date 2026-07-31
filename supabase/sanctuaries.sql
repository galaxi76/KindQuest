-- ──────────────────────────────────────────────────────────────────────────
-- KindQuest — sanctuaries for the Parents' Corner map.
--
-- Run this in the Supabase SQL Editor (safe to re-run; it upserts by name).
-- Afterwards you can add sanctuaries in Table Editor → sanctuaries → Insert row,
-- with no code changes: the app picks them up on the next refresh.
--
-- ⚠️ EVERY ROW BELOW IS UNVERIFIED (verified = false).
-- These are real organisations, but coordinates are APPROXIMATE (town level,
-- not the visitor entrance) and none has been contacted. Before launch, for
-- each one: confirm it still operates, that it welcomes visitors, move the pin
-- to the actual entrance, and ideally ask permission to be listed. Then set
-- verified = true for that row.
--
-- To get exact coordinates: right-click the spot in Google Maps — the first
-- menu item is "lat, lng"; the first number is lat, the second is lng.
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.sanctuaries (
  id          bigint generated always as identity primary key,
  name        text not null,
  country     text,
  lat         double precision not null,
  lng         double precision not null,
  site        text,                          -- full URL incl. https://
  notes       text,                          -- e.g. "visits by appointment"
  verified    boolean not null default false, -- you checked it: real, open, pin correct
  published   boolean not null default true,  -- untick to hide without deleting
  created_at  timestamptz not null default now()
);

-- Safe to re-run: adds columns introduced after the table was first created.
alter table public.sanctuaries add column if not exists verified boolean not null default false;

-- Public read-only access (same approach as the animals table).
alter table public.sanctuaries enable row level security;

drop policy if exists "Public can read sanctuaries" on public.sanctuaries;
create policy "Public can read sanctuaries"
  on public.sanctuaries
  for select
  using (published);

create unique index if not exists sanctuaries_name_key on public.sanctuaries (name);

-- ── Seed data ──────────────────────────────────────────────────────────────
insert into public.sanctuaries (name, country, lat, lng, site, notes) values
  -- Middle East
  ('Freedom Farm Sanctuary',        'Israel',       32.3600,  34.9200, 'https://www.freedom-farm.org.il/en/', null),
  -- North America
  ('Farm Sanctuary — Watkins Glen', 'USA',          42.3800, -76.8700, 'https://www.farmsanctuary.org', null),
  ('Woodstock Farm Sanctuary',      'USA',          41.9300, -73.9900, 'https://woodstocksanctuary.org', null),
  ('Catskill Animal Sanctuary',     'USA',          41.8400, -74.0500, 'https://casanctuary.org', null),
  ('Gentle Barn — California',      'USA',          34.4200,-118.5600, 'https://www.gentlebarn.org', null),
  ('PIGS Animal Sanctuary',         'USA',          38.6300, -78.6600, 'https://pigs.org', null),
  ('The Donkey Sanctuary of Canada','Canada',       43.5500, -80.2500, 'https://www.thedonkeysanctuary.ca', 'Guelph, Ontario'),
  ('North Mountain Animal Sanctuary','Canada',      45.1000, -64.4500, 'https://www.northmountainanimalsanctuary.ca', 'Nova Scotia'),
  -- South America
  ('Santuario Equidad',             'Argentina',   -30.7800, -64.6400, 'https://www.santuarioequidad.org', 'San Marcos Sierra, Córdoba'),
  ('Elephant Sanctuary Brazil',     'Brazil',      -15.4600, -55.7500, 'https://globalelephants.org', 'Elephants, not farm animals'),
  -- Europe
  ('Hillside Animal Sanctuary',     'UK',           52.7300,   1.3200, 'https://www.hillside.org.uk', null),
  ('Goodheart Animal Sanctuaries',  'UK',           52.3300,  -2.2500, 'https://goodheartanimalsanctuaries.com', null),
  ('Eden Farmed Animal Sanctuary',  'Ireland',      53.1000,  -7.1000, 'https://www.edenfarmedanimalsanctuary.com', null),
  ('Land van Morgen',               'Netherlands',  52.0900,   5.1200, 'https://landvanmorgen.nl', null),
  ('De Zonnegloed',                 'Belgium',      50.9000,   2.7500, 'https://www.dezonnegloed.be', 'Oostvleteren'),
  ('Hof Butenland',                 'Germany',      53.4700,   8.0500, 'https://www.hof-butenland.de', null),
  ('Gut Aiderbichl',                'Austria',      47.9400,  13.1900, 'https://www.gut-aiderbichl.com', 'Henndorf, near Salzburg'),
  ('Hof Narr',                      'Switzerland',  47.3200,   8.7000, 'https://www.hofnarr.ch', null),
  ('GroinGroin',                    'France',       47.9500,   0.2000, 'https://www.groingroin.org', 'Sarthe'),
  ('Ippoasi',                       'Italy',        43.7200,  10.4000, 'https://www.ippoasi.org', 'Near Pisa'),
  ('El Hogar Animal Sanctuary',     'Spain',        42.3100,   2.3700, 'https://elhogaranimalsanctuary.org', 'Girona region'),
  -- Africa
  ('Farm Sanctuary SA',             'South Africa',-33.9100,  19.1200, 'https://farmsanctuarysa.org', 'Franschhoek — home of Pigcasso'),
  -- Asia
  ('Animal Aid Unlimited',          'India',        24.5800,  73.6800, 'https://animalaidunlimited.org', 'Udaipur, Rajasthan'),
  -- Oceania
  ('Edgar''s Mission',              'Australia',   -37.2800, 144.7300, 'https://www.edgarsmission.org.au', 'Lancefield, Victoria'),
  ('Greener Pastures Sanctuary',    'Australia',   -32.8400, 115.9200, 'https://greenerpasturessanctuary.org', 'Waroona, Western Australia'),
  ('Big Ears Animal Sanctuary',     'Australia',   -43.1500, 147.0700, 'https://www.bigearsanimalsanctuary.com.au', 'Tasmania'),
  ('Black Sheep Animal Sanctuary',  'New Zealand', -41.1300, 175.0700, 'https://www.blacksheepanimalsanctuary.org.nz', null)
on conflict (name) do update set
  country = excluded.country, lat = excluded.lat, lng = excluded.lng,
  site = excluded.site, notes = excluded.notes;
