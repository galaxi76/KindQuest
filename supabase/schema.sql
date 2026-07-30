-- ──────────────────────────────────────────────────────────────────────────
-- KindQuest — animal content schema (the "CMS").
--
-- Run this ONCE in your Supabase project: SQL Editor → New query → paste → Run.
-- Then run seed.sql to load Clover and the placeholder animals.
--
-- Scalar fields get real columns (easy to edit in the Supabase Table Editor).
-- The flexible, list-y fields (likes, dislikes, knowledge, images) are JSONB so
-- you can grow them without ever changing this schema.
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists public.animals (
  id                 text primary key,          -- e.g. 'goat'
  name               text not null,             -- 'Clover'
  species            text,
  age                text,
  emoji              text,
  playable           boolean not null default false,
  sort_order         integer not null default 100,

  personality        text,
  rescue_story       text,

  likes              jsonb not null default '[]'::jsonb,   -- ["chin scratches", ...]
  dislikes           jsonb not null default '[]'::jsonb,
  knowledge          jsonb not null default '[]'::jsonb,   -- [{ "q": [...], "a": "..." }]

  comfort_signals    text,
  discomfort_signals text,
  hesitant_signals   text,   -- the SUBTLE "not right now" cue
  favorite_food      text,
  best_friend        text,
  fear_of            text,

  images             jsonb,                     -- { "neutral": "...png", ... } or null

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Safe to re-run: adds columns introduced after the table was first created.
alter table public.animals add column if not exists hesitant_signals text;

-- Keep updated_at fresh on edits.
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists animals_touch_updated_at on public.animals;
create trigger animals_touch_updated_at
  before update on public.animals
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- The browser uses the PUBLIC "anon" key. We allow the public to READ animals
-- (it's just kid-friendly content, no private data) but NOT to write. Edits are
-- done by you in the Supabase dashboard, which bypasses RLS.
alter table public.animals enable row level security;

drop policy if exists "Public can read animals" on public.animals;
create policy "Public can read animals"
  on public.animals
  for select
  using (true);
