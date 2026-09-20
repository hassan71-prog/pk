import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { S as timeAgo } from "./helpers-NOxQJUtC.mjs";
import { a as adminListAudit, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-BrZdAc9P.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const q = useQuery({
		queryKey: ["admin-audit"],
		queryFn: () => adminListAudit()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Audit log",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2 text-sm",
			children: (q.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-border bg-surface px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: r.action
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							r.actor,
							" · ",
							r.entityType,
							" ",
							r.entityId,
							" · ",
							timeAgo(r.createdAt)
						]
					}),
					r.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: r.detail
					}) : null
				]
			}, r.id))
		})
	});
}
//#endregion
export { Page as component };
