# TaskEarn PK

Rewards-and-tasks app for Pakistan. Points are **platform rewards** funded by sponsored campaigns — not cash, crypto, mining, or a guaranteed return.

## What it does

- Sign in with Google, X, or email
- Daily check-in ledger (one claim per Pakistan calendar day)
- Tasks with visit tokens or admin review — no click-to-credit
- Referrals with anti-self-referral and qualification
- Leaderboards, wallet, catalogue redemptions (Easypaisa / JazzCash / bank)
- Admin panel, audit log, sponsor budgets, support tickets
- Works as a PWA and inside Telegram Mini Apps when a bot is configured

## Setup

1. Provision Postgres (Neon is used on deploy; local preview uses an embedded database).
2. Schema lives in `migrations/` and applies on first boot / production build.
3. Auth is enabled. The first real account becomes admin.
4. Optional Telegram:
   - Set `TELEGRAM_BOT_TOKEN` on the host
   - Set `TELEGRAM_MINI_APP_URL` to the HTTPS app URL
   - Set webhook to `/api/telegram/webhook`
   - Optional `TELEGRAM_WEBHOOK_SECRET`
5. Optional sponsor callbacks: `SPONSOR_CALLBACK_SECRET` and `POST /api/sponsor/callback` with `{ token, secret }`.
6. Open the app, create an account, then visit **Admin panel** from Profile.
7. Create a live task, run a reward flow, then a redemption request.

## Production notes

- Serve over HTTPS (required for PWA install and Telegram Mini Apps).
- Never put bot tokens, database URLs, or payment credentials in client code.
- Purge sample rows (`is_demo = true`) from Admin → Settings before taking live sponsor money.
- Replace Terms / Privacy with counsel-reviewed copy.
- Redemptions stay admin-approved until a payment provider is wired.

## Demo data

Seeded sample tasks, rewards, sponsors, and labelled leaderboard faces. They are marked Sample in the UI and can be removed with **Purge demo data**.
