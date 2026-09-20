import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatPkr, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { r as adminGetReports, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as TX_LABELS } from "./types-nKkEYO28.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-DC4KxSTD.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const q = useQuery({
		queryKey: ["admin-reports"],
		queryFn: () => adminGetReports()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Reports",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "Points by type"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (q.data?.pointsByType ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: TX_LABELS[r.type] ?? r.type }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular",
						children: [
							formatPoints(r.points),
							" · ",
							r.count,
							" tx"
						]
					})]
				}, r.type))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Revenue by source"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: "Empty until campaigns record spend."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (q.data?.revenueBySource ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No revenue records yet."
				}) : q.data.revenueBySource.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.source }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						formatPkr(r.gross),
						" gross · ",
						formatPkr(r.platform),
						" platform"
					] })]
				}, r.source))
			})
		]
	});
}
//#endregion
export { Page as component };
