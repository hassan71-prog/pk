-- TaskEarn PK application schema. Per-user rows use TEXT user_id (Better Auth).

create table if not exists app_profiles (
  user_id text primary key,
  display_name text not null default 'Member',
  username text,
  avatar_url text,
  referral_code text not null unique,
  referred_by text,
  status text not null default 'active',
  language text not null default 'en',
  notifications_enabled boolean not null default true,
  telegram_id text,
  points_balance integer not null default 0,
  lifetime_earned integer not null default 0,
  lifetime_redeemed integer not null default 0,
  tasks_completed integer not null default 0,
  daily_streak integer not null default 0,
  last_daily_claim date,
  is_admin boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists app_profiles_referral_idx on app_profiles (referral_code);
create index if not exists app_profiles_referred_by_idx on app_profiles (referred_by);
create index if not exists app_profiles_earned_idx on app_profiles (lifetime_earned desc);
create index if not exists app_profiles_admin_idx on app_profiles (is_admin);

create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists sponsors (
  id serial primary key,
  name text not null,
  contact_email text,
  status text not null default 'active',
  notes text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaigns (
  id serial primary key,
  sponsor_id integer references sponsors(id),
  title text not null,
  task_type text not null,
  target_url text,
  reward_per_completion integer not null,
  max_users integer,
  budget_pkr numeric(12,2) not null default 0,
  spent_pkr numeric(12,2) not null default 0,
  cost_per_completion_pkr numeric(12,2) not null default 0,
  platform_margin_bps integer not null default 2000,
  completions integer not null default 0,
  status text not null default 'pending',
  is_demo boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id serial primary key,
  title text not null,
  description text not null default '',
  category text not null,
  reward_points integer not null,
  target_url text,
  verification_type text not null,
  max_completions integer,
  completion_count integer not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  status text not null default 'active',
  sponsor_name text,
  campaign_id integer references campaigns(id),
  min_dwell_seconds integer not null default 8,
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_status_idx on tasks (status, is_featured);

create table if not exists task_completions (
  id serial primary key,
  user_id text not null,
  task_id integer not null references tasks(id),
  status text not null default 'started',
  token text unique,
  proof_url text,
  proof_note text,
  admin_note text,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);
create index if not exists task_completions_status_idx on task_completions (status);
create index if not exists task_completions_user_idx on task_completions (user_id);

create table if not exists referrals (
  id serial primary key,
  referrer_user_id text not null,
  referred_user_id text not null unique,
  status text not null default 'pending',
  rewarded_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists referrals_referrer_idx on referrals (referrer_user_id);

create table if not exists points_transactions (
  id serial primary key,
  user_id text not null,
  type text not null,
  amount integer not null,
  balance_after integer not null,
  reference_type text,
  reference_id text,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists points_tx_user_idx on points_transactions (user_id, created_at desc);
create index if not exists points_tx_type_idx on points_transactions (type);

create table if not exists daily_reward_claims (
  id serial primary key,
  user_id text not null,
  claim_date date not null,
  day_number integer not null,
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, claim_date)
);

create table if not exists rewards (
  id serial primary key,
  title text not null,
  description text not null default '',
  points_cost integer not null,
  payment_method text not null,
  stock integer,
  status text not null default 'active',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists withdrawals (
  id serial primary key,
  user_id text not null,
  points integer not null,
  reward_id integer references rewards(id),
  payment_method text not null,
  account_details text not null,
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by text
);
create index if not exists withdrawals_user_idx on withdrawals (user_id);
create index if not exists withdrawals_status_idx on withdrawals (status);

create table if not exists notifications (
  id serial primary key,
  user_id text not null,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists audit_logs (
  id serial primary key,
  actor_user_id text,
  action text not null,
  entity_type text,
  entity_id text,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists support_tickets (
  id serial primary key,
  user_id text not null,
  category text not null,
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists support_tickets_user_idx on support_tickets (user_id);

create table if not exists support_replies (
  id serial primary key,
  ticket_id integer not null references support_tickets(id) on delete cascade,
  user_id text not null,
  is_admin boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists revenue_records (
  id serial primary key,
  source text not null,
  campaign_id integer references campaigns(id),
  gross_pkr numeric(12,2) not null default 0,
  user_rewards_pkr numeric(12,2) not null default 0,
  platform_pkr numeric(12,2) not null default 0,
  note text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists idempotency_keys (
  key text primary key,
  user_id text not null,
  created_at timestamptz not null default now()
);
