import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { S as timeAgo, c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { p as getTicket, t as RedirectToSignIn, y as replyTicket } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { r as Route$4 } from "./router-CwvuNp3Y.mjs";
import { t as Textarea } from "./textarea-DbXHY6fL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support._ticketId-BelxLifj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TicketPage() {
	const { ticketId } = Route$4.useParams();
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const [body, setBody] = (0, import_react.useState)("");
	const data = useQuery({
		queryKey: ["ticket", ticketId],
		enabled: !!user,
		queryFn: () => getTicket({ data: { id: Number(ticketId) } })
	});
	const reply = useMutation({
		mutationFn: () => replyTicket({ data: {
			id: Number(ticketId),
			body
		} }),
		onSuccess: () => {
			setBody("");
			toast.success("Reply sent");
			qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Ticket",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: data.data?.ticket.subject ?? "Ticket",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: (data.data?.replies ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: r.isAdmin ? "border-primary/30" : "",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] text-muted",
					children: [
						r.isAdmin ? "Support" : "You",
						" · ",
						timeAgo(r.createdAt)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-relaxed",
					children: r.body
				})]
			}, r.id))
		}), data.data?.ticket.status !== "closed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				value: body,
				onChange: (e) => setBody(e.target.value),
				placeholder: "Reply"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "w-full",
				disabled: reply.isPending || body.trim().length < 2,
				onClick: () => reply.mutate(),
				children: "Send"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: "This ticket is closed."
		})]
	});
}
//#endregion
export { TicketPage as component };
