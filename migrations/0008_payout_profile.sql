alter table app_profiles
  add column if not exists payout_method text,
  add column if not exists payout_account text,
  add column if not exists payout_name text;
