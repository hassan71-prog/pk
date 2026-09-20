import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { S as timeAgo, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { c as getDashboard, d as getReferralInfo, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Disclaimer, t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { t as identityPayload } from "./identity-BXMk-IIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/friends-MWLwWNdp.js
var import_jsx_runtime = require_jsx_runtime();
function FriendsPage() {
	const { user, isPending } = useCurrentUserState();
	const dash = useQuery({
		queryKey: ["dashboard"],
		enabled: !!user,
		queryFn: () => getDashboard({ data: identityPayload(user) })
	});
	const info = useQuery({
		queryKey: ["referrals"],
		enabled: !!user,
		queryFn: () => getReferralInfo({ data: identityPayload(user) })
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Friends",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const d = info.data;
	const webLink = typeof window !== "undefined" && d ? `${window.location.origin}/?ref=${d.code}` : d?.telegramLink;
	async function copy() {
		if (!webLink) return;
		await navigator.clipboard.writeText(webLink);
		toast.success("Referral link copied");
	}
	async function share() {
		if (!webLink) return;
		if (navigator.share) await navigator.share({
			title: "TaskEarn PK",
			text: "Join me on TaskEarn PK",
			url: webLink
		});
		else await copy();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Friends",
		points: dash.data?.profile.pointsBalance,
		unread: dash.data?.unread,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Invite friends with your code. Rewards post only after they meet the qualification — currently",
					" ",
					d?.qualifyTasks ?? 1,
					" completed task",
					d?.qualifyTasks === 1 ? "" : "s",
					". Self-referrals are blocked."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Your referral code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-2xl font-semibold tracking-widest",
						children: d?.code ?? "••••••••"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 break-all text-xs text-subtle",
						children: webLink
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => void copy(),
							children: "Copy link"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => void share(),
							children: "Share"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-subtle",
						children: ["Telegram: ", d?.telegramLink]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold tabular",
							children: d?.total ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: "Qualified"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-lg font-semibold tabular",
							children: d?.active ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: "Earned"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-lg font-semibold tabular text-primary",
							children: ["+", formatPoints(d?.earned ?? 0)]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-subtle",
				children: [
					"Reward per qualified referral: ",
					d?.reward ?? 0,
					" points"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Recent referrals"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (d?.recent ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No referrals yet."
				}) : d.recent.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: timeAgo(r.createdAt)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: r.status === "rewarded" ? "success" : r.status === "rejected" ? "danger" : "warning",
						children: r.status
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disclaimer, { className: "mt-8" })
		]
	});
}
//#endregion
export { FriendsPage as component };
