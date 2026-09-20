import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { S as timeAgo, c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { g as adminReplyTicket, t as AdminShell, u as adminListTickets } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-DbXHY6fL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tickets-CYF5Oy39.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const [id, setId] = (0, import_react.useState)(null);
	const [body, setBody] = (0, import_react.useState)("");
	const list = useQuery({
		queryKey: ["admin-tickets"],
		queryFn: () => adminListTickets()
	});
	const reply = useMutation({
		mutationFn: () => adminReplyTicket({ data: {
			id,
			body,
			status: "pending"
		} }),
		onSuccess: () => {
			toast.success("Replied");
			setBody("");
			qc.invalidateQueries({ queryKey: ["admin-tickets"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Tickets",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: (list.data ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: id === t.id ? "border-primary" : "",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "w-full text-left",
					onClick: () => setId(t.id),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t.status })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							t.displayName,
							" · ",
							t.category,
							" · ",
							timeAgo(t.updatedAt)
						]
					})]
				})
			}, t.id))
		}), id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: body,
				onChange: (e) => setBody(e.target.value),
				placeholder: "Reply"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => reply.mutate(),
				disabled: reply.isPending,
				children: "Send reply"
			})]
		}) : null]
	});
}
//#endregion
export { Page as component };
