-- Run this in your Supabase SQL editor
-- Project: pvoscwgyhcwqhwaczbzm

create table if not exists leaderboard (
  id bigint generated always as identity primary key,
  name text not null,
  score integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now()
);

-- Index for fast leaderboard queries
create index if not exists leaderboard_score_idx on leaderboard (score desc);

-- Allow anyone to read and insert (no auth needed)
alter table leaderboard enable row level security;

create policy "Anyone can read leaderboard"
  on leaderboard for select
  using (true);

create policy "Anyone can insert scores"
  on leaderboard for insert
  with check (
    length(trim(name)) >= 2 and
    length(trim(name)) <= 20 and
    score >= 0 and
    level >= 1
  );
