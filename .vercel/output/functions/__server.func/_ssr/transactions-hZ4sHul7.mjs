import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { S as timeAgo, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { d as adminListTransactions, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as TX_LABELS } from "./types-nKkEYO28.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-hZ4sHul7.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const q = useQuery({
		queryKey: ["admin-tx"],
		queryFn: () => adminListTransactions()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Ledger",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-xs text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2",
						children: "Member"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Amount" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "When" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (q.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: r.displayName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: TX_LABELS[r.type] ?? r.type }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: `tabular ${r.amount >= 0 ? "text-success" : "text-danger"}`,
						children: [r.amount >= 0 ? "+" : "", formatPoints(r.amount)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "text-subtle",
						children: timeAgo(r.createdAt)
					})
				]
			}, r.id)) })]
		})
	});
}
//#endregion
export { Page as component };
