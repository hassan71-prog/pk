import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { S as timeAgo } from "./helpers-NOxQJUtC.mjs";
import { h as listNotifications, t as RedirectToSignIn, v as markNotificationsRead } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-DUytT4Il.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["notifications"],
		enabled: !!user,
		queryFn: () => listNotifications()
	});
	const mark = useMutation({
		mutationFn: () => markNotificationsRead(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notifications"] });
			qc.invalidateQueries({ queryKey: ["dashboard"] });
		}
	});
	(0, import_react.useEffect)(() => {
		if (user && list.data?.some((n) => !n.readAt)) mark.mutate();
	}, [user, list.data]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Inbox",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Inbox",
		children: [(list.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "No notifications yet."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: (list.data ?? []).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: n.readAt ? "opacity-80" : "",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: n.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted",
						children: n.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-subtle",
						children: timeAgo(n.createdAt)
					})
				]
			}, n.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			variant: "ghost",
			onClick: () => mark.mutate(),
			children: "Mark all read"
		})]
	});
}
//#endregion
export { NotificationsPage as component };
