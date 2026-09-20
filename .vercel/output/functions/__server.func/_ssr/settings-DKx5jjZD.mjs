import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as errorMessage } from "./helpers-NOxQJUtC.mjs";
import { b as adminSaveSettings, h as adminPurgeDemo, i as adminGetSettings, t as AdminShell } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DKx5jjZD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEYS = [
	"daily_schedule",
	"referral_reward",
	"referral_qualify_tasks",
	"max_referral_rewards",
	"min_withdrawal_points",
	"daily_withdrawal_limit_points",
	"monthly_withdrawal_limit_points",
	"bot_username",
	"support_email"
];
function Page() {
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["admin-settings"],
		queryFn: () => adminGetSettings()
	});
	const [form, setForm] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		if (q.data) setForm(q.data);
	}, [q.data]);
	const save = useMutation({
		mutationFn: () => adminSaveSettings({ data: { entries: form } }),
		onSuccess: () => toast.success("Settings saved"),
		onError: (e) => toast.error(errorMessage(e))
	});
	const purge = useMutation({
		mutationFn: () => adminPurgeDemo(),
		onSuccess: () => {
			toast.success("Demo records removed");
			qc.invalidateQueries();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Settings",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg space-y-3",
			children: [KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: k
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					value: form[k] ?? "",
					onChange: (e) => setForm({
						...form,
						[k]: e.target.value
					})
				})]
			}, k)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => save.mutate(),
				children: "Save settings"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-8 max-w-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Remove sample records"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "Deletes rows flagged is_demo (sample leaderboard faces, sample tasks, sample sponsors)."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3",
					variant: "danger",
					onClick: () => purge.mutate(),
					children: "Purge demo data"
				})
			]
		})]
	});
}
//#endregion
export { Page as component };
