import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { toIso } from "@/lib/utils";
import type {
  LeaderboardEntry,
  NotificationRow,
  Profile,
  RewardRow,
  TaskRow,
  TicketRow,
  TxRow,
  WithdrawalRow,
} from "@/lib/types";
import {
  AppError,
  applyReferralIfNeeded,
  creditPoints,
  ensureProfile,
  getSetting,
  getSettingInt,
  maybeQualifyReferral,
  newToken,
  notify,
  rateLimit,
  recordCampaignSpend,
} from "./helpers";

function wrap<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((err: unknown) => {
    if (err instanceof AppError) throw err;
    if (err instanceof Error && err.message === "Unauthorized") throw err;
    throw err;
  });
}

const identitySchema = z
  .object({
    name: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    referralCode: z.string().nullable().optional(),
  })
  .optional();

export const getDashboard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(identitySchema)
  .handler(async ({ context, data }): Promise<{
    profile: Profile;
    todayEarned: number;
    referrals: number;
    featured: TaskRow[];
    recent: TxRow[];
    daily: {
      claimed: boolean;
      streak: number;
      nextPoints: number;
      schedule: number[];
      dayNumber: number;
    };
    unread: number;
  }> => {
    return wrap(async () => {
      const profile = await ensureProfile(context.userId, data ?? undefined, data?.referralCode);
      const sql = await getSql();
      const earned = await sql<{ n: number }>`
        select coalesce(sum(amount), 0)::int as n
        from points_transactions
        where user_id = ${context.userId}
          and amount > 0
          and created_at >= ((now() + interval '5 hours')::date - interval '5 hours')
      `;
      const refs = await sql<{ n: number }>`
        select count(*)::int as n from referrals where referrer_user_id = ${context.userId}
      `;
      const unread = await sql<{ n: number }>`
        select count(*)::int as n from notifications where user_id = ${context.userId} and read_at is null
      `;
      const featuredRows = await loadTasks(sql, context.userId, true);
      const tx = await sql<{
        id: number;
        type: string;
        amount: number;
        balance_after: number;
        note: string | null;
        created_at: unknown;
      }>`
        select id, type, amount, balance_after, note, created_at
        from points_transactions
        where user_id = ${context.userId}
        order by created_at desc
        limit 6
      `;
      const daily = await dailyStatus(sql, context.userId, profile);
      return {
        profile,
        todayEarned: Number(earned[0]?.n ?? 0),
        referrals: Number(refs[0]?.n ?? 0),
        featured: featuredRows.slice(0, 3),
        recent: tx.map((r) => ({
          id: r.id,
          type: r.type,
          amount: Number(r.amount),
          balanceAfter: Number(r.balance_after),
          note: r.note,
          createdAt: toIso(r.created_at),
        })),
        daily,
        unread: Number(unread[0]?.n ?? 0),
      };
    });
  });

type Sql = Awaited<ReturnType<typeof getSql>>;

async function dailyStatus(sql: Sql, userId: string, profile: Profile) {
  const raw = await getSetting(sql, "daily_schedule", "[100,150,200,250,300,400,500]");
  let schedule: number[] = [100, 150, 200, 250, 300, 400, 500];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((n) => Number.isFinite(Number(n)))) {
      schedule = parsed.map((n) => Number(n));
    }
  } catch {
    /* keep default */
  }
  const todayRows = await sql<{ d: string }>`select (now() + interval '5 hours')::date::text as d`;
  const today = todayRows[0]?.d ?? "";
  const claimed = profile.lastDailyClaim === today;
  const streak = claimed ? profile.dailyStreak : profile.lastDailyClaim ? profile.dailyStreak : 0;
  const dayNumber = claimed
    ? ((profile.dailyStreak - 1) % schedule.length) + 1
    : (profile.dailyStreak % schedule.length) + 1;
  const nextPoints = schedule[(dayNumber - 1) % schedule.length] ?? 100;
  return { claimed, streak: profile.dailyStreak, nextPoints, schedule, dayNumber };
}

async function loadTasks(sql: Sql, userId: string, featuredOnly = false): Promise<TaskRow[]> {
  const rows = await sql<{
    id: number;
    title: string;
    description: string;
    category: string;
    reward_points: number;
    target_url: string | null;
    verification_type: string;
    max_completions: number | null;
    completion_count: number;
    start_date: unknown;
    end_date: unknown;
    status: string;
    sponsor_name: string | null;
    campaign_id: number | null;
    min_dwell_seconds: number;
    is_featured: boolean;
    is_demo: boolean;
    uc_status: string | null;
    uc_started: unknown;
    uc_token: string | null;
  }>`
    select t.id, t.title, t.description, t.category, t.reward_points, t.target_url,
           t.verification_type, t.max_completions, t.completion_count, t.start_date,
           t.end_date, t.status, t.sponsor_name, t.campaign_id, t.min_dwell_seconds,
           t.is_featured, t.is_demo,
           c.status as uc_status, c.started_at as uc_started, c.token as uc_token
    from tasks t
    left join task_completions c on c.task_id = t.id and c.user_id = ${userId}
    where t.status = 'active'
    order by t.is_featured desc, t.reward_points desc, t.id asc
  `;
  const mapped = rows.map((t) => {
    const now = Date.now();
    const start = t.start_date ? new Date(toIso(t.start_date)).getTime() : 0;
    const end = t.end_date ? new Date(toIso(t.end_date)).getTime() : Infinity;
    let userState: TaskRow["userState"] = "available";
    if (t.uc_status === "started") userState = "started";
    else if (t.uc_status === "pending") userState = "pending";
    else if (t.uc_status === "completed") userState = "completed";
    else if (t.uc_status === "rejected") userState = "rejected";
    else if (now < start || now > end) userState = "expired";
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      rewardPoints: Number(t.reward_points),
      targetUrl: t.target_url,
      verificationType: t.verification_type,
      maxCompletions: t.max_completions == null ? null : Number(t.max_completions),
      completionCount: Number(t.completion_count),
      startDate: t.start_date ? toIso(t.start_date) : null,
      endDate: t.end_date ? toIso(t.end_date) : null,
      status: t.status,
      sponsorName: t.sponsor_name,
      campaignId: t.campaign_id,
      minDwellSeconds: Number(t.min_dwell_seconds),
      isFeatured: Boolean(t.is_featured),
      isDemo: Boolean(t.is_demo),
      userState,
      startedAt: t.uc_started ? toIso(t.uc_started) : null,
      token: t.uc_token,
    };
  });
  // Hide demo/sample tasks from users — admin creates real tasks
  const real = mapped.filter((t) => !t.isDemo);
  return featuredOnly ? real.filter((t) => t.isFeatured) : real;
}

export const listTasks = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(identitySchema)
  .handler(async ({ context, data }) => {
    await ensureProfile(context.userId, data ?? undefined, data?.referralCode);
    const sql = await getSql();
    return loadTasks(sql, context.userId, false);
  });

export const getTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ taskId: z.coerce.number() }))
  .handler(async ({ context, data }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    const all = await loadTasks(sql, context.userId, false);
    const task = all.find((t) => t.id === data.taskId);
    if (!task) throw new AppError("Task not found.", 404);
    return task;
  });

export const startTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ taskId: z.coerce.number() }))
  .handler(async ({ context, data }) => {
    return wrap(async () => {
      rateLimit(context.userId, "start-task", 20, 60_000);
      await ensureProfile(context.userId);
      const sql = await getSql();
      const tasks = await sql<{
        id: number;
        status: string;
        start_date: unknown;
        end_date: unknown;
        max_completions: number | null;
        completion_count: number;
      }>`select id, status, start_date, end_date, max_completions, completion_count from tasks where id = ${data.taskId}`;
      const t = tasks[0];
      if (!t || t.status !== "active") throw new AppError("This task is not available.");
      const now = Date.now();
      if (t.start_date && now < new Date(toIso(t.start_date)).getTime()) {
        throw new AppError("This task has not started yet.");
      }
      if (t.end_date && now > new Date(toIso(t.end_date)).getTime()) {
        throw new AppError("This task has expired.");
      }
      if (t.max_completions != null && Number(t.completion_count) >= Number(t.max_completions)) {
        throw new AppError("This task has reached its completion cap.");
      }
      const token = newToken();
      try {
        await sql`
          insert into task_completions (user_id, task_id, status, token)
          values (${context.userId}, ${data.taskId}, 'started', ${token})
        `;
      } catch {
        const existing = await sql<{ status: string; token: string | null }>`
          select status, token from task_completions
          where user_id = ${context.userId} and task_id = ${data.taskId}
        `;
        const e = existing[0];
        if (!e) throw new AppError("Could not start this task.");
        if (e.status === "completed") throw new AppError("You already completed this task.");
        if (e.status === "pending") throw new AppError("This task is waiting for review.");
        return { token: e.token, status: e.status };
      }
      return { token, status: "started" as const };
    });
  });

export const completeTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      taskId: z.coerce.number(),
      token: z.string().optional(),
      proofUrl: z.string().max(500).optional(),
      proofNote: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    return wrap(async () => {
      rateLimit(context.userId, "complete-task", 20, 60_000);
      await ensureProfile(context.userId);
      const sql = await getSql();
      const dailyCap = await getSettingInt(sql, "task_daily_cap", 20);
      const todayDone = await sql<{ n: number }>`
        select count(*)::int as n from task_completions
        where user_id = ${context.userId} and status = 'completed'
          and submitted_at::date = (now() + interval '5 hours')::date
      `;
      if (Number(todayDone[0]?.n ?? 0) >= dailyCap) {
        throw new AppError(`Aaj ka task limit (${dailyCap}) poora ho gaya. Kal try karo.`);
      }
      const rows = await sql<{
        id: number;
        title: string;
        reward_points: number;
        verification_type: string;
        min_dwell_seconds: number;
        campaign_id: number | null;
        max_completions: number | null;
        completion_count: number;
        status: string;
      }>`
        select id, title, reward_points, verification_type, min_dwell_seconds,
               campaign_id, max_completions, completion_count, status
        from tasks where id = ${data.taskId}
      `;
      const task = rows[0];
      if (!task || task.status !== "active") throw new AppError("This task is not available.");
      const comp = await sql<{
        id: number;
        status: string;
        token: string | null;
        started_at: unknown;
      }>`
        select id, status, token, started_at
        from task_completions
        where user_id = ${context.userId} and task_id = ${data.taskId}
      `;
      const c = comp[0];
      if (!c) throw new AppError("Start the task before submitting.");
      if (c.status === "completed") throw new AppError("Already completed.");
      if (c.status === "pending") throw new AppError("Already submitted — waiting for review.");
      if (c.status === "rejected") throw new AppError("This submission was rejected.");

      const needsToken =
        task.verification_type === "visit_token" || task.verification_type === "unique_token";
      if (needsToken) {
        // Session already proves identity; optional client token must match if sent.
        // (Fixes claim when UI cache lost the token after Open-link from list.)
        if (data.token && c.token && data.token !== c.token) {
          throw new AppError("Invalid task token. Open the link again, then claim.");
        }
        if (!c.token) {
          throw new AppError("Task token missing. Open the link again to restart.");
        }
        const started = new Date(toIso(c.started_at)).getTime();
        const waitMs = Number(task.min_dwell_seconds) * 1000;
        if (Date.now() - started < waitMs) {
          const left = Math.ceil((waitMs - (Date.now() - started)) / 1000);
          throw new AppError(`Please wait ${left}s more, then claim.`);
        }
      }

      const pendingTypes = ["admin_approval", "telegram_membership", "sponsor_callback"];
      if (pendingTypes.includes(task.verification_type)) {
        await sql`
          update task_completions
          set status = 'pending',
              submitted_at = now(),
              proof_url = ${data.proofUrl ?? null},
              proof_note = ${data.proofNote ?? null},
              updated_at = now()
          where id = ${c.id} and status = 'started'
        `;
        await notify(
          sql,
          context.userId,
          "task_pending",
          "Task submitted",
          `${task.title} is waiting for review. Points are not added until it is approved.`,
        );
        return { status: "pending" as const, points: 0 };
      }

      if (task.max_completions != null && Number(task.completion_count) >= Number(task.max_completions)) {
        throw new AppError("This task has reached its completion cap.");
      }

      const marked = await sql<{ id: number }>`
        update task_completions
        set status = 'completed', submitted_at = now(), updated_at = now()
        where id = ${c.id} and status = 'started'
        returning id
      `;
      if (!marked[0]) throw new AppError("Could not complete this task.");

      await recordCampaignSpend(sql, task.campaign_id);
      await sql`update tasks set completion_count = completion_count + 1, updated_at = now() where id = ${task.id}`;
      await sql`
        update app_profiles
        set tasks_completed = tasks_completed + 1, updated_at = now()
        where user_id = ${context.userId}
      `;
      const balance = await creditPoints(
        sql,
        context.userId,
        Number(task.reward_points),
        "task_reward",
        task.title,
        "task",
        String(task.id),
      );
      await maybeQualifyReferral(sql, context.userId);
      await sql`
        update app_profiles set xp = coalesce(xp, 0) + 10, updated_at = now()
        where user_id = ${context.userId}
      `;
      await notify(
        sql,
        context.userId,
        "task_approved",
        "Task completed",
        `+${task.reward_points} points for ${task.title}.`,
      );
      return { status: "completed" as const, points: Number(task.reward_points), balance };
    });
  });

export const claimDaily = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return wrap(async () => {
      rateLimit(context.userId, "daily", 8, 60_000);
      const profile = await ensureProfile(context.userId);
      const sql = await getSql();
      const status = await dailyStatus(sql, context.userId, profile);
      if (status.claimed) throw new AppError("You already claimed today's reward.");
      const todayRows = await sql<{ d: string }>`select (now() + interval '5 hours')::date::text as d`;
      const today = todayRows[0]!.d;
      const yesterdayRows = await sql<{ d: string }>`
        select ((now() + interval '5 hours')::date - 1)::text as d
      `;
      const yesterday = yesterdayRows[0]?.d;
      const continued = profile.lastDailyClaim === yesterday;
      let usedFreeze = false;
      let streak = continued ? profile.dailyStreak + 1 : 1;
      if (!continued && profile.dailyStreak > 0) {
        const freezeOn = await getSetting(sql, "streak_freeze_enabled", "1");
        if (freezeOn === "1") {
          const fr = await sql<{ streak_freezes: number }>`
            select coalesce(streak_freezes, 0)::int as streak_freezes from app_profiles where user_id = ${context.userId}
          `;
          const left = Number(fr[0]?.streak_freezes ?? 0);
          if (left > 0) {
            streak = profile.dailyStreak + 1;
            usedFreeze = true;
            await sql`
              update app_profiles set streak_freezes = streak_freezes - 1 where user_id = ${context.userId} and streak_freezes > 0
            `;
          }
        }
      }
      const dayNumber = ((streak - 1) % status.schedule.length) + 1;
      const points = status.schedule[dayNumber - 1] ?? 100;

      try {
        await sql`
          insert into daily_reward_claims (user_id, claim_date, day_number, points)
          values (${context.userId}, ${today}, ${dayNumber}, ${points})
        `;
      } catch {
        throw new AppError("You already claimed today's reward.");
      }

      await sql`
        update app_profiles
        set daily_streak = ${streak}, last_daily_claim = ${today}, updated_at = now()
        where user_id = ${context.userId}
      `;
      const balance = await creditPoints(
        sql,
        context.userId,
        points,
        "daily_reward",
        `Day ${dayNumber} check-in`,
        "daily",
        today,
      );
      return { points, streak, dayNumber, balance };
    });
  });

export const getReferralInfo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(identitySchema)
  .handler(async ({ context, data }) => {
    const profile = await ensureProfile(context.userId, data ?? undefined, data?.referralCode);
    const sql = await getSql();
    const bot = await getSetting(sql, "bot_username", "EarnPkBot");
    const reward = await getSettingInt(sql, "referral_reward", 250);
    const qualify = await getSettingInt(sql, "referral_qualify_tasks", 1);
    const stats = await sql<{ total: number; active: number; earned: number }>`
      select
        count(*)::int as total,
        count(*) filter (where status = 'rewarded')::int as active,
        coalesce((
          select sum(amount)::int from points_transactions
          where user_id = ${context.userId} and type = 'referral_reward'
        ), 0) as earned
      from referrals
      where referrer_user_id = ${context.userId}
    `;
    const recent = await sql<{
      referred_user_id: string;
      status: string;
      created_at: unknown;
      display_name: string | null;
    }>`
      select r.referred_user_id, r.status, r.created_at, p.display_name
      from referrals r
      left join app_profiles p on p.user_id = r.referred_user_id
      where r.referrer_user_id = ${context.userId}
      order by r.created_at desc
      limit 20
    `;
    const l2 = await sql<{ earned: number }>`
      select coalesce(sum(amount), 0)::int as earned from points_transactions
      where user_id = ${context.userId} and type = 'referral_l2_reward'
    `;
    const l2Reward = await getSettingInt(sql, "referral_l2_reward", 10);
    return {
      code: profile.referralCode,
      telegramLink: `https://t.me/${bot}?start=${profile.referralCode}`,
      reward,
      l2Reward,
      qualifyTasks: qualify,
      total: Number(stats[0]?.total ?? 0),
      active: Number(stats[0]?.active ?? 0),
      earned: Number(stats[0]?.earned ?? 0),
      l2Earned: Number(l2[0]?.earned ?? 0),
      recent: recent.map((r) => ({
        name: r.display_name ?? "Member",
        status: r.status,
        createdAt: toIso(r.created_at),
      })),
    };
  });

export const attachReferral = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ code: z.string().min(3).max(16) }))
  .handler(async ({ context, data }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    await applyReferralIfNeeded(sql, context.userId, data.code);
    return { ok: true };
  });

export const getLeaderboard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ period: z.enum(["daily", "weekly", "monthly", "all"]) }))
  .handler(async ({ context, data }): Promise<{
    entries: LeaderboardEntry[];
    you: LeaderboardEntry | null;
  }> => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    const windowSql =
      data.period === "daily"
        ? `and tx.created_at >= ((now() + interval '5 hours')::date - interval '5 hours')`
        : data.period === "weekly"
          ? `and tx.created_at >= now() - interval '7 days'`
          : data.period === "monthly"
            ? `and tx.created_at >= now() - interval '30 days'`
            : ``;

    const rows = await sql.query<{
      user_id: string;
      display_name: string;
      username: string | null;
      avatar_url: string | null;
      points: number;
      is_demo: boolean;
    }>(
      data.period === "all"
        ? `select user_id, display_name, username, avatar_url, lifetime_earned as points, is_demo
           from app_profiles
           where status = 'active' and is_demo = false and lifetime_earned > 0
           order by lifetime_earned desc, created_at asc
           limit 50`
        : `select p.user_id, p.display_name, p.username, p.avatar_url,
                  coalesce(sum(tx.amount),0)::int as points, p.is_demo
           from app_profiles p
           join points_transactions tx on tx.user_id = p.user_id and tx.amount > 0 ${windowSql}
           where p.status = 'active' and p.is_demo = false
           group by p.user_id, p.display_name, p.username, p.avatar_url, p.is_demo, p.created_at
           having coalesce(sum(tx.amount),0) > 0
           order by points desc, p.created_at asc
           limit 50`,
    );

    const entries: LeaderboardEntry[] = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.user_id,
      displayName: r.display_name,
      username: r.username,
      avatarUrl: r.avatar_url,
      points: Number(r.points),
      isDemo: Boolean(r.is_demo),
      isYou: r.user_id === context.userId,
    }));
    let you = entries.find((e) => e.isYou) ?? null;
    if (!you) {
      const mine = await sql<{ n: number }>`
        select lifetime_earned::int as n from app_profiles where user_id = ${context.userId}
      `;
      const higher = await sql<{ n: number }>`
        select count(*)::int as n from app_profiles
        where status = 'active' and lifetime_earned > ${Number(mine[0]?.n ?? 0)}
      `;
      you = {
        rank: Number(higher[0]?.n ?? 0) + 1,
        userId: context.userId,
        displayName: "You",
        username: null,
        avatarUrl: null,
        points: Number(mine[0]?.n ?? 0),
        isDemo: false,
        isYou: true,
      };
    }
    return { entries, you };
  });

export const getWallet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const profile = await ensureProfile(context.userId);
    const sql = await getSql();
    const pending = await sql<{ n: number }>`
      select coalesce(sum(points),0)::int as n from withdrawals
      where user_id = ${context.userId} and status in ('pending','approved','processing')
    `;
    const tx = await sql<{
      id: number;
      type: string;
      amount: number;
      balance_after: number;
      note: string | null;
      created_at: unknown;
    }>`
      select id, type, amount, balance_after, note, created_at
      from points_transactions
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
    const rewards = await sql<{
      id: number;
      title: string;
      description: string;
      points_cost: number;
      payment_method: string;
      stock: number | null;
      status: string;
    }>`
      select id, title, description, points_cost, payment_method, stock, status
      from rewards where status = 'active' order by points_cost asc
    `;
    const withdrawals = await sql<{
      id: number;
      points: number;
      payment_method: string;
      account_details: string;
      status: string;
      admin_note: string | null;
      created_at: unknown;
      processed_at: unknown;
      title: string | null;
    }>`
      select w.id, w.points, w.payment_method, w.account_details, w.status, w.admin_note,
             w.created_at, w.processed_at, r.title
      from withdrawals w
      left join rewards r on r.id = w.reward_id
      where w.user_id = ${context.userId}
      order by w.created_at desc
      limit 20
    `;
    const minPts = await getSettingInt(sql, "min_withdrawal_points", 1000);
    const pointsToPkr = Number(await getSetting(sql, "points_to_pkr", "0.02"));
    const opensAtRaw = (await getSetting(sql, "withdrawals_opens_at", "")).trim();
    const flagOpen = (await getSettingInt(sql, "withdrawals_open", 1)) === 1;
    let comingSoon = false;
    let opensAt: string | null = opensAtRaw || null;
    if (opensAtRaw) {
      const t = new Date(opensAtRaw).getTime();
      if (Number.isFinite(t) && Date.now() < t) comingSoon = true;
    }
    const withdrawalsEnabled = flagOpen && !comingSoon;
    return {
      profile,
      pendingPoints: Number(pending[0]?.n ?? 0),
      minWithdrawal: minPts,
      pointsToPkr: Number.isFinite(pointsToPkr) ? pointsToPkr : 0.02,
      opensAt,
      comingSoon,
      withdrawalsEnabled,
      transactions: tx.map(
        (r): TxRow => ({
          id: r.id,
          type: r.type,
          amount: Number(r.amount),
          balanceAfter: Number(r.balance_after),
          note: r.note,
          createdAt: toIso(r.created_at),
        }),
      ),
      rewards: rewards.map(
        (r): RewardRow => ({
          id: r.id,
          title: r.title,
          description: r.description,
          pointsCost: Number(r.points_cost),
          paymentMethod: r.payment_method,
          stock: r.stock == null ? null : Number(r.stock),
          status: r.status,
        }),
      ),
      withdrawals: withdrawals.map(
        (r): WithdrawalRow => ({
          id: r.id,
          points: Number(r.points),
          rewardTitle: r.title,
          paymentMethod: r.payment_method,
          accountMasked:
            r.account_details.length <= 4
              ? "••••"
              : `${"•".repeat(Math.min(8, r.account_details.length - 4))}${r.account_details.slice(-4)}`,
          status: r.status,
          adminNote: r.admin_note,
          createdAt: toIso(r.created_at),
          processedAt: r.processed_at ? toIso(r.processed_at) : null,
        }),
      ),
    };
  });

export const createWithdrawal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      rewardId: z.coerce.number(),
      paymentMethod: z.enum(["easypaisa", "jazzcash", "bank", "voucher"]),
      accountDetails: z.string().min(5).max(120),
    }),
  )
  .handler(async ({ context, data }) => {
    return wrap(async () => {
      rateLimit(context.userId, "withdraw", 6, 60_000);
      const profile = await ensureProfile(context.userId);
      const sql = await getSql();

      // Withdrawals: admin flag + optional scheduled open time
      const withdrawalsOpen = await getSettingInt(sql, "withdrawals_open", 1);
      const opensAtRaw = (await getSetting(sql, "withdrawals_opens_at", "")).trim();
      if (opensAtRaw) {
        const t = new Date(opensAtRaw).getTime();
        if (Number.isFinite(t) && Date.now() < t) {
          const when = new Date(t).toLocaleString("en-PK", {
            timeZone: "Asia/Karachi",
            dateStyle: "medium",
            timeStyle: "short",
          });
          throw new AppError(`Withdrawals coming soon — opens ${when} (PKT).`);
        }
      }
      if (withdrawalsOpen !== 1) {
        throw new AppError("Withdrawals are currently closed. Coming soon.");
      }

      const minPts = await getSettingInt(sql, "min_withdrawal_points", 1000);
      const dailyLimit = await getSettingInt(sql, "daily_withdrawal_limit_points", 5000);
      const monthlyLimit = await getSettingInt(sql, "monthly_withdrawal_limit_points", 20000);
      const reward = await sql<{
        id: number;
        title: string;
        points_cost: number;
        payment_method: string;
        stock: number | null;
        status: string;
      }>`select * from rewards where id = ${data.rewardId}`;
      const rw = reward[0];
      if (!rw || rw.status !== "active") throw new AppError("This reward is not available.");
      if (Number(rw.points_cost) < minPts) {
        /* catalog item still must meet global min if configured higher */
      }
      if (profile.pointsBalance < Number(rw.points_cost)) {
        throw new AppError("Not enough points for this reward.");
      }
      if (Number(rw.points_cost) < minPts) {
        throw new AppError(`Minimum redemption is ${minPts} points.`);
      }
      if (rw.stock != null && Number(rw.stock) <= 0) throw new AppError("This reward is out of stock.");

      const daySum = await sql<{ n: number }>`
        select coalesce(sum(points),0)::int as n from withdrawals
        where user_id = ${context.userId}
          and status not in ('rejected','cancelled')
          and created_at >= ((now() + interval '5 hours')::date - interval '5 hours')
      `;
      const monthSum = await sql<{ n: number }>`
        select coalesce(sum(points),0)::int as n from withdrawals
        where user_id = ${context.userId}
          and status not in ('rejected','cancelled')
          and created_at >= now() - interval '30 days'
      `;
      const pts = Number(rw.points_cost);
      if (Number(daySum[0]?.n ?? 0) + pts > dailyLimit) {
        throw new AppError("Daily redemption limit reached.");
      }
      if (Number(monthSum[0]?.n ?? 0) + pts > monthlyLimit) {
        throw new AppError("Monthly redemption limit reached.");
      }

      const open = await sql<{ n: number }>`
        select count(*)::int as n from withdrawals
        where user_id = ${context.userId} and status in ('pending','approved','processing')
      `;
      if (Number(open[0]?.n ?? 0) >= 3) {
        throw new AppError("You already have pending redemption requests.");
      }

      if (rw.stock != null) {
        const stock = await sql<{ id: number }>`
          update rewards set stock = stock - 1, updated_at = now()
          where id = ${rw.id} and stock > 0
          returning id
        `;
        if (!stock[0]) throw new AppError("This reward is out of stock.");
      }

      await creditPoints(
        sql,
        context.userId,
        -pts,
        "withdrawal",
        `Redemption: ${rw.title}`,
        "reward",
        String(rw.id),
      );
      const inserted = await sql<{ id: number }>`
        insert into withdrawals (user_id, points, reward_id, payment_method, account_details, status)
        values (${context.userId}, ${pts}, ${rw.id}, ${data.paymentMethod}, ${data.accountDetails.trim()}, 'pending')
        returning id
      `;
      await notify(
        sql,
        context.userId,
        "withdrawal_pending",
        "Redemption requested",
        `${rw.title} is pending admin review. Points are held and are not a guaranteed payout.`,
      );
      return { id: inserted[0]!.id, points: pts };
    });
  });

export const cancelWithdrawal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.coerce.number() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number; points: number; reward_id: number | null }>`
      update withdrawals
      set status = 'cancelled', processed_at = now()
      where id = ${data.id} and user_id = ${context.userId} and status = 'pending'
      returning id, points, reward_id
    `;
    const w = rows[0];
    if (!w) throw new AppError("This request cannot be cancelled.");
    await creditPoints(
      sql,
      context.userId,
      Number(w.points),
      "reversal",
      "Cancelled redemption",
      "withdrawal",
      String(w.id),
    );
    if (w.reward_id) {
      await sql`update rewards set stock = stock + 1, updated_at = now() where id = ${w.reward_id} and stock is not null`;
    }
    return { ok: true };
  });

export const listNotifications = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      type: string;
      title: string;
      body: string;
      read_at: unknown;
      created_at: unknown;
    }>`
      select id, type, title, body, read_at, created_at
      from notifications
      where user_id = ${context.userId}
      order by created_at desc
      limit 50
    `;
    return rows.map(
      (r): NotificationRow => ({
        id: r.id,
        type: r.type,
        title: r.title,
        body: r.body,
        readAt: r.read_at ? toIso(r.read_at) : null,
        createdAt: toIso(r.created_at),
      }),
    );
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`
      update notifications set read_at = now()
      where user_id = ${context.userId} and read_at is null
    `;
    return { ok: true };
  });

export const updateProfileSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      language: z.enum(["en", "ur"]).optional(),
      notificationsEnabled: z.boolean().optional(),
      displayName: z.string().min(2).max(40).optional(),
      avatarUrl: z.string().max(500).optional().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    if (data.language) {
      await sql`update app_profiles set language = ${data.language}, updated_at = now() where user_id = ${context.userId}`;
    }
    if (typeof data.notificationsEnabled === "boolean") {
      await sql`update app_profiles set notifications_enabled = ${data.notificationsEnabled}, updated_at = now() where user_id = ${context.userId}`;
    }
    if (data.displayName) {
      const name = data.displayName.trim();
      await sql`update app_profiles set display_name = ${name}, updated_at = now() where user_id = ${context.userId}`;
    }
    if (data.avatarUrl !== undefined) {
      const url = (data.avatarUrl ?? "").trim() || null;
      await sql`update app_profiles set avatar_url = ${url}, updated_at = now() where user_id = ${context.userId}`;
    }
    return { ok: true };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      category: z.enum(["general", "task", "payment"]),
      subject: z.string().min(4).max(120),
      body: z.string().min(8).max(2000),
    }),
  )
  .handler(async ({ context, data }) => {
    rateLimit(context.userId, "ticket", 8, 60_000);
    await ensureProfile(context.userId);
    const sql = await getSql();
    const t = await sql<{ id: number }>`
      insert into support_tickets (user_id, category, subject, status)
      values (${context.userId}, ${data.category}, ${data.subject.trim()}, 'open')
      returning id
    `;
    await sql`
      insert into support_replies (ticket_id, user_id, is_admin, body)
      values (${t[0]!.id}, ${context.userId}, false, ${data.body.trim()})
    `;
    return { id: t[0]!.id };
  });

export const listTickets = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      category: string;
      subject: string;
      status: string;
      created_at: unknown;
      updated_at: unknown;
    }>`
      select id, category, subject, status, created_at, updated_at
      from support_tickets
      where user_id = ${context.userId}
      order by updated_at desc
    `;
    return rows.map(
      (r): TicketRow => ({
        id: r.id,
        category: r.category,
        subject: r.subject,
        status: r.status,
        createdAt: toIso(r.created_at),
        updatedAt: toIso(r.updated_at),
      }),
    );
  });

export const getTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.coerce.number() }))
  .handler(async ({ context, data }) => {
    await ensureProfile(context.userId);
    const sql = await getSql();
    const t = await sql<{
      id: number;
      category: string;
      subject: string;
      status: string;
      created_at: unknown;
      updated_at: unknown;
      user_id: string;
    }>`select * from support_tickets where id = ${data.id} and user_id = ${context.userId}`;
    if (!t[0]) throw new AppError("Ticket not found.", 404);
    const replies = await sql<{
      id: number;
      is_admin: boolean;
      body: string;
      created_at: unknown;
    }>`
      select id, is_admin, body, created_at
      from support_replies where ticket_id = ${data.id} order by created_at asc
    `;
    return {
      ticket: {
        id: t[0].id,
        category: t[0].category,
        subject: t[0].subject,
        status: t[0].status,
        createdAt: toIso(t[0].created_at),
        updatedAt: toIso(t[0].updated_at),
      } satisfies TicketRow,
      replies: replies.map((r) => ({
        id: r.id,
        isAdmin: Boolean(r.is_admin),
        body: r.body,
        createdAt: toIso(r.created_at),
      })),
    };
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.coerce.number(), body: z.string().min(2).max(2000) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const t = await sql<{ id: number }>`
      select id from support_tickets where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!t[0]) throw new AppError("Ticket not found.", 404);
    await sql`
      insert into support_replies (ticket_id, user_id, is_admin, body)
      values (${data.id}, ${context.userId}, false, ${data.body.trim()})
    `;
    await sql`update support_tickets set status = 'open', updated_at = now() where id = ${data.id}`;
    return { ok: true };
  });



/** Daily lucky spin — once per calendar day. */
export const spinDaily = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    rateLimit(context.userId, "spin", 5, 60_000);
    const sql = await getSql();
    await ensureProfile(context.userId);
    const enabled = await getSetting(sql, "spin_enabled", "1");
    if (enabled !== "1") throw new AppError("Spin is disabled.");
    const today = new Date().toISOString().slice(0, 10);
    const existing = await sql`select id from spin_claims where user_id = ${context.userId} and claim_date = ${today}::date`;
    if (existing[0]) throw new AppError("Aaj ka spin pehle use ho chuka hai.");
    const prizesRaw = await getSetting(sql, "spin_prizes", "10,20,30,50,80,100,150");
    const prizes = prizesRaw.split(",").map((x) => Number(x.trim())).filter((n) => Number.isFinite(n) && n > 0);
    if (!prizes.length) throw new AppError("Spin prizes not configured.");
    const pts = prizes[Math.floor(Math.random() * prizes.length)]!;
    await sql`
      insert into spin_claims (user_id, claim_date, points) values (${context.userId}, ${today}::date, ${pts})
    `;
    await sql`update app_profiles set last_spin_date = ${today}::date, updated_at = now() where user_id = ${context.userId}`;
    const balance = await creditPoints(sql, context.userId, pts, "spin_reward", "Daily lucky spin", "spin", today);
    await notify(sql, context.userId, "spin", "Lucky spin!", `+${pts} points from today's spin.`);
    return { points: pts, balance };
  });

export const getSpinStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const today = new Date().toISOString().slice(0, 10);
    const row = await sql<{ points: number }>`
      select points from spin_claims where user_id = ${context.userId} and claim_date = ${today}::date limit 1
    `;
    const prizesRaw = await getSetting(sql, "spin_prizes", "10,20,30,50,80,100,150");
    const prizes = prizesRaw.split(",").map((x) => Number(x.trim())).filter((n) => Number.isFinite(n) && n > 0);
    return {
      usedToday: Boolean(row[0]),
      todayPoints: row[0]?.points ?? null,
      prizes,
      enabled: (await getSetting(sql, "spin_enabled", "1")) === "1",
    };
  });

/** Claim weekly leaderboard bonus if ranked top 10. */
export const claimLeaderboardBonus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(context.userId);
    const now = new Date();
    const weekKey = `${now.getUTCFullYear()}-W${Math.ceil((((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7)}`;
    const already = await sql`
      select id from leaderboard_claims where user_id = ${context.userId} and period = 'weekly' and period_key = ${weekKey}
    `;
    if (already[0]) throw new AppError("Is week ka rank bonus pehle claim ho chuka.");
    const board = await sql<{ user_id: string; pts: number }>`
      select user_id, lifetime_earned::int as pts from app_profiles
      where is_demo = false and status = 'active'
      order by lifetime_earned desc limit 10
    `;
    const idx = board.findIndex((r) => r.user_id === context.userId);
    if (idx < 0) throw new AppError("Top 10 mein nahi ho — bonus ke liye rank improve karo.");
    const rewardsRaw = await getSetting(sql, "leaderboard_weekly_rewards", "500,300,200,100,100,50,50,50,50,50");
    const rewards = rewardsRaw.split(",").map((x) => Number(x.trim()));
    const pts = rewards[idx] ?? 50;
    if (!pts || pts <= 0) throw new AppError("No reward for this rank.");
    await sql`
      insert into leaderboard_claims (user_id, period, period_key, rank, points)
      values (${context.userId}, 'weekly', ${weekKey}, ${idx + 1}, ${pts})
    `;
    const balance = await creditPoints(
      sql, context.userId, pts, "leaderboard_bonus", `Weekly rank #${idx + 1}`, "leaderboard", weekKey,
    );
    await notify(sql, context.userId, "leaderboard", "Rank bonus!", `Top ${idx + 1} — +${pts} points.`);
    return { rank: idx + 1, points: pts, balance };
  });

export function computeLevel(xp: number) {
  const tiers = [
    { name: "Bronze", need: 0, emoji: "🥉", bonusPct: 0 },
    { name: "Silver", need: 50, emoji: "🥈", bonusPct: 5 },
    { name: "Gold", need: 200, emoji: "🥇", bonusPct: 10 },
    { name: "Diamond", need: 500, emoji: "💎", bonusPct: 15 },
  ];
  let current = tiers[0]!;
  for (const t of tiers) {
    if (xp >= t.need) current = t;
  }
  const next = tiers.find((t) => t.need > xp) ?? null;
  return { ...current, xp, next, progress: next ? Math.min(100, Math.round(((xp - current.need) / (next.need - current.need)) * 100)) : 100 };
}

export const getMeAdminFlag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const p = await ensureProfile(context.userId);
    if (p.isAdmin) return { isAdmin: true };
    // Same first-admin bootstrap as requireAdmin
    const sql = await getSql();
    const cnt = await sql<{ n: number }>`
      select count(*)::int as n from app_profiles where is_admin = true and is_demo = false
    `;
    if (Number(cnt[0]?.n ?? 0) === 0) {
      await sql`
        update app_profiles set is_admin = true, updated_at = now()
        where user_id = ${context.userId} and is_demo = false
      `;
      return { isAdmin: true };
    }
    return { isAdmin: false };
  });

