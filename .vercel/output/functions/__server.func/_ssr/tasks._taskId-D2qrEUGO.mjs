import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { c as errorMessage, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { a as completeTask, b as startTask, c as getDashboard, f as getTask, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
import { i as haptic, n as Route$3 } from "./router-CwvuNp3Y.mjs";
import { t as Textarea } from "./textarea-DbXHY6fL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks._taskId-D2qrEUGO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TaskDetail() {
	const { taskId } = Route$3.useParams();
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const [proofUrl, setProofUrl] = (0, import_react.useState)("");
	const [proofNote, setProofNote] = (0, import_react.useState)("");
	const task = useQuery({
		queryKey: ["task", taskId],
		enabled: !!user,
		queryFn: () => getTask({ data: { taskId: Number(taskId) } })
	});
	const dash = useQuery({
		queryKey: ["dashboard"],
		enabled: !!user,
		queryFn: () => getDashboard({ data: {} })
	});
	const start = useMutation({
		mutationFn: () => startTask({ data: { taskId: Number(taskId) } }),
		onSuccess: async (res) => {
			haptic();
			toast.success("Task started. Complete the action, then submit.");
			if (task.data?.targetUrl) window.open(task.data.targetUrl, "_blank", "noopener,noreferrer");
			await qc.invalidateQueries({ queryKey: ["task", taskId] });
			await qc.invalidateQueries({ queryKey: ["tasks"] });
			return res;
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	const submit = useMutation({
		mutationFn: () => completeTask({ data: {
			taskId: Number(taskId),
			token: task.data?.token ?? void 0,
			proofUrl: proofUrl || void 0,
			proofNote: proofNote || void 0
		} }),
		onSuccess: (res) => {
			haptic("medium");
			if (res.status === "pending") toast.success("Submitted for review. No points yet.");
			else toast.success(`Verified. +${res.points} points.`);
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	const remaining = (0, import_react.useMemo)(() => {
		if (!task.data?.startedAt || !task.data.minDwellSeconds) return 0;
		const elapsed = (Date.now() - new Date(task.data.startedAt).getTime()) / 1e3;
		return Math.max(0, Math.ceil(task.data.minDwellSeconds - elapsed));
	}, [task.data]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Task",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (task.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Task",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 rounded-xl" })
	});
	if (!task.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Task",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Task not found."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/tasks",
			className: "mt-3 inline-block text-sm text-primary",
			children: "Back to tasks"
		})]
	});
	const t = task.data;
	const needsProof = t.verificationType === "admin_approval" || t.verificationType === "telegram_membership";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Task",
		points: dash.data?.profile.pointsBalance,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t.category }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "primary",
						children: t.verificationType.replace("_", " ")
					}),
					t.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Sample" }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-2xl font-semibold tracking-tight",
				children: t.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: t.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Reward if verified"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-lg font-semibold text-primary tabular",
					children: ["+", formatPoints(t.rewardPoints)]
				})] }), t.sponsorName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: t.sponsorName
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs leading-relaxed text-subtle",
				children: "Clicking a button does not add points. The server issues a task token, checks dwell time or admin review, and only then writes the ledger."
			}),
			t.userState === "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 text-sm text-success",
				children: "This task is already completed."
			}) : t.userState === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 text-sm text-warning",
				children: "Submitted — waiting for review."
			}) : t.userState === "rejected" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 text-sm text-danger",
				children: "Previous submission was rejected."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [t.userState === "available" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					disabled: start.isPending,
					onClick: () => start.mutate(),
					children: "Start task"
				}) : null, t.userState === "started" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					t.targetUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "w-full",
						onClick: () => window.open(t.targetUrl, "_blank", "noopener,noreferrer"),
						children: "Open destination"
					}) : null,
					needsProof ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Proof URL (optional)",
						value: proofUrl,
						onChange: (e) => setProofUrl(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						placeholder: "What did you complete?",
						value: proofNote,
						onChange: (e) => setProofNote(e.target.value)
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: submit.isPending,
						onClick: () => submit.mutate(),
						children: submit.isPending ? "Checking…" : remaining > 0 ? `Submit (wait ${remaining}s)` : "Submit for verification"
					})
				] }) : null]
			})
		]
	});
}
//#endregion
export { TaskDetail as component };
