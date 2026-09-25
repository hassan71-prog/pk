import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { toIso } from "@/lib/utils";
import {
  AppError,
  audit,
  creditPoints,
  maybeQualifyReferral,
  notify,
  recordCampaignSpend,
  requireAdmin,
} from "./helpers";

export const getAdminOverview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const users = await sql<{ n: number }>`select count(*)::int as n from app_profiles where is_demo = false`;
    const active = await sql<{ n: number }>`
      select count(*)::int as n from app_profiles
      where is_demo = false and updated_at >= now() - interval '7 days'
    `;
    const newToday = await sql<{ n: number }>`
      select count(*)::int as n from app_profiles
      where is_demo = false and created_at >= ((now() + interval '5 hours')::date - interval '5 hours')
    `;
    const tasksDone = await sql<{ n: number }>`
      select count(*)::int as n from task_completions where status = 'completed'
    `;
    const issued = await sql<{ n: number }>`
      select coalesce(sum(amount),0)::int as n from points_transactions where amount > 0
    `;
    const redeemed = await sql<{ n: number }>`
      select coalesce(sum(-amount),0)::int as n from points_transactions where type = 'withdrawal'
    `;
    const pendingWd = await sql<{ n: number }>`
      select count(*)::int as n from withdrawals where status = 'pending'
    `;
    const pendingTasks = await sql<{ n: number }>`
      select count(*)::int as n from task_completions where status = 'pending'
    `;
    const revenue = await sql<{
      gross: string;
      rewards: string;
      platform: string;
    }>`
      select coalesce(sum(gross_pkr),0)::text as gross,
             coalesce(sum(user_rewards_pkr),0)::text as rewards,
             coalesce(sum(platform_pkr),0)::text as platform
      from revenue_records
    `;
    const campaigns = await sql<{ n: number }>`select count(*)::int as n from campaigns where status = 'active'`;
    const pendingPay = await sql<{ n: string }>`
      select coalesce(sum(budget_pkr - spent_pkr),0)::text as n
      from campaigns where status in ('active','approved')
    `;
    return {
      totalUsers: Number(users[0]?.n ?? 0),
      activeUsers: Number(active[0]?.n ?? 0),
      newToday: Number(newToday[0]?.n ?? 0),
      tasksCompleted: Number(tasksDone[0]?.n ?? 0),
      pointsIssued: Number(issued[0]?.n ?? 0),
      pointsRedeemed: Number(redeemed[0]?.n ?? 0),
      pendingWithdrawals: Number(pendingWd[0]?.n ?? 0),
      pendingVerifications: Number(pendingTasks[0]?.n ?? 0),
      grossRevenue: revenue[0]?.gross ?? "0",
      userRewardsPkr: revenue[0]?.rewards ?? "0",
      platformRevenue: revenue[0]?.platform ?? "0",
      activeCampaigns: Number(campaigns[0]?.n ?? 0),
      pendingSponsorBudget: pendingPay[0]?.n ?? "0",
    };
  });

export const adminListUsers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z
      .object({
        q: z.string().optional(),
        status: z.enum(["all", "active", "suspended", "banned"]).optional(),
        page: z.coerce.number().int().min(0).optional(),
        pageSize: z.coerce.number().int().min(10).max(100).optional(),
      })
      .optional(),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const q = (data?.q ?? "").trim();
    const status = data?.status ?? "all";
    const page = data?.page ?? 0;
    const pageSize = data?.pageSize ?? 40;
    const offset = page * pageSize;

    const statusFilter =
      status === "all" ? sql`` : sql`and status = ${status}`;

    const searchFilter = q
      ? sql`and (
          display_name ilike ${"%" + q + "%"}
          or username ilike ${"%" + q + "%"}
          or user_id ilike ${"%" + q + "%"}
          or referral_code ilike ${"%" + q + "%"}
        )`
      : sql``;

    const countRows = await sql<{ n: number }>`
      select count(*)::int as n from app_profiles
      where is_demo = false ${statusFilter} ${searchFilter}
    `;
    const total = Number(countRows[0]?.n ?? 0);

    const rows = await sql`
      select user_id, display_name, username, points_balance, lifetime_earned,
             tasks_completed, status, is_admin, is_demo, created_at, referral_code
      from app_profiles
      where is_demo = false ${statusFilter} ${searchFilter}
      order by created_at desc
      limit ${pageSize} offset ${offset}
    `;

    return {
      total,
      page,
      pageSize,
      users: rows.map((r) => ({
        userId: String(r.user_id),
        displayName: String(r.display_name),
        username: (r.username as string | null) ?? null,
        points: Number(r.points_balance),
        earned: Number(r.lifetime_earned),
        tasks: Number(r.tasks_completed),
        status: String(r.status),
        isAdmin: Boolean(r.is_admin),
        isDemo: Boolean(r.is_demo),
        createdAt: toIso(r.created_at),
        referralCode: String(r.referral_code),
      })),
    };
  });

export const adminGetUserDetail = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const profiles = await sql`
      select user_id, display_name, username, points_balance, lifetime_earned, lifetime_redeemed,
             tasks_completed, status, is_admin, is_demo, created_at, referral_code,
             telegram_id, daily_streak, referred_by
      from app_profiles where user_id = ${data.userId}
    `;
    const p = profiles[0];
    if (!p) throw new AppError("User not found.");

    const txs = await sql`
      select id, type, amount, balance_after, note, created_at
      from points_transactions where user_id = ${data.userId}
      order by created_at desc limit 30
    `;
    const wds = await sql`
      select id, points, payment_method, status, created_at
      from withdrawals where user_id = ${data.userId}
      order by created_at desc limit 15
    `;
    const refs = await sql`
      select count(*)::int as n from app_profiles where referred_by = ${data.userId}
    `;

    return {
      userId: String(p.user_id),
      displayName: String(p.display_name),
      username: (p.username as string | null) ?? null,
      points: Number(p.points_balance),
      earned: Number(p.lifetime_earned),
      redeemed: Number(p.lifetime_redeemed),
      tasks: Number(p.tasks_completed),
      status: String(p.status),
      isAdmin: Boolean(p.is_admin),
      isDemo: Boolean(p.is_demo),
      createdAt: toIso(p.created_at),
      referralCode: String(p.referral_code),
      telegramId: (p.telegram_id as string | null) ?? null,
      dailyStreak: Number(p.daily_streak),
      referredBy: (p.referred_by as string | null) ?? null,
      referralCount: Number(refs[0]?.n ?? 0),
      transactions: txs.map((t) => ({
        id: Number(t.id),
        type: String(t.type),
        amount: Number(t.amount),
        balanceAfter: Number(t.balance_after),
        note: (t.note as string | null) ?? null,
        createdAt: toIso(t.created_at),
      })),
      withdrawals: wds.map((w) => ({
        id: Number(w.id),
        points: Number(w.points),
        paymentMethod: String(w.payment_method),
        status: String(w.status),
        createdAt: toIso(w.created_at),
      })),
    };
  });

export const adminSetUserStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), status: z.enum(["active", "suspended", "banned"]) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (data.userId === context.userId) throw new AppError("You cannot change your own status.");
    const sql = await getSql();
    await sql`update app_profiles set status = ${data.status}, updated_at = now() where user_id = ${data.userId} and is_demo = false`;
    await audit(sql, context.userId, "user.status", "user", data.userId, data.status);
    return { ok: true };
  });

export const adminAdjustPoints = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      userId: z.string(),
      amount: z.coerce.number().int(),
      reason: z.string().min(4).max(200),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (data.amount === 0) throw new AppError("Amount cannot be zero.");
    const sql = await getSql();
    const balance = await creditPoints(
      sql,
      data.userId,
      data.amount,
      data.amount > 0 ? "admin_adjustment" : "admin_adjustment",
      data.reason,
      "admin",
      context.userId,
    );
    await audit(sql, context.userId, "points.adjust", "user", data.userId, `${data.amount} ${data.reason}`);
    await notify(
      sql,
      data.userId,
      "bonus",
      "Balance updated",
      `${data.amount > 0 ? "+" : ""}${data.amount} points. ${data.reason}`,
    );
    return { balance };
  });

export const adminSetAdminFlag = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ userId: z.string(), isAdmin: z.boolean() }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    if (data.userId === context.userId && !data.isAdmin) {
      throw new AppError("You cannot remove your own admin access.");
    }
    const sql = await getSql();
    await sql`update app_profiles set is_admin = ${data.isAdmin}, updated_at = now() where user_id = ${data.userId} and is_demo = false`;
    await audit(sql, context.userId, "admin.flag", "user", data.userId, String(data.isAdmin));
    return { ok: true };
  });

export const adminListTasks = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select id, title, description, category, reward_points, verification_type, status, is_featured,
             max_completions, completion_count, sponsor_name, is_demo, created_at, target_url,
             min_dwell_seconds
      from tasks order by id desc
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      description: String(r.description ?? ""),
      category: String(r.category),
      rewardPoints: Number(r.reward_points),
      verificationType: String(r.verification_type),
      status: String(r.status),
      isFeatured: Boolean(r.is_featured),
      maxCompletions: r.max_completions == null ? null : Number(r.max_completions),
      completionCount: Number(r.completion_count),
      sponsorName: (r.sponsor_name as string | null) ?? null,
      isDemo: Boolean(r.is_demo),
      createdAt: toIso(r.created_at),
      targetUrl: (r.target_url as string | null) ?? null,
      minDwellSeconds: Number(r.min_dwell_seconds ?? 8),
    }));
  });

const taskInput = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(3).max(120),
  description: z.string().max(2000),
  category: z.enum(["telegram", "website", "social", "sponsored", "affiliate", "daily"]),
  rewardPoints: z.coerce.number().int().min(1).max(100000),
  targetUrl: z.string().max(500).optional().nullable(),
  verificationType: z.enum([
    "visit_token",
    "admin_approval",
    "telegram_membership",
    "unique_token",
    "sponsor_callback",
  ]),
  maxCompletions: z.coerce.number().int().min(1).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "archived"]),
  sponsorName: z.string().max(80).optional().nullable(),
  campaignId: z.coerce.number().optional().nullable(),
  minDwellSeconds: z.coerce.number().int().min(0).max(600).optional(),
  isFeatured: z.boolean().optional(),
});

export const adminSaveTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(taskInput)
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    if (data.id) {
      await sql`
        update tasks set
          title = ${data.title},
          description = ${data.description},
          category = ${data.category},
          reward_points = ${data.rewardPoints},
          target_url = ${data.targetUrl ?? null},
          verification_type = ${data.verificationType},
          max_completions = ${data.maxCompletions ?? null},
          start_date = ${data.startDate ?? null},
          end_date = ${data.endDate ?? null},
          status = ${data.status},
          sponsor_name = ${data.sponsorName ?? null},
          campaign_id = ${data.campaignId ?? null},
          min_dwell_seconds = ${data.minDwellSeconds ?? 8},
          is_featured = ${data.isFeatured ?? false},
          updated_at = now()
        where id = ${data.id}
      `;
      await audit(sql, context.userId, "task.update", "task", String(data.id), data.title);
      return { id: data.id };
    }
    const ins = await sql<{ id: number }>`
      insert into tasks (
        title, description, category, reward_points, target_url, verification_type,
        max_completions, start_date, end_date, status, sponsor_name, campaign_id,
        min_dwell_seconds, is_featured
      ) values (
        ${data.title}, ${data.description}, ${data.category}, ${data.rewardPoints},
        ${data.targetUrl ?? null}, ${data.verificationType}, ${data.maxCompletions ?? null},
        ${data.startDate ?? null}, ${data.endDate ?? null}, ${data.status},
        ${data.sponsorName ?? null}, ${data.campaignId ?? null}, ${data.minDwellSeconds ?? 8},
        ${data.isFeatured ?? false}
      ) returning id
    `;
    await audit(sql, context.userId, "task.create", "task", String(ins[0]!.id), data.title);
    return { id: ins[0]!.id };
  });

export const adminListVerifications = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select c.id, c.user_id, c.task_id, c.status, c.proof_url, c.proof_note, c.started_at,
             c.submitted_at, t.title, t.reward_points, p.display_name
      from task_completions c
      join tasks t on t.id = c.task_id
      join app_profiles p on p.user_id = c.user_id
      where c.status = 'pending'
      order by c.submitted_at asc
      limit 80
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      userId: String(r.user_id),
      displayName: String(r.display_name),
      taskId: Number(r.task_id),
      title: String(r.title),
      rewardPoints: Number(r.reward_points),
      proofUrl: (r.proof_url as string | null) ?? null,
      proofNote: (r.proof_note as string | null) ?? null,
      startedAt: toIso(r.started_at),
      submittedAt: r.submitted_at ? toIso(r.submitted_at) : null,
    }));
  });

export const adminReviewTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      completionId: z.coerce.number(),
      approve: z.boolean(),
      note: z.string().max(300).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      user_id: string;
      task_id: number;
      status: string;
    }>`select id, user_id, task_id, status from task_completions where id = ${data.completionId}`;
    const c = rows[0];
    if (!c || c.status !== "pending") throw new AppError("This submission is not pending.");
    const task = await sql<{ title: string; reward_points: number; campaign_id: number | null }>`
      select title, reward_points, campaign_id from tasks where id = ${c.task_id}
    `;
    const t = task[0];
    if (!t) throw new AppError("Task missing.");
    if (data.approve) {
      await recordCampaignSpend(sql, t.campaign_id);
      await sql`
        update task_completions
        set status = 'completed', reviewed_at = now(), reviewed_by = ${context.userId},
            admin_note = ${data.note ?? null}, updated_at = now()
        where id = ${c.id} and status = 'pending'
      `;
      await sql`update tasks set completion_count = completion_count + 1 where id = ${c.task_id}`;
      await sql`update app_profiles set tasks_completed = tasks_completed + 1 where user_id = ${c.user_id}`;
      await creditPoints(
        sql,
        c.user_id,
        Number(t.reward_points),
        "task_reward",
        t.title,
        "task",
        String(c.task_id),
      );
      await maybeQualifyReferral(sql, c.user_id);
      await notify(sql, c.user_id, "task_approved", "Task approved", `+${t.reward_points} points for ${t.title}.`);
      await audit(sql, context.userId, "task.approve", "completion", String(c.id), t.title);
    } else {
      await sql`
        update task_completions
        set status = 'rejected', reviewed_at = now(), reviewed_by = ${context.userId},
            admin_note = ${data.note ?? "Rejected"}, updated_at = now()
        where id = ${c.id} and status = 'pending'
      `;
      await notify(
        sql,
        c.user_id,
        "task_rejected",
        "Task not approved",
        data.note?.trim() || `${t.title} was not approved. No points were added.`,
      );
      await audit(sql, context.userId, "task.reject", "completion", String(c.id), data.note ?? "");
    }
    return { ok: true };
  });

export const adminListWithdrawals = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select w.id, w.user_id, w.points, w.payment_method, w.account_details, w.status,
             w.admin_note, w.created_at, w.processed_at, p.display_name, r.title
      from withdrawals w
      join app_profiles p on p.user_id = w.user_id
      left join rewards r on r.id = w.reward_id
      order by
        case w.status when 'pending' then 0 when 'approved' then 1 when 'processing' then 2 else 3 end,
        w.created_at desc
      limit 80
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      userId: String(r.user_id),
      displayName: String(r.display_name),
      points: Number(r.points),
      paymentMethod: String(r.payment_method),
      accountDetails: String(r.account_details),
      status: String(r.status),
      adminNote: (r.admin_note as string | null) ?? null,
      createdAt: toIso(r.created_at),
      processedAt: r.processed_at ? toIso(r.processed_at) : null,
      rewardTitle: (r.title as string | null) ?? null,
    }));
  });

export const adminUpdateWithdrawal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.coerce.number(),
      status: z.enum(["approved", "processing", "paid", "rejected"]),
      note: z.string().max(300).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const cur = await sql<{
      id: number;
      user_id: string;
      points: number;
      status: string;
      reward_id: number | null;
    }>`select id, user_id, points, status, reward_id from withdrawals where id = ${data.id}`;
    const w = cur[0];
    if (!w) throw new AppError("Request not found.");
    const allowed: Record<string, string[]> = {
      pending: ["approved", "rejected"],
      approved: ["processing", "rejected"],
      processing: ["paid", "rejected"],
    };
    if (!allowed[w.status]?.includes(data.status)) {
      throw new AppError(`Cannot move from ${w.status} to ${data.status}.`);
    }
    await sql`
      update withdrawals
      set status = ${data.status}, admin_note = ${data.note ?? null},
          processed_at = now(), processed_by = ${context.userId}
      where id = ${w.id}
    `;
    if (data.status === "rejected") {
      await creditPoints(
        sql,
        w.user_id,
        Number(w.points),
        "reversal",
        data.note || "Redemption rejected — points returned",
        "withdrawal",
        String(w.id),
      );
      if (w.reward_id) {
        await sql`update rewards set stock = stock + 1 where id = ${w.reward_id} and stock is not null`;
      }
      await notify(
        sql,
        w.user_id,
        "withdrawal_rejected",
        "Redemption declined",
        data.note || "Your redemption was declined and points were returned.",
      );
    } else if (data.status === "paid") {
      await notify(
        sql,
        w.user_id,
        "withdrawal_approved",
        "Redemption paid",
        "Your campaign reward was marked paid. Timing depends on the payment rail used.",
      );
    } else if (data.status === "approved") {
      await notify(
        sql,
        w.user_id,
        "withdrawal_approved",
        "Redemption approved",
        "Your request was approved and is being processed. This is not an instant bank transfer.",
      );
    }
    await audit(sql, context.userId, "withdrawal." + data.status, "withdrawal", String(w.id), data.note ?? "");
    return { ok: true };
  });

export const adminBulkUpdateWithdrawals = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      ids: z.array(z.coerce.number()).min(1).max(50),
      status: z.enum(["approved", "rejected"]),
      note: z.string().max(300).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    let ok = 0;
    let failed = 0;
    for (const id of data.ids) {
      try {
        const cur = await sql<{
          id: number;
          user_id: string;
          points: number;
          status: string;
          reward_id: number | null;
        }>`select id, user_id, points, status, reward_id from withdrawals where id = ${id}`;
        const w = cur[0];
        if (!w || w.status !== "pending") {
          failed += 1;
          continue;
        }
        await sql`
          update withdrawals
          set status = ${data.status}, admin_note = ${data.note ?? null},
              processed_at = now(), processed_by = ${context.userId}
          where id = ${w.id}
        `;
        if (data.status === "rejected") {
          await creditPoints(
            sql,
            w.user_id,
            Number(w.points),
            "reversal",
            data.note || "Redemption rejected — points returned",
            "withdrawal",
            String(w.id),
          );
          if (w.reward_id) {
            await sql`update rewards set stock = stock + 1 where id = ${w.reward_id} and stock is not null`;
          }
          await notify(
            sql,
            w.user_id,
            "withdrawal_rejected",
            "Redemption declined",
            data.note || "Your redemption was declined and points were returned.",
          );
        } else {
          await notify(
            sql,
            w.user_id,
            "withdrawal_approved",
            "Redemption approved",
            "Your request was approved and is being processed.",
          );
        }
        await audit(sql, context.userId, "withdrawal." + data.status, "withdrawal", String(w.id), data.note ?? "bulk");
        ok += 1;
      } catch {
        failed += 1;
      }
    }
    return { ok, failed };
  });

export const adminListTransactions = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z
      .object({
        q: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const q = (data?.q ?? "").trim();
    const from = data?.from?.trim() || null;
    const to = data?.to?.trim() || null;

    const searchFilter = q
      ? sql`and (p.display_name ilike ${"%" + q + "%"} or t.note ilike ${"%" + q + "%"} or t.type ilike ${"%" + q + "%"})`
      : sql``;
    const fromFilter = from ? sql`and t.created_at >= ${from}::timestamptz` : sql``;
    const toFilter = to ? sql`and t.created_at < (${to}::date + interval '1 day')` : sql``;

    const rows = await sql`
      select t.id, t.user_id, t.type, t.amount, t.balance_after, t.note, t.created_at, p.display_name
      from points_transactions t
      join app_profiles p on p.user_id = t.user_id
      where 1=1 ${searchFilter} ${fromFilter} ${toFilter}
      order by t.created_at desc
      limit 150
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      userId: String(r.user_id),
      displayName: String(r.display_name),
      type: String(r.type),
      amount: Number(r.amount),
      balanceAfter: Number(r.balance_after),
      note: (r.note as string | null) ?? null,
      createdAt: toIso(r.created_at),
    }));
  });

export const adminListRewards = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`select * from rewards order by points_cost asc`;
    return rows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      description: String(r.description),
      pointsCost: Number(r.points_cost),
      paymentMethod: String(r.payment_method),
      stock: r.stock == null ? null : Number(r.stock),
      status: String(r.status),
      isDemo: Boolean(r.is_demo),
    }));
  });

export const adminSaveReward = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.coerce.number().optional(),
      title: z.string().min(3).max(120),
      description: z.string().max(500),
      pointsCost: z.coerce.number().int().min(1),
      paymentMethod: z.enum(["easypaisa", "jazzcash", "bank", "voucher"]),
      stock: z.coerce.number().int().min(0).optional().nullable(),
      status: z.enum(["active", "paused"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    if (data.id) {
      await sql`
        update rewards set title = ${data.title}, description = ${data.description},
          points_cost = ${data.pointsCost}, payment_method = ${data.paymentMethod},
          stock = ${data.stock ?? null}, status = ${data.status}, updated_at = now()
        where id = ${data.id}
      `;
      await audit(sql, context.userId, "reward.update", "reward", String(data.id), data.title);
      return { id: data.id };
    }
    const ins = await sql<{ id: number }>`
      insert into rewards (title, description, points_cost, payment_method, stock, status)
      values (${data.title}, ${data.description}, ${data.pointsCost}, ${data.paymentMethod}, ${data.stock ?? null}, ${data.status})
      returning id
    `;
    await audit(sql, context.userId, "reward.create", "reward", String(ins[0]!.id), data.title);
    return { id: ins[0]!.id };
  });

export const adminListSponsors = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const sponsors = await sql`select * from sponsors order by id desc`;
    const campaigns = await sql`
      select c.*, s.name as sponsor_name from campaigns c
      left join sponsors s on s.id = c.sponsor_id
      order by c.id desc
    `;
    return {
      sponsors: sponsors.map((s) => ({
        id: Number(s.id),
        name: String(s.name),
        contactEmail: (s.contact_email as string | null) ?? null,
        status: String(s.status),
        notes: (s.notes as string | null) ?? null,
        isDemo: Boolean(s.is_demo),
      })),
      campaigns: campaigns.map((c) => ({
        id: Number(c.id),
        sponsorId: c.sponsor_id == null ? null : Number(c.sponsor_id),
        sponsorName: (c.sponsor_name as string | null) ?? null,
        title: String(c.title),
        taskType: String(c.task_type),
        targetUrl: (c.target_url as string | null) ?? null,
        rewardPerCompletion: Number(c.reward_per_completion),
        maxUsers: c.max_users == null ? null : Number(c.max_users),
        budgetPkr: String(c.budget_pkr),
        spentPkr: String(c.spent_pkr),
        remainingPkr: String(Number(c.budget_pkr) - Number(c.spent_pkr)),
        costPerCompletionPkr: String(c.cost_per_completion_pkr),
        completions: Number(c.completions),
        status: String(c.status),
        isDemo: Boolean(c.is_demo),
      })),
    };
  });

export const adminSaveSponsor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      name: z.string().min(2).max(80),
      contactEmail: z.string().email().optional().nullable(),
      notes: z.string().max(400).optional().nullable(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const ins = await sql<{ id: number }>`
      insert into sponsors (name, contact_email, notes, status)
      values (${data.name}, ${data.contactEmail ?? null}, ${data.notes ?? null}, 'active')
      returning id
    `;
    await audit(sql, context.userId, "sponsor.create", "sponsor", String(ins[0]!.id), data.name);
    return { id: ins[0]!.id };
  });

export const adminSaveCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.coerce.number().optional(),
      sponsorId: z.coerce.number(),
      title: z.string().min(3).max(120),
      taskType: z.string().min(3).max(40),
      targetUrl: z.string().max(500).optional().nullable(),
      rewardPerCompletion: z.coerce.number().int().min(1),
      maxUsers: z.coerce.number().int().min(1).optional().nullable(),
      budgetPkr: z.coerce.number().min(0),
      costPerCompletionPkr: z.coerce.number().min(0),
      status: z.enum(["pending", "approved", "active", "paused", "completed", "rejected"]),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    if (data.id) {
      await sql`
        update campaigns set
          sponsor_id = ${data.sponsorId}, title = ${data.title}, task_type = ${data.taskType},
          target_url = ${data.targetUrl ?? null}, reward_per_completion = ${data.rewardPerCompletion},
          max_users = ${data.maxUsers ?? null}, budget_pkr = ${String(data.budgetPkr)},
          cost_per_completion_pkr = ${String(data.costPerCompletionPkr)}, status = ${data.status},
          updated_at = now()
        where id = ${data.id}
      `;
      await audit(sql, context.userId, "campaign.update", "campaign", String(data.id), data.status);
      return { id: data.id };
    }
    const ins = await sql<{ id: number }>`
      insert into campaigns (
        sponsor_id, title, task_type, target_url, reward_per_completion, max_users,
        budget_pkr, cost_per_completion_pkr, status
      ) values (
        ${data.sponsorId}, ${data.title}, ${data.taskType}, ${data.targetUrl ?? null},
        ${data.rewardPerCompletion}, ${data.maxUsers ?? null}, ${String(data.budgetPkr)},
        ${String(data.costPerCompletionPkr)}, ${data.status}
      ) returning id
    `;
    await audit(sql, context.userId, "campaign.create", "campaign", String(ins[0]!.id), data.title);
    return { id: ins[0]!.id };
  });

export const adminListReferrals = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select r.id, r.status, r.created_at, r.rewarded_at,
             a.display_name as referrer, b.display_name as referred
      from referrals r
      join app_profiles a on a.user_id = r.referrer_user_id
      join app_profiles b on b.user_id = r.referred_user_id
      order by r.created_at desc
      limit 100
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      status: String(r.status),
      createdAt: toIso(r.created_at),
      rewardedAt: r.rewarded_at ? toIso(r.rewarded_at) : null,
      referrer: String(r.referrer),
      referred: String(r.referred),
    }));
  });

export const adminGetSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql<{ key: string; value: string }>`select key, value from settings order by key`;
    return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ entries: z.record(z.string(), z.string()) }))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const allowed = new Set([
      "daily_schedule",
      "referral_reward",
      "referral_qualify_tasks",
      "max_referral_rewards",
      "min_withdrawal_points",
      "daily_withdrawal_limit_points",
      "monthly_withdrawal_limit_points",
      "bot_username",
      "support_email",
      "platform_name",
      "points_to_pkr",
      "withdrawals_opens_at",
    ]);
    for (const [key, value] of Object.entries(data.entries)) {
      if (!allowed.has(key)) continue;
      await sql`
        insert into settings (key, value, updated_at) values (${key}, ${value}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `;
    }
    await audit(sql, context.userId, "settings.update", "settings", null, JSON.stringify(Object.keys(data.entries)));
    return { ok: true };
  });

export const adminListAudit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select a.id, a.actor_user_id, a.action, a.entity_type, a.entity_id, a.detail, a.created_at,
             p.display_name
      from audit_logs a
      left join app_profiles p on p.user_id = a.actor_user_id
      order by a.created_at desc
      limit 120
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      actor: String(r.display_name ?? r.actor_user_id ?? "system"),
      action: String(r.action),
      entityType: (r.entity_type as string | null) ?? null,
      entityId: (r.entity_id as string | null) ?? null,
      detail: (r.detail as string | null) ?? null,
      createdAt: toIso(r.created_at),
    }));
  });

export const adminListTickets = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const rows = await sql`
      select t.id, t.category, t.subject, t.status, t.created_at, t.updated_at, p.display_name
      from support_tickets t
      join app_profiles p on p.user_id = t.user_id
      order by t.updated_at desc
      limit 80
    `;
    return rows.map((r) => ({
      id: Number(r.id),
      category: String(r.category),
      subject: String(r.subject),
      status: String(r.status),
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
      displayName: String(r.display_name),
    }));
  });

export const adminReplyTicket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      id: z.coerce.number(),
      body: z.string().min(2).max(2000),
      status: z.enum(["open", "pending", "closed"]).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const t = await sql<{ user_id: string }>`select user_id from support_tickets where id = ${data.id}`;
    if (!t[0]) throw new AppError("Ticket not found.", 404);
    await sql`
      insert into support_replies (ticket_id, user_id, is_admin, body)
      values (${data.id}, ${context.userId}, true, ${data.body.trim()})
    `;
    await sql`
      update support_tickets
      set status = ${data.status ?? "pending"}, updated_at = now()
      where id = ${data.id}
    `;
    await notify(sql, t[0].user_id, "support", "Support replied", "You have a new reply on your support ticket.");
    await audit(sql, context.userId, "ticket.reply", "ticket", String(data.id), data.status ?? "pending");
    return { ok: true };
  });

export const adminGetReports = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const byType = await sql<{ type: string; n: number; pts: number }>`
      select type, count(*)::int as n, coalesce(sum(amount),0)::int as pts
      from points_transactions
      group by type
      order by pts desc
    `;
    const revenue = await sql<{ source: string; gross: string; platform: string }>`
      select source, coalesce(sum(gross_pkr),0)::text as gross, coalesce(sum(platform_pkr),0)::text as platform
      from revenue_records
      group by source
    `;
    return {
      pointsByType: byType.map((r) => ({ type: r.type, count: Number(r.n), points: Number(r.pts) })),
      revenueBySource: revenue.map((r) => ({
        source: r.source,
        gross: r.gross,
        platform: r.platform,
      })),
    };
  });

export const adminPurgeDemo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    await sql`delete from points_transactions where user_id in (select user_id from app_profiles where is_demo = true)`;
    await sql`delete from app_profiles where is_demo = true`;
    await sql`delete from tasks where is_demo = true`;
    await sql`delete from rewards where is_demo = true`;
    await sql`delete from campaigns where is_demo = true`;
    await sql`delete from sponsors where is_demo = true`;
    await sql`delete from revenue_records where is_demo = true`;
    await audit(sql, context.userId, "demo.purge", "system", null, "Removed is_demo records");
    return { ok: true };
  });
  export const adminGetWithdrawalStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();
    const openRows = await sql<{ value: string }>`
      select value from settings where key = 'withdrawals_open' limit 1
    `;
    const rateRows = await sql<{ value: string }>`
      select value from settings where key = 'points_to_pkr' limit 1
    `;
    const atRows = await sql<{ value: string }>`
      select value from settings where key = 'withdrawals_opens_at' limit 1
    `;
    const opensAt = (atRows[0]?.value ?? "").trim() || null;
    let scheduledOpen = true;
    if (opensAt) {
      const t = new Date(opensAt).getTime();
      if (Number.isFinite(t) && Date.now() < t) scheduledOpen = false;
    }
    const flagOpen = (openRows[0]?.value ?? "1") === "1";
    return {
      open: flagOpen && scheduledOpen,
      flagOpen,
      opensAt,
      pointsToPkr: rateRows[0]?.value ?? "0.02",
      comingSoon: Boolean(opensAt && !scheduledOpen),
    };
  });

export const adminSetWithdrawalStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      open: z.boolean().optional(),
      opensAt: z.string().max(40).optional().nullable(),
      pointsToPkr: z.string().max(20).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const sql = await getSql();

    if (typeof data.open === "boolean") {
      await sql`
        insert into settings (key, value, updated_at)
        values ('withdrawals_open', ${data.open ? "1" : "0"}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `;
    }
    if (data.opensAt !== undefined) {
      const v = data.opensAt?.trim() || "";
      await sql`
        insert into settings (key, value, updated_at)
        values ('withdrawals_opens_at', ${v}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `;
    }
    if (data.pointsToPkr !== undefined) {
      const n = Number(data.pointsToPkr);
      if (!Number.isFinite(n) || n < 0) throw new AppError("Invalid points rate.");
      await sql`
        insert into settings (key, value, updated_at)
        values ('points_to_pkr', ${String(n)}, now())
        on conflict (key) do update set value = excluded.value, updated_at = now()
      `;
    }

    await audit(
      sql,
      context.userId,
      "withdrawals.config",
      "settings",
      "withdrawals",
      JSON.stringify(data),
    );

    return { ok: true };
  });


