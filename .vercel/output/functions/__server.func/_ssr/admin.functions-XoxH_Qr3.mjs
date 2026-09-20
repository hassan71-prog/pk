import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { I as object, O as _enum, R as record, j as boolean, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { i as cn } from "./helpers-NOxQJUtC.mjs";
import { n as number } from "../_libs/zod.mjs";
import { t as authMiddleware } from "./middleware-Lb1eCpaC.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as Logo } from "./logo-CjJelQdP.mjs";
import { S as ArrowLeftRight, _ as ClipboardCheck, c as Settings, d as ListTodo, f as LayoutDashboard, h as Flag, l as ScrollText, m as Gift, n as Users, o as Ticket, s as Shield, t as Wallet, u as Megaphone, y as ChartColumn } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-XoxH_Qr3.js
var import_jsx_runtime = require_jsx_runtime();
var LINKS = [
	{
		to: "/admin",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/admin/users",
		label: "Users",
		icon: Users
	},
	{
		to: "/admin/tasks",
		label: "Tasks",
		icon: ListTodo
	},
	{
		to: "/admin/verification",
		label: "Verification",
		icon: ClipboardCheck
	},
	{
		to: "/admin/referrals",
		label: "Referrals",
		icon: Flag
	},
	{
		to: "/admin/transactions",
		label: "Ledger",
		icon: ArrowLeftRight
	},
	{
		to: "/admin/rewards",
		label: "Rewards",
		icon: Gift
	},
	{
		to: "/admin/withdrawals",
		label: "Withdrawals",
		icon: Wallet
	},
	{
		to: "/admin/sponsors",
		label: "Sponsors",
		icon: Megaphone
	},
	{
		to: "/admin/reports",
		label: "Reports",
		icon: ChartColumn
	},
	{
		to: "/admin/settings",
		label: "Settings",
		icon: Settings
	},
	{
		to: "/admin/admins",
		label: "Admins",
		icon: Shield
	},
	{
		to: "/admin/audit",
		label: "Audit",
		icon: ScrollText
	},
	{
		to: "/admin/tickets",
		label: "Tickets",
		icon: Ticket
	}
];
function AdminShell({ children, title }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-r border-border p-4 md:block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] tracking-wide text-subtle uppercase",
						children: "Admin"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-4 space-y-0.5",
						children: LINKS.map((l) => {
							const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
							const Icon = l.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: l.to,
								className: cn("flex items-center gap-2 rounded-md px-2 py-2 text-sm", active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), l.label]
							}, l.to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "mt-6 block text-xs text-primary",
						children: "Back to app"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-10 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-semibold tracking-tight",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden",
						children: LINKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: l.to,
							className: cn("rounded-full px-3 py-1 text-xs whitespace-nowrap", pathname === l.to ? "bg-primary text-primary-fg" : "bg-surface text-muted"),
							children: l.label
						}, l.to))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-5 md:px-6",
					children
				})]
			})]
		})
	});
}
var getAdminOverview = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("2af597c86c8037f64e32d34097e156121b62bcd269668c6dc6eb673d6abafac8"));
var adminListUsers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ q: string().optional() }).optional()).handler(createSsrRpc("05cc20f9cc28ddd383a4d42e7e891fdcdac7a7381d5681f390e25372bd31dc10"));
var adminSetUserStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	status: _enum([
		"active",
		"suspended",
		"banned"
	])
})).handler(createSsrRpc("d3d3101600441e7ed130ddc0ad30f62207b990752b4eb545a66fa8994e5add63"));
var adminAdjustPoints = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	amount: number().int(),
	reason: string().min(4).max(200)
})).handler(createSsrRpc("3ffecc9e0956cc4ca99d090fe3640487c7d64914e8c3d3eb03d817dd1920618f"));
var adminSetAdminFlag = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	userId: string(),
	isAdmin: boolean()
})).handler(createSsrRpc("d40419c953dfd1fa283d1f83cc9aa82c3cf09f917cfaf5dfab239cbabc2feeea"));
var adminListTasks = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("fec556a7fb8e764beecc7e6081c9ac0e84d2fa213a07568861eed4821a7602f4"));
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
var adminSaveTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(taskInput).handler(createSsrRpc("1eef165d662922e245ed298192a11c60f3b1a1e40cee6fec80aa98a00e0ab769"));
var adminListVerifications = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9ca5318ef743b3aca172be7f3389574373379cf428c96cf5308aaf23d143360e"));
var adminReviewTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	completionId: number(),
	approve: boolean(),
	note: string().max(300).optional()
})).handler(createSsrRpc("ad05fd3329f98ce48e28f7c6e8abbb0e6a677b0f6608755a6ff45fce78169ace"));
var adminListWithdrawals = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("fee93a18c80b6fe115e54566933f32a31154fc402f40e636a4f1e0e3861ba932"));
var adminUpdateWithdrawal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	status: _enum([
		"approved",
		"processing",
		"paid",
		"rejected"
	]),
	note: string().max(300).optional()
})).handler(createSsrRpc("f2fb3b8efff737f1fe1dbd7beb86fd0fd19d2634015e462bf24f650d5c07ebfd"));
var adminListTransactions = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("32b8e293687b2693285492d0bf075c4c52045280a4bb11e88e2ab3ee05d08dfb"));
var adminListRewards = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("2320d7ad6dd8d66273ad68314a43b77283b95f3910a855e8fcfea6664e46e482"));
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
})).handler(createSsrRpc("7b59fffaf5cd1b59152502510d14e0c7c227de3b4912b5c7b5bb1b5fc56b3da7"));
var adminListSponsors = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("4182a06ebd5172c211e1afa76c8dd0d56dfac277d4d4212260774f33f9994f5e"));
var adminSaveSponsor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	name: string().min(2).max(80),
	contactEmail: string().email().optional().nullable(),
	notes: string().max(400).optional().nullable()
})).handler(createSsrRpc("4e542085ebf6a4e2d402e1377fc77b995a1c813137b1c1cb2639cf00a787755e"));
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
})).handler(createSsrRpc("2792d72265e9216dd9cca472966444d9f9c87cb145cec1abd7ea85cc6a0ae6f3"));
var adminListReferrals = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("66891d98ca6760809fed5569b7899d6c85091260a86841b7b4a0bd5ca1f2fbf6"));
var adminGetSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("f592c40eb3b5903e3565218d4ba70fb6ebbb64d3eafbed312f5db4612598e2e3"));
var adminSaveSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ entries: record(string(), string()) })).handler(createSsrRpc("a758abc216869a6505f16d87112a2ec9fb46277a1d08abc3bf7eb09c7edbfd7c"));
var adminListAudit = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("0f9865603efa38ff608af5736f0df164553f1704555c5922102a1774e31f0856"));
var adminListTickets = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9a095f886c7b08111e01dd501d82b8970fcee014ff59d4127bb47abdca4f5838"));
var adminReplyTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	body: string().min(2).max(2e3),
	status: _enum([
		"open",
		"pending",
		"closed"
	]).optional()
})).handler(createSsrRpc("b46367d48ddffa841315650bb98e1bad3475fcb860681ee1c6ee2101ea41c869"));
var adminGetReports = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("b461b9710ff58dc840b7edca3bfa2afad81af4113bb195157fe04a1b954e7893"));
var adminPurgeDemo = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("183f2b40d77d9cf5b2634db1927a97c2684db67f7b4f1c4bfa158e56d8178603"));
//#endregion
export { adminSetAdminFlag as C, getAdminOverview as E, adminSaveTask as S, adminUpdateWithdrawal as T, adminReviewTask as _, adminListAudit as a, adminSaveSettings as b, adminListSponsors as c, adminListTransactions as d, adminListUsers as f, adminReplyTicket as g, adminPurgeDemo as h, adminGetSettings as i, adminListTasks as l, adminListWithdrawals as m, adminAdjustPoints as n, adminListReferrals as o, adminListVerifications as p, adminGetReports as r, adminListRewards as s, AdminShell as t, adminListTickets as u, adminSaveCampaign as v, adminSetUserStatus as w, adminSaveSponsor as x, adminSaveReward as y };
