import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { S as adminSaveTask, l as adminListTasks, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
import { t as Textarea } from "./textarea-DbXHY6fL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tasks-miNmKXm3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminTasks() {
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["admin-tasks"],
		queryFn: () => adminListTasks()
	});
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [reward, setReward] = (0, import_react.useState)("300");
	const [url, setUrl] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("website");
	const [verification, setVerification] = (0, import_react.useState)("visit_token");
	const save = useMutation({
		mutationFn: () => adminSaveTask({ data: {
			title,
			description,
			category,
			rewardPoints: Number(reward),
			targetUrl: url || null,
			verificationType: verification,
			status: "active",
			isFeatured: true
		} }),
		onSuccess: () => {
			toast.success("Task saved");
			setTitle("");
			setDescription("");
			qc.invalidateQueries({ queryKey: ["admin-tasks"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	const pause = useMutation({
		mutationFn: (t) => adminSaveTask({ data: {
			id: t.id,
			title: t.title,
			description: t.title,
			category: t.category,
			rewardPoints: t.rewardPoints,
			targetUrl: t.targetUrl,
			verificationType: t.verificationType,
			status: t.status === "active" ? "paused" : "active"
		} }),
		onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-tasks"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Tasks",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Create task"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Title",
					value: title,
					onChange: (e) => setTitle(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					placeholder: "Description",
					value: description,
					onChange: (e) => setDescription(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: reward,
						onChange: (e) => setReward(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Target URL",
						value: url,
						onChange: (e) => setUrl(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						"website",
						"telegram",
						"social",
						"sponsored",
						"affiliate",
						"daily"
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: category === c ? "default" : "secondary",
						onClick: () => setCategory(c),
						children: c
					}, c))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: verification === "visit_token" ? "default" : "secondary",
						onClick: () => setVerification("visit_token"),
						children: "Visit token"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: verification === "admin_approval" ? "default" : "secondary",
						onClick: () => setVerification("admin_approval"),
						children: "Admin review"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save.mutate(),
					disabled: save.isPending,
					children: "Publish task"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2",
			children: (list.data ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						t.category,
						" · +",
						t.rewardPoints,
						" · ",
						t.completionCount,
						" completions"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: t.status }),
						t.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Sample" }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => pause.mutate(t),
							children: t.status === "active" ? "Pause" : "Resume"
						})
					]
				})]
			}, t.id))
		})]
	});
}
//#endregion
export { AdminTasks as component };
