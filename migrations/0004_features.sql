-- Extra features: XP, spin, streak freeze, leaderboard claims
alter table app_profiles add column if not exists xp integer not null default 0;
alter table app_profiles add column if not exists streak_freezes integer not null default 1;
alter table app_profiles add column if not exists last_spin_date date;

create table if not exists spin_claims (
  id serial primary key,
  user_id text not null,
  claim_date date not null,
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, claim_date)
);

create table if not exists leaderboard_claims (
  id serial primary key,
  user_id text not null,
  period text not null,
  period_key text not null,
  rank integer not null,
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, period, period_key)
);

-- Default settings for new features
insert into settings (key, value) values
  ('spin_enabled', '1'),
  ('spin_prizes', '10,20,30,50,80,100,150'),
  ('streak_freeze_enabled', '1'),
  ('task_daily_cap', '20'),
  ('task_cooldown_seconds', '30'),
  ('referral_l2_reward', '10'),
  ('leaderboard_weekly_rewards', '500,300,200,100,100,50,50,50,50,50')
on conflict (key) do nothing;
