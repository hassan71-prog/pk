import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { S as timeAgo, c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { _ as listTickets, o as createTicket, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
import { t as Textarea } from "./textarea-DbXHY6fL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-N9rFDB5K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FAQ = [
	{
		q: "Are points cash?",
		a: "No. Points are platform rewards. Redemption only happens through listed catalogue items and only when campaign budget exists."
	},
	{
		q: "Why didn’t I get points after clicking a task?",
		a: "Points are never granted on click. You must start the task, complete the action, and pass server-side verification or admin review."
	},
	{
		q: "When do referral rewards post?",
		a: "After the referred member meets the qualification (a completed task by default). Self-referrals are rejected."
	},
	{
		q: "How are payouts sent?",
		a: "Easypaisa, JazzCash, bank transfer, or voucher — all require admin approval. We never show your account number publicly."
	}
];
function SupportPage() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const [category, setCategory] = (0, import_react.useState)("general");
	const [subject, setSubject] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const tickets = useQuery({
		queryKey: ["tickets"],
		enabled: !!user,
		queryFn: () => listTickets()
	});
	const create = useMutation({
		mutationFn: () => createTicket({ data: {
			category,
			subject,
			body
		} }),
		onSuccess: () => {
			toast.success("Ticket opened");
			setSubject("");
			setBody("");
			qc.invalidateQueries({ queryKey: ["tickets"] });
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Support",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Support",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-semibold",
				children: "FAQ"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: FAQ.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: f.q
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-relaxed text-muted",
					children: f.a
				})] }, f.q))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Contact support"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-2 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-1",
						children: [
							"general",
							"task",
							"payment"
						].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: category === c ? "default" : "secondary",
							onClick: () => setCategory(c),
							children: c === "task" ? "Report task" : c === "payment" ? "Payment" : "General"
						}, c))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Subject",
						value: subject,
						onChange: (e) => setSubject(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: "Describe the issue",
						value: body,
						onChange: (e) => setBody(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: create.isPending,
						onClick: () => create.mutate(),
						children: "Open ticket"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Your tickets"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (tickets.data ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/support/$ticketId",
					params: { ticketId: String(t.id) },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t.subject
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-subtle",
							children: timeAgo(t.updatedAt)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t.status })]
					})
				}, t.id))
			})
		]
	});
}
//#endregion
export { SupportPage as component };
