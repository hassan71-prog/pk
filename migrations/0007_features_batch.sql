create table if not exists scratch_claims (
  id serial primary key,
  user_id text not null,
  claim_date date not null,
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, claim_date)
);

create table if not exists milestone_claims (
  id serial primary key,
  user_id text not null,
  milestone integer not null,
  points integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, milestone)
);

insert into settings (key, value) values
  ('contest_ends_at', ''),
  ('milestone_5', '100'),
  ('milestone_10', '300'),
  ('milestone_25', '1000'),
  ('scratch_prizes', '0,5,10,20,50,100'),
  ('scratch_enabled', '1')
on conflict (key) do nothing;
