-- Demo catalog data for TaskEarn PK. Rows with is_demo = true are safe to delete before production.
-- Does not create login accounts. Sample leaderboard profiles are labeled Sample.

insert into settings (key, value) values
  ('daily_schedule', '[100,150,200,250,300,400,500]'),
  ('referral_reward', '250'),
  ('referral_qualify_tasks', '1'),
  ('max_referral_rewards', '500'),
  ('min_withdrawal_points', '1000'),
  ('daily_withdrawal_limit_points', '5000'),
  ('monthly_withdrawal_limit_points', '20000'),
  ('bot_username', 'TaskEarnPKBot'),
  ('support_email', 'support@taskearnpk.com'),
  ('platform_name', 'TaskEarn PK')
on conflict (key) do nothing;

insert into sponsors (name, contact_email, status, notes, is_demo) values
  ('Indus Media', 'campaigns@indusmedia.example', 'active', 'Sample sponsor — demo record', true),
  ('Karachi Retail Co', 'ads@krc.example', 'active', 'Sample sponsor — demo record', true),
  ('Lahore Digital', 'hello@lahoredigital.example', 'active', 'Sample sponsor — demo record', true);

insert into campaigns (
  sponsor_id, title, task_type, target_url, reward_per_completion, max_users,
  budget_pkr, spent_pkr, cost_per_completion_pkr, platform_margin_bps, completions,
  status, is_demo, starts_at, ends_at
) values
  (1, 'Indus channel growth', 'telegram', 'https://t.me/TaskEarnPKBot', 500, 200, 40000, 0, 40, 2000, 0, 'active', true, now(), now() + interval '90 days'),
  (2, 'Retail site visits', 'website', 'https://example.com/taskearn-sponsor', 300, 400, 24000, 0, 20, 2000, 0, 'active', true, now(), now() + interval '90 days'),
  (3, 'Ramadan promo placement', 'sponsored', 'https://example.com/ramadan-promo', 1000, 80, 64000, 0, 80, 2500, 0, 'active', true, now(), now() + interval '60 days');

insert into tasks (
  title, description, category, reward_points, target_url, verification_type,
  max_completions, start_date, end_date, status, sponsor_name, campaign_id,
  min_dwell_seconds, is_featured, is_demo
) values
  (
    'Join the TaskEarn PK channel',
    'Open the Telegram channel, join, then submit for review. Membership is checked by an admin until a bot token is configured.',
    'telegram', 500, 'https://t.me/TaskEarnPKBot', 'admin_approval',
    200, now() - interval '1 day', now() + interval '90 days', 'active', 'Indus Media', 1, 8, true, true
  ),
  (
    'Visit the sponsor website',
    'Start the task, open the page, stay at least 8 seconds, then confirm. A unique visit token is required — tapping complete without starting will not award points.',
    'website', 300, 'https://example.com/taskearn-sponsor', 'visit_token',
    400, now() - interval '1 day', now() + interval '90 days', 'active', 'Karachi Retail Co', 2, 8, true, true
  ),
  (
    'Sponsored Ramadan campaign',
    'View the Ramadan promotional landing page and submit a short proof note. Points are issued after admin review and only while campaign budget remains.',
    'sponsored', 1000, 'https://example.com/ramadan-promo', 'admin_approval',
    80, now() - interval '1 day', now() + interval '60 days', 'active', 'Lahore Digital', 3, 10, true, true
  ),
  (
    'Follow the campaign on X',
    'Open the campaign profile, follow, and paste the profile URL as proof. Admin reviews before points are posted.',
    'social', 400, 'https://x.com', 'admin_approval',
    150, now() - interval '1 day', now() + interval '90 days', 'active', 'Indus Media', 1, 8, false, true
  ),
  (
    'Compare partner offers',
    'Open the affiliate comparison page using your unique task token, wait the required time, then confirm. Commission-backed — not a guaranteed payout.',
    'affiliate', 750, 'https://example.com/affiliate-offers', 'visit_token',
    120, now() - interval '1 day', now() + interval '90 days', 'active', 'Karachi Retail Co', 2, 10, false, true
  ),
  (
    'Watch the product walkthrough',
    'A short daily campaign video. Start, open the link, wait, then confirm with the issued token.',
    'daily', 150, 'https://example.com/product-walkthrough', 'visit_token',
    1000, now() - interval '1 day', now() + interval '30 days', 'active', 'TaskEarn PK', null, 8, false, true
  );

insert into rewards (title, description, points_cost, payment_method, stock, status, is_demo) values
  ('Mobile airtime campaign reward', 'Redeemed as a campaign airtime voucher when sponsor budget is available. Points are not cash.', 1000, 'voucher', 50, 'active', true),
  ('JazzCash campaign gift', 'Processed manually after admin approval to a JazzCash number you provide. Subject to campaign funds.', 5000, 'jazzcash', 30, 'active', true),
  ('Easypaisa campaign gift', 'Processed manually after admin approval to an Easypaisa number. Subject to campaign funds.', 10000, 'easypaisa', 20, 'active', true),
  ('Bank transfer campaign reward', 'Higher-tier campaign reward. Admin verifies identity and available budget before payout.', 25000, 'bank', 8, 'active', true);

-- Sample leaderboard faces (not login accounts). Labeled Sample in the UI. Safe to delete: is_demo = true.
insert into app_profiles (
  user_id, display_name, username, referral_code, points_balance, lifetime_earned,
  tasks_completed, is_demo, created_at
) values
  ('demo-ahmed', 'Ahmed Khan', 'ahmedk', 'DEMOAHMD', 4200, 8600, 14, true, now() - interval '40 days'),
  ('demo-fatima', 'Fatima Ali', 'fatimaa', 'DEMOFTMA', 3900, 7200, 11, true, now() - interval '36 days'),
  ('demo-hassan', 'Hassan Raza', 'hassanr', 'DEMOHSAN', 3100, 6400, 9, true, now() - interval '28 days'),
  ('demo-ayesha', 'Ayesha Malik', 'ayesham', 'DEMOAYSH', 2700, 5100, 8, true, now() - interval '21 days'),
  ('demo-bilal', 'Bilal Sheikh', 'bilals', 'DEMOBILAL', 2100, 4300, 7, true, now() - interval '18 days'),
  ('demo-sana', 'Sana Qureshi', 'sanaq', 'DEMOSANA', 1800, 3600, 6, true, now() - interval '12 days'),
  ('demo-usman', 'Usman Tariq', 'usmant', 'DEMOUSMN', 1400, 2900, 5, true, now() - interval '9 days'),
  ('demo-zara', 'Zara Hussain', 'zarah', 'DEMOZARA', 900, 1800, 3, true, now() - interval '4 days');

insert into points_transactions (user_id, type, amount, balance_after, note, created_at) values
  ('demo-ahmed', 'task_reward', 500, 4200, 'Sample history (demo)', now() - interval '1 day'),
  ('demo-fatima', 'daily_reward', 200, 3900, 'Sample history (demo)', now() - interval '2 hours'),
  ('demo-hassan', 'referral_reward', 250, 3100, 'Sample history (demo)', now() - interval '3 days');
