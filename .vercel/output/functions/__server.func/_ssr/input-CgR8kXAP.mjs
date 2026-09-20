import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as cn } from "./helpers-NOxQJUtC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CgR8kXAP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg placeholder:text-subtle outline-none focus:border-primary", className),
	...props
}));
Input.displayName = "Input";
//#endregion
export { Input as t };
