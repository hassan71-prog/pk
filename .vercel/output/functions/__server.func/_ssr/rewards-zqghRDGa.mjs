import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as errorMessage, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { s as adminListRewards, t as AdminShell, y as adminSaveReward } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rewards-zqghRDGa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["admin-rewards"],
		queryFn: () => adminListRewards()
	});
	const [title, setTitle] = (0, import_react.useState)("");
	const [cost, setCost] = (0, import_react.useState)("1000");
	const [method, setMethod] = (0, import_react.useState)("easypaisa");
	const save = useMutation({
		mutationFn: () => adminSaveReward({ data: {
			title,
			description: "Campaign reward item",
			pointsCost: Number(cost),
			paymentMethod: method,
			status: "active"
		} }),
		onSuccess: () => {
			toast.success("Reward saved");
			setTitle("");
			qc.invalidateQueries({ queryKey: ["admin-rewards"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Rewards",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Title",
					value: title,
					onChange: (e) => setTitle(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						value: cost,
						onChange: (e) => setCost(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 rounded-md border border-border bg-bg px-3 text-sm",
						value: method,
						onChange: (e) => setMethod(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "easypaisa",
								children: "Easypaisa"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "jazzcash",
								children: "JazzCash"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "bank",
								children: "Bank"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "voucher",
								children: "Voucher"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => save.mutate(),
					children: "Add catalogue item"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2",
			children: (list.data ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: r.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						formatPoints(r.pointsCost),
						" pts · ",
						r.paymentMethod
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: r.status })]
			}, r.id))
		})]
	});
}
//#endregion
export { Page as component };
