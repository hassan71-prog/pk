import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as cn, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { t as Logo } from "./logo-CjJelQdP.mjs";
import { b as Bell, g as ClipboardList, i as Trophy, n as Users, p as House, r as User } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-CfMoYIQm.js
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Home",
		icon: House
	},
	{
		to: "/tasks",
		label: "Tasks",
		icon: ClipboardList
	},
	{
		to: "/friends",
		label: "Friends",
		icon: Users
	},
	{
		to: "/ranks",
		label: "Ranks",
		icon: Trophy
	},
	{
		to: "/profile",
		label: "Profile",
		icon: User
	}
];
function AppShell({ children, points, unread = 0, title }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "app-bg mx-auto flex min-h-dvh w-full max-w-lg flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm",
				children: [title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-base font-semibold tracking-tight",
					children: title
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [typeof points === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/wallet",
						className: "rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular text-primary",
							children: formatPoints(points)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 text-muted",
							children: "pts"
						})]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/notifications",
						className: "relative grid size-10 place-items-center rounded-full border border-border bg-surface",
						"aria-label": "Notifications",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" }) : null]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 px-4 pt-4 pb-28",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-5",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-primary" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								strokeWidth: active ? 2.3 : 1.8
							}), item.label]
						}) }, item.to);
					})
				})
			})
		]
	});
}
function Disclaimer({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-xs leading-relaxed text-subtle", className),
		children: "Points are platform rewards funded by sponsored tasks and campaigns. They are not cash, crypto, or an investment. Redemption depends on available rewards and campaign budgets."
	});
}
//#endregion
export { Disclaimer as n, AppShell as t };
