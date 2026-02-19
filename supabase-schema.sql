-- ════════════════════════════════════════════
--  תור מדיח – Supabase Schema (v2)
--  הרץ את הקוד הזה ב-Supabase SQL Editor
--  אם כבר הרצת v1: הרץ רק את ה-ALTER TABLE בתחתית
-- ════════════════════════════════════════════

-- State table (single row, id = 'main')
create table if not exists app_state (
  id text primary key default 'main',
  current_turn text not null default 'liam',
  updated_at timestamptz not null default now(),
  scoring_enabled boolean not null default false,
  liam_points integer not null default 0,
  shaiya_points integer not null default 0,
  week_start timestamptz not null default now(),
  admin_pin text not null default '1234',
  liam_pin text not null default '2107',
  shaiya_pin text not null default '0303'
);

-- Insert default row if not exists
insert into app_state (id) values ('main')
on conflict (id) do nothing;

-- ── אם כבר יש לך טבלה קיימת מ-v1, הרץ גם את זה: ──
alter table app_state add column if not exists liam_pin text not null default '2107';
alter table app_state add column if not exists shaiya_pin text not null default '0303';

-- Actions log table
create table if not exists actions_log (
  id text primary key,
  type text not null,
  actor text not null,
  timestamp timestamptz not null default now(),
  note text default ''
);

-- Enable realtime
alter publication supabase_realtime add table app_state;
alter publication supabase_realtime add table actions_log;

-- RLS Policies
alter table app_state enable row level security;
alter table actions_log enable row level security;

create policy "public read state"  on app_state for select using (true);
create policy "public write state" on app_state for all    using (true) with check (true);

create policy "public read log"   on actions_log for select using (true);
create policy "public write log"  on actions_log for insert with check (true);
create policy "public delete log" on actions_log for delete using (true);
