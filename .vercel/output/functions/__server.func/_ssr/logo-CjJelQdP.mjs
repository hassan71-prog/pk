import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as cn } from "./helpers-NOxQJUtC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/logo-CjJelQdP.js
var import_jsx_runtime = require_jsx_runtime();
function Logo({ className, markOnly = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-8 place-items-center rounded-md bg-primary text-primary-fg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				className: "size-4",
				fill: "none",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M5 12.5 10 17l9-11",
					stroke: "currentColor",
					strokeWidth: "2.4",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			})
		}), !markOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-display text-[15px] font-semibold tracking-tight",
			children: ["TaskEarn ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-primary",
				children: "PK"
			})]
		}) : null]
	});
}
//#endregion
export { Logo as t };
