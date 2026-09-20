import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatPkr, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { E as getAdminOverview, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-C8bPXcGq.js
var import_jsx_runtime = require_jsx_runtime();
function AdminHome() {
	const d = useQuery({
		queryKey: ["admin-overview"],
		queryFn: () => getAdminOverview()
	}).data;
	const items = [
		["Users", d ? formatPoints(d.totalUsers) : "—"],
		["Active (7d)", d ? formatPoints(d.activeUsers) : "—"],
		["New today", d ? formatPoints(d.newToday) : "—"],
		["Tasks completed", d ? formatPoints(d.tasksCompleted) : "—"],
		["Points issued", d ? formatPoints(d.pointsIssued) : "—"],
		["Points redeemed", d ? formatPoints(d.pointsRedeemed) : "—"],
		["Pending withdrawals", d ? formatPoints(d.pendingWithdrawals) : "—"],
		["Pending reviews", d ? formatPoints(d.pendingVerifications) : "—"],
		["Gross revenue", d ? formatPkr(d.grossRevenue) : "—"],
		["User reward cost", d ? formatPkr(d.userRewardsPkr) : "—"],
		["Platform revenue", d ? formatPkr(d.platformRevenue) : "—"],
		["Active campaigns", d ? formatPoints(d.activeCampaigns) : "—"]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Dashboard",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-sm text-muted",
			children: "Revenue figures come from recorded campaign spend only. Empty means no sponsor money has been booked yet — nothing is invented."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3 md:grid-cols-3",
			children: items.map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: k
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-lg font-semibold tabular",
				children: v
			})] }, k))
		})]
	});
}
//#endregion
export { AdminHome as component };
