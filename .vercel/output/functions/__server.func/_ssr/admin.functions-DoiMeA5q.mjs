import { r as createServerFn } from "./ssr.mjs";
import { I as object, O as _enum, R as record, j as boolean, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { C as toIso, a as creditPoints, b as recordCampaignSpend, g as maybeQualifyReferral, m as getSql, r as audit, t as AppError, v as notify, x as requireAdmin } from "./helpers-NOxQJUtC.mjs";
import { n as number } from "../_libs/zod.mjs";
import { t as authMiddleware } from "./middleware-Lb1eCpaC.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-DoiMeA5q.js
var getAdminOverview_createServerFn_handler = createServerRpc({
	id: "2af597c86c8037f64e32d34097e156121b62bcd269668c6dc6eb673d6abafac8",
	name: "getAdminOverview",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
var getAdminOverview = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(getAdminOverview_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const users = await sql`select count(*)::int as n from app_profiles where is_demo = false`;
	const active = await sql`
      select count(*)::int as n from app_profiles
      where is_demo = false and updated_at >= now() - interval '7 days'
    `;
	const newToday = await sql`
      select count(*)::int as n from app_profiles
      where is_demo = false and created_at >= ((now() + interval '5 hours')::date - interval '5 hours')
    `;
	const tasksDone = await sql`
      select count(*)::int as n from task_completions where status = 'completed'
    `;
	const issued = await sql`
      select coalesce(sum(amount),0)::int as n from points_transactions where amount > 0
    `;
	const redeemed = await sql`
      select coalesce(sum(-amount),0)::int as n from points_transactions where type = 'withdrawal'
    `;
	const pendingWd = await sql`
      select count(*)::int as n from withdrawals where status = 'pending'
    `;
	const pendingTasks = await sql`
      select count(*)::int as n from task_completions where status = 'pending'
    `;
	const revenue = await sql`
      select coalesce(sum(gross_pkr),0)::text as gross,
             coalesce(sum(user_rewards_pkr),0)::text as rewards,
             coalesce(sum(platform_pkr),0)::text as platform
      from revenue_records
    `;
	const campaigns = await sql`select count(*)::int as n from campaigns where status = 'active'`;
	const pendingPay = await sql`
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
		pendingSponsorBudget: pendingPay[0]?.n ?? "0"
	};
});
var adminListUsers_createServerFn_handler = createServerRpc({
	id: "05cc20f9cc28ddd383a4d42e7e891fdcdac7a7381d5681f390e25372bd31dc10",
	name: "adminListUsers",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListUsers.__executeServer(opts));
var adminListUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ q: string().optional() }).optional()).handler(adminListUsers_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const q = (data?.q ?? "").trim();
	return (q ? await sql`
          select user_id, display_name, username, points_balance, lifetime_earned,
                 tasks_completed, status, is_admin, is_demo, created_at, referral_code
          from app_profiles
          where display_name ilike ${"%" + q + "%"}
             or username ilike ${"%" + q + "%"}
             or user_id ilike ${"%" + q + "%"}
             or referral_code ilike ${"%" + q + "%"}
          order by created_at desc
          limit 80
        ` : await sql`
          select user_id, display_name, username, points_balance, lifetime_earned,
                 tasks_completed, status, is_admin, is_demo, created_at, referral_code
          from app_profiles
          order by is_demo asc, created_at desc
          limit 80
        `).map((r) => ({
		userId: String(r.user_id),
		displayName: String(r.display_name),
		username: r.username ?? null,
		points: Number(r.points_balance),
		earned: Number(r.lifetime_earned),
		tasks: Number(r.tasks_completed),
		status: String(r.status),
		isAdmin: Boolean(r.is_admin),
		isDemo: Boolean(r.is_demo),
		createdAt: toIso(r.created_at),
		referralCode: String(r.referral_code)
	}));
});
var adminSetUserStatus_createServerFn_handler = createServerRpc({
	id: "d3d3101600441e7ed130ddc0ad30f62207b990752b4eb545a66fa8994e5add63",
	name: "adminSetUserStatus",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSetUserStatus.__executeServer(opts));
var adminSetUserStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	status: _enum([
		"active",
		"suspended",
		"banned"
	])
})).handler(adminSetUserStatus_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	if (data.userId === context.userId) throw new AppError("You cannot change your own status.");
	const sql = await getSql();
	await sql`update app_profiles set status = ${data.status}, updated_at = now() where user_id = ${data.userId} and is_demo = false`;
	await audit(sql, context.userId, "user.status", "user", data.userId, data.status);
	return { ok: true };
});
var adminAdjustPoints_createServerFn_handler = createServerRpc({
	id: "3ffecc9e0956cc4ca99d090fe3640487c7d64914e8c3d3eb03d817dd1920618f",
	name: "adminAdjustPoints",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminAdjustPoints.__executeServer(opts));
var adminAdjustPoints = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	amount: number().int(),
	reason: string().min(4).max(200)
})).handler(adminAdjustPoints_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	if (data.amount === 0) throw new AppError("Amount cannot be zero.");
	const sql = await getSql();
	const balance = await creditPoints(sql, data.userId, data.amount, data.amount > 0 ? "admin_adjustment" : "admin_adjustment", data.reason, "admin", context.userId);
	await audit(sql, context.userId, "points.adjust", "user", data.userId, `${data.amount} ${data.reason}`);
	await notify(sql, data.userId, "bonus", "Balance updated", `${data.amount > 0 ? "+" : ""}${data.amount} points. ${data.reason}`);
	return { balance };
});
var adminSetAdminFlag_createServerFn_handler = createServerRpc({
	id: "d40419c953dfd1fa283d1f83cc9aa82c3cf09f917cfaf5dfab239cbabc2feeea",
	name: "adminSetAdminFlag",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSetAdminFlag.__executeServer(opts));
var adminSetAdminFlag = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	isAdmin: boolean()
})).handler(adminSetAdminFlag_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	if (data.userId === context.userId && !data.isAdmin) throw new AppError("You cannot remove your own admin access.");
	const sql = await getSql();
	await sql`update app_profiles set is_admin = ${data.isAdmin}, updated_at = now() where user_id = ${data.userId} and is_demo = false`;
	await audit(sql, context.userId, "admin.flag", "user", data.userId, String(data.isAdmin));
	return { ok: true };
});
var adminListTasks_createServerFn_handler = createServerRpc({
	id: "fec556a7fb8e764beecc7e6081c9ac0e84d2fa213a07568861eed4821a7602f4",
	name: "adminListTasks",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListTasks.__executeServer(opts));
var adminListTasks = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListTasks_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select id, title, category, reward_points, verification_type, status, is_featured,
             max_completions, completion_count, sponsor_name, is_demo, created_at, target_url
      from tasks order by id desc
    `).map((r) => ({
		id: Number(r.id),
		title: String(r.title),
		category: String(r.category),
		rewardPoints: Number(r.reward_points),
		verificationType: String(r.verification_type),
		status: String(r.status),
		isFeatured: Boolean(r.is_featured),
		maxCompletions: r.max_completions == null ? null : Number(r.max_completions),
		completionCount: Number(r.completion_count),
		sponsorName: r.sponsor_name ?? null,
		isDemo: Boolean(r.is_demo),
		createdAt: toIso(r.created_at),
		targetUrl: r.target_url ?? null
	}));
});
var taskInput = object({
	id: number().optional(),
	title: string().min(3).max(120),
	description: string().max(2e3),
	category: _enum([
		"telegram",
		"website",
		"social",
		"sponsored",
		"affiliate",
		"daily"
	]),
	rewardPoints: number().int().min(1).max(1e5),
	targetUrl: string().max(500).optional().nullable(),
	verificationType: _enum([
		"visit_token",
		"admin_approval",
		"telegram_membership",
		"unique_token",
		"sponsor_callback"
	]),
	maxCompletions: number().int().min(1).optional().nullable(),
	startDate: string().optional().nullable(),
	endDate: string().optional().nullable(),
	status: _enum([
		"active",
		"paused",
		"archived"
	]),
	sponsorName: string().max(80).optional().nullable(),
	campaignId: number().optional().nullable(),
	minDwellSeconds: number().int().min(0).max(600).optional(),
	isFeatured: boolean().optional()
});
var adminSaveTask_createServerFn_handler = createServerRpc({
	id: "1eef165d662922e245ed298192a11c60f3b1a1e40cee6fec80aa98a00e0ab769",
	name: "adminSaveTask",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSaveTask.__executeServer(opts));
var adminSaveTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(taskInput).handler(adminSaveTask_createServerFn_handler, async ({ context, data }) => {
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
	const ins = await sql`
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
	await audit(sql, context.userId, "task.create", "task", String(ins[0].id), data.title);
	return { id: ins[0].id };
});
var adminListVerifications_createServerFn_handler = createServerRpc({
	id: "9ca5318ef743b3aca172be7f3389574373379cf428c96cf5308aaf23d143360e",
	name: "adminListVerifications",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListVerifications.__executeServer(opts));
var adminListVerifications = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListVerifications_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select c.id, c.user_id, c.task_id, c.status, c.proof_url, c.proof_note, c.started_at,
             c.submitted_at, t.title, t.reward_points, p.display_name
      from task_completions c
      join tasks t on t.id = c.task_id
      join app_profiles p on p.user_id = c.user_id
      where c.status = 'pending'
      order by c.submitted_at asc
      limit 80
    `).map((r) => ({
		id: Number(r.id),
		userId: String(r.user_id),
		displayName: String(r.display_name),
		taskId: Number(r.task_id),
		title: String(r.title),
		rewardPoints: Number(r.reward_points),
		proofUrl: r.proof_url ?? null,
		proofNote: r.proof_note ?? null,
		startedAt: toIso(r.started_at),
		submittedAt: r.submitted_at ? toIso(r.submitted_at) : null
	}));
});
var adminReviewTask_createServerFn_handler = createServerRpc({
	id: "ad05fd3329f98ce48e28f7c6e8abbb0e6a677b0f6608755a6ff45fce78169ace",
	name: "adminReviewTask",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminReviewTask.__executeServer(opts));
var adminReviewTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	completionId: number(),
	approve: boolean(),
	note: string().max(300).optional()
})).handler(adminReviewTask_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const c = (await sql`select id, user_id, task_id, status from task_completions where id = ${data.completionId}`)[0];
	if (!c || c.status !== "pending") throw new AppError("This submission is not pending.");
	const t = (await sql`
      select title, reward_points, campaign_id from tasks where id = ${c.task_id}
    `)[0];
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
		await creditPoints(sql, c.user_id, Number(t.reward_points), "task_reward", t.title, "task", String(c.task_id));
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
		await notify(sql, c.user_id, "task_rejected", "Task not approved", data.note?.trim() || `${t.title} was not approved. No points were added.`);
		await audit(sql, context.userId, "task.reject", "completion", String(c.id), data.note ?? "");
	}
	return { ok: true };
});
var adminListWithdrawals_createServerFn_handler = createServerRpc({
	id: "fee93a18c80b6fe115e54566933f32a31154fc402f40e636a4f1e0e3861ba932",
	name: "adminListWithdrawals",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListWithdrawals.__executeServer(opts));
var adminListWithdrawals = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListWithdrawals_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select w.id, w.user_id, w.points, w.payment_method, w.account_details, w.status,
             w.admin_note, w.created_at, w.processed_at, p.display_name, r.title
      from withdrawals w
      join app_profiles p on p.user_id = w.user_id
      left join rewards r on r.id = w.reward_id
      order by
        case w.status when 'pending' then 0 when 'approved' then 1 when 'processing' then 2 else 3 end,
        w.created_at desc
      limit 80
    `).map((r) => ({
		id: Number(r.id),
		userId: String(r.user_id),
		displayName: String(r.display_name),
		points: Number(r.points),
		paymentMethod: String(r.payment_method),
		accountDetails: String(r.account_details),
		status: String(r.status),
		adminNote: r.admin_note ?? null,
		createdAt: toIso(r.created_at),
		processedAt: r.processed_at ? toIso(r.processed_at) : null,
		rewardTitle: r.title ?? null
	}));
});
var adminUpdateWithdrawal_createServerFn_handler = createServerRpc({
	id: "f2fb3b8efff737f1fe1dbd7beb86fd0fd19d2634015e462bf24f650d5c07ebfd",
	name: "adminUpdateWithdrawal",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminUpdateWithdrawal.__executeServer(opts));
var adminUpdateWithdrawal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	status: _enum([
		"approved",
		"processing",
		"paid",
		"rejected"
	]),
	note: string().max(300).optional()
})).handler(adminUpdateWithdrawal_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const w = (await sql`select id, user_id, points, status, reward_id from withdrawals where id = ${data.id}`)[0];
	if (!w) throw new AppError("Request not found.");
	if (!{
		pending: ["approved", "rejected"],
		approved: ["processing", "rejected"],
		processing: ["paid", "rejected"]
	}[w.status]?.includes(data.status)) throw new AppError(`Cannot move from ${w.status} to ${data.status}.`);
	await sql`
      update withdrawals
      set status = ${data.status}, admin_note = ${data.note ?? null},
          processed_at = now(), processed_by = ${context.userId}
      where id = ${w.id}
    `;
	if (data.status === "rejected") {
		await creditPoints(sql, w.user_id, Number(w.points), "reversal", data.note || "Redemption rejected — points returned", "withdrawal", String(w.id));
		if (w.reward_id) await sql`update rewards set stock = stock + 1 where id = ${w.reward_id} and stock is not null`;
		await notify(sql, w.user_id, "withdrawal_rejected", "Redemption declined", data.note || "Your redemption was declined and points were returned.");
	} else if (data.status === "paid") await notify(sql, w.user_id, "withdrawal_approved", "Redemption paid", "Your campaign reward was marked paid. Timing depends on the payment rail used.");
	else if (data.status === "approved") await notify(sql, w.user_id, "withdrawal_approved", "Redemption approved", "Your request was approved and is being processed. This is not an instant bank transfer.");
	await audit(sql, context.userId, "withdrawal." + data.status, "withdrawal", String(w.id), data.note ?? "");
	return { ok: true };
});
var adminListTransactions_createServerFn_handler = createServerRpc({
	id: "32b8e293687b2693285492d0bf075c4c52045280a4bb11e88e2ab3ee05d08dfb",
	name: "adminListTransactions",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListTransactions.__executeServer(opts));
var adminListTransactions = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListTransactions_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select t.id, t.user_id, t.type, t.amount, t.balance_after, t.note, t.created_at, p.display_name
      from points_transactions t
      join app_profiles p on p.user_id = t.user_id
      order by t.created_at desc
      limit 100
    `).map((r) => ({
		id: Number(r.id),
		userId: String(r.user_id),
		displayName: String(r.display_name),
		type: String(r.type),
		amount: Number(r.amount),
		balanceAfter: Number(r.balance_after),
		note: r.note ?? null,
		createdAt: toIso(r.created_at)
	}));
});
var adminListRewards_createServerFn_handler = createServerRpc({
	id: "2320d7ad6dd8d66273ad68314a43b77283b95f3910a855e8fcfea6664e46e482",
	name: "adminListRewards",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListRewards.__executeServer(opts));
var adminListRewards = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListRewards_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`select * from rewards order by points_cost asc`).map((r) => ({
		id: Number(r.id),
		title: String(r.title),
		description: String(r.description),
		pointsCost: Number(r.points_cost),
		paymentMethod: String(r.payment_method),
		stock: r.stock == null ? null : Number(r.stock),
		status: String(r.status),
		isDemo: Boolean(r.is_demo)
	}));
});
var adminSaveReward_createServerFn_handler = createServerRpc({
	id: "7b59fffaf5cd1b59152502510d14e0c7c227de3b4912b5c7b5bb1b5fc56b3da7",
	name: "adminSaveReward",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSaveReward.__executeServer(opts));
var adminSaveReward = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	title: string().min(3).max(120),
	description: string().max(500),
	pointsCost: number().int().min(1),
	paymentMethod: _enum([
		"easypaisa",
		"jazzcash",
		"bank",
		"voucher"
	]),
	stock: number().int().min(0).optional().nullable(),
	status: _enum(["active", "paused"])
})).handler(adminSaveReward_createServerFn_handler, async ({ context, data }) => {
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
	const ins = await sql`
      insert into rewards (title, description, points_cost, payment_method, stock, status)
      values (${data.title}, ${data.description}, ${data.pointsCost}, ${data.paymentMethod}, ${data.stock ?? null}, ${data.status})
      returning id
    `;
	await audit(sql, context.userId, "reward.create", "reward", String(ins[0].id), data.title);
	return { id: ins[0].id };
});
var adminListSponsors_createServerFn_handler = createServerRpc({
	id: "4182a06ebd5172c211e1afa76c8dd0d56dfac277d4d4212260774f33f9994f5e",
	name: "adminListSponsors",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListSponsors.__executeServer(opts));
var adminListSponsors = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListSponsors_createServerFn_handler, async ({ context }) => {
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
			contactEmail: s.contact_email ?? null,
			status: String(s.status),
			notes: s.notes ?? null,
			isDemo: Boolean(s.is_demo)
		})),
		campaigns: campaigns.map((c) => ({
			id: Number(c.id),
			sponsorId: c.sponsor_id == null ? null : Number(c.sponsor_id),
			sponsorName: c.sponsor_name ?? null,
			title: String(c.title),
			taskType: String(c.task_type),
			targetUrl: c.target_url ?? null,
			rewardPerCompletion: Number(c.reward_per_completion),
			maxUsers: c.max_users == null ? null : Number(c.max_users),
			budgetPkr: String(c.budget_pkr),
			spentPkr: String(c.spent_pkr),
			remainingPkr: String(Number(c.budget_pkr) - Number(c.spent_pkr)),
			costPerCompletionPkr: String(c.cost_per_completion_pkr),
			completions: Number(c.completions),
			status: String(c.status),
			isDemo: Boolean(c.is_demo)
		}))
	};
});
var adminSaveSponsor_createServerFn_handler = createServerRpc({
	id: "4e542085ebf6a4e2d402e1377fc77b995a1c813137b1c1cb2639cf00a787755e",
	name: "adminSaveSponsor",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSaveSponsor.__executeServer(opts));
var adminSaveSponsor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().min(2).max(80),
	contactEmail: string().email().optional().nullable(),
	notes: string().max(400).optional().nullable()
})).handler(adminSaveSponsor_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const ins = await sql`
      insert into sponsors (name, contact_email, notes, status)
      values (${data.name}, ${data.contactEmail ?? null}, ${data.notes ?? null}, 'active')
      returning id
    `;
	await audit(sql, context.userId, "sponsor.create", "sponsor", String(ins[0].id), data.name);
	return { id: ins[0].id };
});
var adminSaveCampaign_createServerFn_handler = createServerRpc({
	id: "2792d72265e9216dd9cca472966444d9f9c87cb145cec1abd7ea85cc6a0ae6f3",
	name: "adminSaveCampaign",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSaveCampaign.__executeServer(opts));
var adminSaveCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number().optional(),
	sponsorId: number(),
	title: string().min(3).max(120),
	taskType: string().min(3).max(40),
	targetUrl: string().max(500).optional().nullable(),
	rewardPerCompletion: number().int().min(1),
	maxUsers: number().int().min(1).optional().nullable(),
	budgetPkr: number().min(0),
	costPerCompletionPkr: number().min(0),
	status: _enum([
		"pending",
		"approved",
		"active",
		"paused",
		"completed",
		"rejected"
	])
})).handler(adminSaveCampaign_createServerFn_handler, async ({ context, data }) => {
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
	const ins = await sql`
      insert into campaigns (
        sponsor_id, title, task_type, target_url, reward_per_completion, max_users,
        budget_pkr, cost_per_completion_pkr, status
      ) values (
        ${data.sponsorId}, ${data.title}, ${data.taskType}, ${data.targetUrl ?? null},
        ${data.rewardPerCompletion}, ${data.maxUsers ?? null}, ${String(data.budgetPkr)},
        ${String(data.costPerCompletionPkr)}, ${data.status}
      ) returning id
    `;
	await audit(sql, context.userId, "campaign.create", "campaign", String(ins[0].id), data.title);
	return { id: ins[0].id };
});
var adminListReferrals_createServerFn_handler = createServerRpc({
	id: "66891d98ca6760809fed5569b7899d6c85091260a86841b7b4a0bd5ca1f2fbf6",
	name: "adminListReferrals",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListReferrals.__executeServer(opts));
var adminListReferrals = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListReferrals_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select r.id, r.status, r.created_at, r.rewarded_at,
             a.display_name as referrer, b.display_name as referred
      from referrals r
      join app_profiles a on a.user_id = r.referrer_user_id
      join app_profiles b on b.user_id = r.referred_user_id
      order by r.created_at desc
      limit 100
    `).map((r) => ({
		id: Number(r.id),
		status: String(r.status),
		createdAt: toIso(r.created_at),
		rewardedAt: r.rewarded_at ? toIso(r.rewarded_at) : null,
		referrer: String(r.referrer),
		referred: String(r.referred)
	}));
});
var adminGetSettings_createServerFn_handler = createServerRpc({
	id: "f592c40eb3b5903e3565218d4ba70fb6ebbb64d3eafbed312f5db4612598e2e3",
	name: "adminGetSettings",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminGetSettings.__executeServer(opts));
var adminGetSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminGetSettings_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	const rows = await (await getSql())`select key, value from settings order by key`;
	return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});
var adminSaveSettings_createServerFn_handler = createServerRpc({
	id: "a758abc216869a6505f16d87112a2ec9fb46277a1d08abc3bf7eb09c7edbfd7c",
	name: "adminSaveSettings",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminSaveSettings.__executeServer(opts));
var adminSaveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ entries: record(string(), string()) })).handler(adminSaveSettings_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const allowed = /* @__PURE__ */ new Set([
		"daily_schedule",
		"referral_reward",
		"referral_qualify_tasks",
		"max_referral_rewards",
		"min_withdrawal_points",
		"daily_withdrawal_limit_points",
		"monthly_withdrawal_limit_points",
		"bot_username",
		"support_email",
		"platform_name"
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
var adminListAudit_createServerFn_handler = createServerRpc({
	id: "0f9865603efa38ff608af5736f0df164553f1704555c5922102a1774e31f0856",
	name: "adminListAudit",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListAudit.__executeServer(opts));
var adminListAudit = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListAudit_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select a.id, a.actor_user_id, a.action, a.entity_type, a.entity_id, a.detail, a.created_at,
             p.display_name
      from audit_logs a
      left join app_profiles p on p.user_id = a.actor_user_id
      order by a.created_at desc
      limit 120
    `).map((r) => ({
		id: Number(r.id),
		actor: r.display_name ?? r.actor_user_id,
		action: String(r.action),
		entityType: r.entity_type ?? null,
		entityId: r.entity_id ?? null,
		detail: r.detail ?? null,
		createdAt: toIso(r.created_at)
	}));
});
var adminListTickets_createServerFn_handler = createServerRpc({
	id: "9a095f886c7b08111e01dd501d82b8970fcee014ff59d4127bb47abdca4f5838",
	name: "adminListTickets",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminListTickets.__executeServer(opts));
var adminListTickets = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminListTickets_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	return (await (await getSql())`
      select t.id, t.category, t.subject, t.status, t.created_at, t.updated_at, p.display_name
      from support_tickets t
      join app_profiles p on p.user_id = t.user_id
      order by t.updated_at desc
      limit 80
    `).map((r) => ({
		id: Number(r.id),
		category: String(r.category),
		subject: String(r.subject),
		status: String(r.status),
		createdAt: toIso(r.created_at),
		updatedAt: toIso(r.updated_at),
		displayName: String(r.display_name)
	}));
});
var adminReplyTicket_createServerFn_handler = createServerRpc({
	id: "b46367d48ddffa841315650bb98e1bad3475fcb860681ee1c6ee2101ea41c869",
	name: "adminReplyTicket",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminReplyTicket.__executeServer(opts));
var adminReplyTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	body: string().min(2).max(2e3),
	status: _enum([
		"open",
		"pending",
		"closed"
	]).optional()
})).handler(adminReplyTicket_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const t = await sql`select user_id from support_tickets where id = ${data.id}`;
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
var adminGetReports_createServerFn_handler = createServerRpc({
	id: "b461b9710ff58dc840b7edca3bfa2afad81af4113bb195157fe04a1b954e7893",
	name: "adminGetReports",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminGetReports.__executeServer(opts));
var adminGetReports = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminGetReports_createServerFn_handler, async ({ context }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	const byType = await sql`
      select type, count(*)::int as n, coalesce(sum(amount),0)::int as pts
      from points_transactions
      group by type
      order by pts desc
    `;
	const revenue = await sql`
      select source, coalesce(sum(gross_pkr),0)::text as gross, coalesce(sum(platform_pkr),0)::text as platform
      from revenue_records
      group by source
    `;
	return {
		pointsByType: byType.map((r) => ({
			type: r.type,
			count: Number(r.n),
			points: Number(r.pts)
		})),
		revenueBySource: revenue.map((r) => ({
			source: r.source,
			gross: r.gross,
			platform: r.platform
		}))
	};
});
var adminPurgeDemo_createServerFn_handler = createServerRpc({
	id: "183f2b40d77d9cf5b2634db1927a97c2684db67f7b4f1c4bfa158e56d8178603",
	name: "adminPurgeDemo",
	filename: "src/lib/server/admin.functions.ts"
}, (opts) => adminPurgeDemo.__executeServer(opts));
var adminPurgeDemo = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(adminPurgeDemo_createServerFn_handler, async ({ context }) => {
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
//#endregion
export { adminAdjustPoints_createServerFn_handler, adminGetReports_createServerFn_handler, adminGetSettings_createServerFn_handler, adminListAudit_createServerFn_handler, adminListReferrals_createServerFn_handler, adminListRewards_createServerFn_handler, adminListSponsors_createServerFn_handler, adminListTasks_createServerFn_handler, adminListTickets_createServerFn_handler, adminListTransactions_createServerFn_handler, adminListUsers_createServerFn_handler, adminListVerifications_createServerFn_handler, adminListWithdrawals_createServerFn_handler, adminPurgeDemo_createServerFn_handler, adminReplyTicket_createServerFn_handler, adminReviewTask_createServerFn_handler, adminSaveCampaign_createServerFn_handler, adminSaveReward_createServerFn_handler, adminSaveSettings_createServerFn_handler, adminSaveSponsor_createServerFn_handler, adminSaveTask_createServerFn_handler, adminSetAdminFlag_createServerFn_handler, adminSetUserStatus_createServerFn_handler, adminUpdateWithdrawal_createServerFn_handler, getAdminOverview_createServerFn_handler };
