import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as cn } from "./helpers-NOxQJUtC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Cx3brCck.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide", {
			muted: "bg-surface-2 text-muted",
			primary: "bg-primary/15 text-primary",
			success: "bg-success/15 text-success",
			warning: "bg-warning/15 text-warning",
			danger: "bg-danger/15 text-danger"
		}[tone], className),
		...props
	});
}
//#endregion
export { Badge as t };
