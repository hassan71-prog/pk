import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { c as getDashboard, g as listTasks, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { n as useCaptureReferral, t as identityPayload } from "./identity-BXMk-IIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-C59emUN0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"all",
	"telegram",
	"website",
	"social",
	"sponsored",
	"affiliate",
	"daily"
];
function TasksPage() {
	useCaptureReferral();
	const { user, isPending } = useCurrentUserState();
	const [filter, setFilter] = (0, import_react.useState)("all");
	const dash = useQuery({
		queryKey: ["dashboard"],
		enabled: !!user,
		queryFn: () => getDashboard({ data: identityPayload(user) })
	});
	const tasks = useQuery({
		queryKey: ["tasks"],
		enabled: !!user,
		queryFn: () => listTasks({ data: identityPayload(user) })
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Tasks",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const list = (tasks.data ?? []).filter((t) => filter === "all" ? true : t.category === filter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Tasks",
		points: dash.data?.profile.pointsBalance,
		unread: dash.data?.unread,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Points are only added after server-side verification. Starting a task does not credit a reward."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-2 overflow-x-auto pb-1",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(f),
					className: `rounded-full px-3 py-1.5 text-xs capitalize ${filter === f ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`,
					children: f
				}, f))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2",
				children: tasks.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "text-sm text-muted",
					children: "No tasks in this category."
				}) : list.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tasks/$taskId",
					params: { taskId: String(t.id) },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: t.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted line-clamp-2",
								children: t.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t.category }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: stateTone(t.userState),
										children: t.userState
									}),
									t.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Sample" }) : null
								]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-semibold text-primary tabular",
							children: ["+", formatPoints(t.rewardPoints)]
						})]
					}) })
				}, t.id))
			})
		]
	});
}
function stateTone(s) {
	if (s === "completed") return "success";
	if (s === "pending") return "warning";
	if (s === "rejected" || s === "expired") return "danger";
	if (s === "started") return "primary";
	return "muted";
}
//#endregion
export { TasksPage as component };
