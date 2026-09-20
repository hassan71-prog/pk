import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { C as adminSetAdminFlag, f as adminListUsers, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admins-B3ffb3Bq.js
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const users = useQuery({
		queryKey: ["admin-users", ""],
		queryFn: () => adminListUsers({ data: { q: "" } })
	});
	const set = useMutation({
		mutationFn: (p) => adminSetAdminFlag({ data: p }),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Admins",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted",
			children: "The first real account is granted admin automatically."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: (users.data ?? []).filter((u) => !u.isDemo).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: u.displayName
				}), u.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "primary",
					children: "admin"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "member" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => set.mutate({
						userId: u.userId,
						isAdmin: !u.isAdmin
					}),
					children: u.isAdmin ? "Revoke" : "Make admin"
				})]
			}, u.userId))
		})]
	});
}
//#endregion
export { Page as component };
