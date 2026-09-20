import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { S as timeAgo, c as errorMessage, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { T as adminUpdateWithdrawal, m as adminListWithdrawals, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/withdrawals-OkuO_-B_.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["admin-wd"],
		queryFn: () => adminListWithdrawals()
	});
	const upd = useMutation({
		mutationFn: (p) => adminUpdateWithdrawal({ data: p }),
		onSuccess: () => {
			toast.success("Updated");
			qc.invalidateQueries({ queryKey: ["admin-wd"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Withdrawals",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: "Account details are visible here only. They never appear on public leaderboards."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: (list.data ?? []).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-medium",
					children: [
						w.displayName,
						" · ",
						formatPoints(w.points),
						" pts"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						w.paymentMethod,
						" · ",
						w.accountDetails,
						" · ",
						timeAgo(w.createdAt)
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: w.status })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					w.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => upd.mutate({
							id: w.id,
							status: "approved"
						}),
						children: "Approve"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "danger",
						onClick: () => upd.mutate({
							id: w.id,
							status: "rejected"
						}),
						children: "Reject"
					})] }) : null,
					w.status === "approved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => upd.mutate({
							id: w.id,
							status: "processing"
						}),
						children: "Mark processing"
					}) : null,
					w.status === "processing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => upd.mutate({
							id: w.id,
							status: "paid"
						}),
						children: "Mark paid"
					}) : null
				]
			})] }, w.id))
		})]
	});
}
//#endregion
export { Page as component };
