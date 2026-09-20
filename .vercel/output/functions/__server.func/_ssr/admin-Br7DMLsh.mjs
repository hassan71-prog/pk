import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { h as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { t as RedirectToSignIn, u as getMeAdminFlag } from "./user.functions-D7T_URGM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Br7DMLsh.js
var import_jsx_runtime = require_jsx_runtime();
function AdminGate() {
	const { user, isPending } = useCurrentUserState();
	const admin = useQuery({
		queryKey: ["me-admin"],
		enabled: !!user,
		queryFn: () => getMeAdminFlag()
	});
	if (isPending || user && admin.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!admin.data?.isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-6 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-lg font-semibold",
			children: "Admin only"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "This workspace is limited to operators."
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
//#endregion
export { AdminGate as component };
