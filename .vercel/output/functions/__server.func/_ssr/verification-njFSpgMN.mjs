import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { S as timeAgo, c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { _ as adminReviewTask, p as adminListVerifications, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verification-njFSpgMN.js
var import_jsx_runtime = require_jsx_runtime();
function VerificationPage() {
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["admin-verify"],
		queryFn: () => adminListVerifications()
	});
	const review = useMutation({
		mutationFn: (p) => adminReviewTask({ data: p }),
		onSuccess: () => {
			toast.success("Review saved");
			qc.invalidateQueries({ queryKey: ["admin-verify"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, {
		title: "Task verification",
		children: (list.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "No pending submissions."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: (list.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: c.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						c.displayName,
						" · +",
						c.rewardPoints,
						" · ",
						c.submittedAt ? timeAgo(c.submittedAt) : ""
					]
				}),
				c.proofNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: c.proofNote
				}) : null,
				c.proofUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: c.proofUrl,
					className: "mt-1 block text-xs text-primary break-all",
					target: "_blank",
					rel: "noreferrer",
					children: c.proofUrl
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => review.mutate({
							completionId: c.id,
							approve: true
						}),
						children: "Approve"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "danger",
						onClick: () => review.mutate({
							completionId: c.id,
							approve: false
						}),
						children: "Reject"
					})]
				})
			] }, c.id))
		})
	});
}
//#endregion
export { VerificationPage as component };
