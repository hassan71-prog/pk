import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { S as timeAgo } from "./helpers-NOxQJUtC.mjs";
import { o as adminListReferrals, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/referrals-C0RVedhs.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const q = useQuery({
		queryKey: ["admin-refs"],
		queryFn: () => adminListReferrals()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Referrals",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full text-left text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "text-xs text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "py-2",
						children: "Referrer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Referred" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "When" })
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: (q.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2",
						children: r.referrer
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: r.referred }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: r.status }) }),
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
