import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as errorMessage, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { f as adminListUsers, n as adminAdjustPoints, t as AdminShell, w as adminSetUserStatus } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-BXHWuiOJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UsersPage() {
	const qc = useQueryClient();
	const [q, setQ] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("100");
	const [reason, setReason] = (0, import_react.useState)("Manual adjustment");
	const users = useQuery({
		queryKey: ["admin-users", q],
		queryFn: () => adminListUsers({ data: { q } })
	});
	const status = useMutation({
		mutationFn: (p) => adminSetUserStatus({ data: p }),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
		onError: (e) => toast.error(errorMessage(e))
	});
	const adj = useMutation({
		mutationFn: (userId) => adminAdjustPoints({ data: {
			userId,
			amount: Number(amount),
			reason
		} }),
		onSuccess: () => {
			toast.success("Ledger updated");
			qc.invalidateQueries({ queryKey: ["admin-users"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Users",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search name, id, code",
				value: q,
				onChange: (e) => setQ(e.target.value),
				className: "max-w-sm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "w-28",
					value: amount,
					onChange: (e) => setAmount(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "max-w-xs",
					value: reason,
					onChange: (e) => setReason(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Member"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Points" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (users.data ?? []).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: u.displayName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle",
									children: u.isDemo ? "Sample" : u.referralCode
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular",
								children: formatPoints(u.points)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: u.status }), u.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "primary",
								className: "ml-1",
								children: "admin"
							}) : null] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "space-x-1 whitespace-nowrap",
								children: !u.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => adj.mutate(u.userId),
									children: "Adjust"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => status.mutate({
										userId: u.userId,
										status: u.status === "active" ? "suspended" : "active"
									}),
									children: u.status === "active" ? "Suspend" : "Activate"
								})] }) : null
							})
						]
					}, u.userId)) })]
				})
			})
		]
	});
}
//#endregion
export { UsersPage as component };
