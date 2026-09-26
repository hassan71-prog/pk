import { randomBytes } from "node:crypto";
import { getSql, type Sql } from "@/lib/db";
import { toIso } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export class AppError extends Error {
  readonly status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

const rateBuckets = new Map<string, { n: number; reset: number }>();

export function rateLimit(userId: string, action: string, max: number, windowMs: number) {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const cur = rateBuckets.get(key);
  if (!cur || now > cur.reset) {
    rateBuckets.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  if (cur.n >= max) {
    throw new AppError("Too many attempts. Please wait and try again.", 429);
  }
  cur.n += 1;
}

export function pakistanDateSql() {
  return `(now() + interval '5 hours')::date`;
}

export function newReferralCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

export function newToken() {
  return randomBytes(18).toString("hex");
}

type ProfileRow = {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  referral_code: string;
  referred_by: string | null;
  status: string;
  language: string;
  notifications_enabled: boolean;
  telegram_id: string | null;
  points_balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
  tasks_completed: number;
  daily_streak: number;
  last_daily_claim: string | null;
  is_admin: boolean;
  is_demo: boolean;
  created_at: unknown;
};

export function mapProfile(r: ProfileRow): Profile {
  return {
    userId: r.user_id,
    displayName: r.display_name,
    username: r.username,
    avatarUrl: r.avatar_url,
    referralCode: r.referral_code,
    referredBy: r.referred_by,
    status: r.status,
    language: r.language,
    notificationsEnabled: r.notifications_enabled,
    telegramId: r.telegram_id,
    pointsBalance: Number(r.points_balance),
    lifetimeEarned: Number(r.lifetime_earned),
    lifetimeRedeemed: Number(r.lifetime_redeemed),
    tasksCompleted: Number(r.tasks_completed),
    dailyStreak: Number(r.daily_streak),
    lastDailyClaim: r.last_daily_claim,
    isAdmin: Boolean(r.is_admin),
    isDemo: Boolean(r.is_demo),
    createdAt: toIso(r.created_at),
  };
}

export async function getSetting(sql: Sql, key: string, fallback: string): Promise<string> {
  const rows = await sql<{ value: string }>`select value from settings where key = ${key}`;
  return rows[0]?.value ?? fallback;
}

export async function getSettingInt(sql: Sql, key: string, fallback: number) {
  const v = Number(await getSetting(sql, key, String(fallback)));
  return Number.isFinite(v) ? v : fallback;
}

export async function notify(
  sql: Sql,
  userId: string,
  type: string,
  title: string,
  body: string,
) {
  await sql`
    insert into notifications (user_id, type, title, body)
    values (${userId}, ${type}, ${title}, ${body})
  `;
}

export async function audit(
  sql: Sql,
  actorUserId: string | null,
  action: string,
  entityType: string | null,
  entityId: string | null,
  detail: string | null,
) {
  await sql`
    insert into audit_logs (actor_user_id, action, entity_type, entity_id, detail)
    values (${actorUserId}, ${action}, ${entityType}, ${entityId}, ${detail})
  `;
}

export async function creditPoints(
  sql: Sql,
  userId: string,
  amount: number,
  type: string,
  note: string | null,
  referenceType?: string | null,
  referenceId?: string | null,
) {
  if (!Number.isInteger(amount) || amount === 0) {
    throw new AppError("Invalid points amount.");
  }
  const updated = await sql<{ points_balance: number }>`
    update app_profiles
    set
      points_balance = points_balance + ${amount},
      lifetime_earned = lifetime_earned + ${amount > 0 ? amount : 0},
      lifetime_redeemed = lifetime_redeemed + ${amount < 0 ? -amount : 0},
      updated_at = now()
    where user_id = ${userId} and is_demo = false and status = 'active'
      and points_balance + ${amount} >= 0
    returning points_balance
  `;
  const row = updated[0];
  if (!row) throw new AppError("Unable to update balance. Check account status and available points.");
  await sql`
    insert into points_transactions (user_id, type, amount, balance_after, reference_type, reference_id, note)
    values (${userId}, ${type}, ${amount}, ${row.points_balance}, ${referenceType ?? null}, ${referenceId ?? null}, ${note})
  `;
  return Number(row.points_balance);
}

export async function maybeQualifyReferral(sql: Sql, referredUserId: string) {
  const refs = await sql<{ id: number; referrer_user_id: string; status: string }>`
    select id, referrer_user_id, status from referrals where referred_user_id = ${referredUserId}
  `;
  const ref = refs[0];
  if (!ref || ref.status !== "pending") return;
  const need = await getSettingInt(sql, "referral_qualify_tasks", 1);
  const maxRewards = await getSettingInt(sql, "max_referral_rewards", 500);
  const reward = await getSettingInt(sql, "referral_reward", 250);
  const completed = await sql<{ n: number }>`
    select count(*)::int as n from task_completions
    where user_id = ${referredUserId} and status = 'completed'
  `;
  if (Number(completed[0]?.n ?? 0) < need) return;
  const already = await sql<{ n: number }>`
    select count(*)::int as n from referrals
    where referrer_user_id = ${ref.referrer_user_id} and status = 'rewarded'
  `;
  if (Number(already[0]?.n ?? 0) >= maxRewards) {
    await sql`update referrals set status = 'rejected' where id = ${ref.id}`;
    return;
  }
  const locked = await sql<{ id: number }>`
    update referrals set status = 'rewarded', rewarded_at = now()
    where id = ${ref.id} and status = 'pending'
    returning id
  `;
  if (!locked[0]) return;
  const balance = await creditPoints(
    sql,
    ref.referrer_user_id,
    reward,
    "referral_reward",
    "Qualified referral reward",
    "referral",
    String(ref.id),
  );
  await notify(
    sql,
    ref.referrer_user_id,
    "referral_joined",
    "Referral qualified",
    `A referred member completed the qualification. +${reward} points. Balance ${balance}.`,
  );

  // L2: if the referrer was themselves referred, small bonus to the upline
  const l2Reward = await getSettingInt(sql, "referral_l2_reward", 10);
  if (l2Reward > 0) {
    const up = await sql<{ referred_by: string | null }>`
      select referred_by from app_profiles where user_id = ${ref.referrer_user_id}
    `;
    const parent = up[0]?.referred_by;
    if (parent && parent !== referredUserId && parent !== ref.referrer_user_id) {
      await creditPoints(
        sql,
        parent,
        l2Reward,
        "referral_l2_reward",
        "Level-2 referral bonus",
        "referral",
        String(ref.id),
      );
      await notify(
        sql,
        parent,
        "referral_l2",
        "L2 referral bonus",
        `+${l2Reward} points from your team's referral.`,
      );
    }
  }
}

export async function applyReferralIfNeeded(
  sql: Sql,
  userId: string,
  code: string | null | undefined,
) {
  const trimmed = (code ?? "").trim().toUpperCase();
  if (!trimmed) return;
  const me = await sql<{ referred_by: string | null; referral_code: string }>`
    select referred_by, referral_code from app_profiles where user_id = ${userId}
  `;
  if (!me[0] || me[0].referred_by) return;
  if (me[0].referral_code === trimmed) throw new AppError("You cannot refer yourself.");
  const referrer = await sql<{ user_id: string; is_demo: boolean; status: string }>`
    select user_id, is_demo, status from app_profiles where referral_code = ${trimmed}
  `;
  const r = referrer[0];
  if (!r || r.is_demo || r.status !== "active") throw new AppError("Referral code is not valid.");
  if (r.user_id === userId) throw new AppError("You cannot refer yourself.");
  try {
    await sql`
      insert into referrals (referrer_user_id, referred_user_id, status)
      values (${r.user_id}, ${userId}, 'pending')
    `;
  } catch {
    return;
  }
  await sql`
    update app_profiles set referred_by = ${r.user_id}, updated_at = now()
    where user_id = ${userId} and referred_by is null
  `;
  await notify(
    sql,
    r.user_id,
    "referral_joined",
    "New referral joined",
    "Someone signed up with your link. Reward posts after they qualify.",
  );
}

export async function ensureProfile(
  userId: string,
  identity?: { name?: string | null; email?: string | null; image?: string | null },
  referralCode?: string | null,
): Promise<Profile> {
  const sql = await getSql();
  const existing = await sql<ProfileRow>`select * from app_profiles where user_id = ${userId}`;
  if (existing[0]) {
    if (existing[0].status === "banned" || existing[0].status === "suspended") {
      throw new AppError("This account is not allowed to use Earn.pk.", 403);
    }
    const display = identity?.name?.trim();
    const avatar = identity?.image ?? null;
    if (display && display !== existing[0].display_name) {
      await sql`
        update app_profiles
        set display_name = ${display}, avatar_url = coalesce(${avatar}, avatar_url), updated_at = now()
        where user_id = ${userId} and is_demo = false
      `;
    }
    if (referralCode) {
      try {
        await applyReferralIfNeeded(sql, userId, referralCode);
      } catch {
        /* invalid code on later visits is ignored */
      }
    }
    const refreshed = await sql<ProfileRow>`select * from app_profiles where user_id = ${userId}`;
    return mapProfile(refreshed[0]!);
  }

  const name =
    identity?.name?.trim() ||
    identity?.email?.split("@")[0] ||
    "Member";
  const username = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || null;
  let code = newReferralCode();
  for (let i = 0; i < 6; i++) {
    const clash = await sql<{ n: number }>`
      select count(*)::int as n from app_profiles where referral_code = ${code}
    `;
    if (Number(clash[0]?.n ?? 0) === 0) break;
    code = newReferralCode();
  }

  

 await sql`
  insert into app_profiles (
    user_id, display_name, username, avatar_url, referral_code
  ) values (
    ${userId}, ${name}, ${username}, ${identity?.image ?? null}, ${code}
  )
  on conflict (user_id) do nothing
`;

  if (referralCode) {
    try {
      await applyReferralIfNeeded(sql, userId, referralCode);
    } catch {
      /* first-visit invalid code */
    }
  }

  await notify(
    sql,
    userId,
    "welcome",
    "Welcome to Earn.pk",
    "Points are platform rewards funded by sponsored campaigns. Redemption depends on available rewards and campaign budgets.",
  );

  const created = await sql<ProfileRow>`select * from app_profiles where user_id = ${userId}`;
  if (!created[0]) throw new AppError("Could not create profile.", 500);
  return mapProfile(created[0]);
}

export async function requireAdmin(userId: string): Promise<Profile> {
  const profile = await ensureProfile(userId);
  if (profile.isAdmin) return profile;
  // First real admin bootstrap: if nobody is admin yet, promote this user.
  const sql = await getSql();
  const cnt = await sql<{ n: number }>`
    select count(*)::int as n from app_profiles where is_admin = true and is_demo = false
  `;
  if (Number(cnt[0]?.n ?? 0) === 0) {
    await sql`
      update app_profiles set is_admin = true, updated_at = now()
      where user_id = ${userId} and is_demo = false
    `;
    return { ...profile, isAdmin: true };
  }
  throw new AppError(
    "Admin access required. Open Admin → Admins and enable is_admin for your account (or ask an existing admin).",
    403,
  );
}

export async function recordCampaignSpend(sql: Sql, campaignId: number | null) {
  if (!campaignId) return;
  const camp = await sql<{
    id: number;
    budget_pkr: string;
    spent_pkr: string;
    cost_per_completion_pkr: string;
    platform_margin_bps: number;
    max_users: number | null;
    completions: number;
    status: string;
  }>`
    select id, budget_pkr, spent_pkr, cost_per_completion_pkr, platform_margin_bps,
           max_users, completions, status
    from campaigns where id = ${campaignId}
  `;
  const c = camp[0];
  if (!c || c.status !== "active") throw new AppError("This campaign is not active.");
  if (c.max_users != null && Number(c.completions) >= Number(c.max_users)) {
    throw new AppError("This campaign has reached its user cap.");
  }
  const cost = Number(c.cost_per_completion_pkr);
  const spent = Number(c.spent_pkr);
  const budget = Number(c.budget_pkr);
  if (cost > 0 && spent + cost > budget + 1e-9) {
    throw new AppError("Campaign budget is exhausted. This task cannot pay out right now.");
  }
  const margin = cost * (Number(c.platform_margin_bps) / 10000);
  const userShare = Math.max(0, cost - margin);
  await sql`
    update campaigns
    set spent_pkr = spent_pkr + ${String(cost)},
        completions = completions + 1,
        updated_at = now()
    where id = ${campaignId} and spent_pkr + ${String(cost)} <= budget_pkr + 0.009
  `;
  if (cost > 0) {
    await sql`
      insert into revenue_records (source, campaign_id, gross_pkr, user_rewards_pkr, platform_pkr, note)
      values (
        'sponsored_task',
        ${campaignId},
        ${String(cost)},
        ${String(userShare)},
        ${String(margin)},
        'Completion against campaign budget'
      )
    `;
  }
}
