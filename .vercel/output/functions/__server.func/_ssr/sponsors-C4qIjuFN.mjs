import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { c as errorMessage, l as formatPkr } from "./helpers-NOxQJUtC.mjs";
import { c as adminListSponsors, t as AdminShell, v as adminSaveCampaign, x as adminSaveSponsor } from "./admin.functions-XoxH_Qr3.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sponsors-C4qIjuFN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const qc = useQueryClient();
	const data = useQuery({
		queryKey: ["admin-sponsors"],
		queryFn: () => adminListSponsors()
	});
	const [name, setName] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [sponsorId, setSponsorId] = (0, import_react.useState)(null);
	const [budget, setBudget] = (0, import_react.useState)("10000");
	const [cost, setCost] = (0, import_react.useState)("40");
	const addS = useMutation({
		mutationFn: () => adminSaveSponsor({ data: { name } }),
		onSuccess: () => {
			setName("");
			qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	const addC = useMutation({
		mutationFn: () => adminSaveCampaign({ data: {
			sponsorId,
			title,
			taskType: "sponsored",
			rewardPerCompletion: 500,
			budgetPkr: Number(budget),
			costPerCompletionPkr: Number(cost),
			status: "active"
		} }),
		onSuccess: () => {
			toast.success("Campaign saved");
			setTitle("");
			qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
		},
		onError: (e) => toast.error(errorMessage(e))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminShell, {
		title: "Sponsors",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Sponsor name",
					value: name,
					onChange: (e) => setName(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => addS.mutate(),
					disabled: !name.trim(),
					children: "Add sponsor"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: (data.data?.sponsors ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: sponsorId === s.id ? "default" : "secondary",
					onClick: () => setSponsorId(s.id),
					children: s.name
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-3 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "New campaign"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Title",
						value: title,
						onChange: (e) => setTitle(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: budget,
							onChange: (e) => setBudget(e.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: cost,
							onChange: (e) => setCost(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => addC.mutate(),
						disabled: !sponsorId,
						children: "Activate campaign"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2",
				children: (data.data?.campaigns ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: c.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: c.status })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: [
						c.sponsorName,
						" · budget ",
						formatPkr(c.budgetPkr),
						" · spent ",
						formatPkr(c.spentPkr),
						" · remaining",
						" ",
						formatPkr(c.remainingPkr),
						" · ",
						c.completions,
						" completions"
					]
				})] }, c.id))
			})
		]
	});
}
//#endregion
export { Page as component };
