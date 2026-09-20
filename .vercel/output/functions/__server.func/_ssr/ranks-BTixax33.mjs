import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { h as initials, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { c as getDashboard, l as getLeaderboard, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ranks-BTixax33.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PERIODS = [
	{
		id: "daily",
		label: "Daily"
	},
	{
		id: "weekly",
		label: "Weekly"
	},
	{
		id: "monthly",
		label: "Monthly"
	},
	{
		id: "all",
		label: "All-time"
	}
];
function RanksPage() {
	const { user, isPending } = useCurrentUserState();
	const [period, setPeriod] = (0, import_react.useState)("all");
	const dash = useQuery({
		queryKey: ["dashboard"],
		enabled: !!user,
		queryFn: () => getDashboard({ data: {} })
	});
	const board = useQuery({
		queryKey: ["leaderboard", period],
		enabled: !!user,
		queryFn: () => getLeaderboard({ data: { period } })
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Ranks",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Ranks",
		points: dash.data?.profile.pointsBalance,
		unread: dash.data?.unread,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Ranked by points earned in the selected window. Sample rows are labelled and are not real accounts."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-4 gap-1 rounded-lg bg-surface p-1",
				children: PERIODS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setPeriod(p.id),
					className: `rounded-md py-2 text-xs font-medium ${period === p.id ? "bg-primary text-primary-fg" : "text-muted"}`,
					children: p.label
				}, p.id))
			}),
			board.data?.you ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 flex items-center justify-between border-primary/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Your rank"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg font-semibold tabular",
					children: ["#", board.data.you.rank]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium tabular",
					children: [formatPoints(board.data.you.points), " pts"]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2",
				children: board.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }) : (board.data?.entries ?? []).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `flex items-center gap-3 rounded-xl border px-3 py-2.5 ${e.isYou ? "border-primary/50 bg-primary/10" : "border-border bg-surface"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 text-xs tabular text-muted",
							children: e.rank
						}),
						e.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: e.avatarUrl,
							alt: "",
							className: "size-8 rounded-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-medium",
							children: initials(e.displayName)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: e.isYou ? "You" : e.displayName
							}), e.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "mt-0.5",
								children: "Sample"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold tabular",
							children: formatPoints(e.points)
						})
					]
				}, e.userId))
			})
		]
	});
}
//#endregion
export { RanksPage as component };
