import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { S as timeAgo, c as errorMessage, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { m as getWallet, r as cancelWithdrawal, s as createWithdrawal, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Disclaimer, t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { t as Input } from "./input-CgR8kXAP.mjs";
import { t as TX_LABELS } from "./types-nKkEYO28.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wallet-1YBZiij0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WalletPage() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [method, setMethod] = (0, import_react.useState)("easypaisa");
	const [account, setAccount] = (0, import_react.useState)("");
	const wallet = useQuery({
		queryKey: ["wallet"],
		enabled: !!user,
		queryFn: () => getWallet()
	});
	const redeem = useMutation({
		mutationFn: () => createWithdrawal({ data: {
			rewardId: selected,
			paymentMethod: method,
			accountDetails: account
		} }),
		onSuccess: () => {
			toast.success("Redemption submitted for review");
			setAccount("");
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	const cancel = useMutation({
		mutationFn: (id) => cancelWithdrawal({ data: { id } }),
		onSuccess: () => {
			toast.success("Request cancelled. Points returned.");
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Wallet",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const w = wallet.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Wallet",
		points: w?.profile.pointsBalance,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Balance"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xl font-semibold tabular",
						children: formatPoints(w?.profile.pointsBalance ?? 0)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Lifetime earned"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xl font-semibold tabular",
						children: formatPoints(w?.profile.lifetimeEarned ?? 0)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Redeemed"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xl font-semibold tabular",
						children: formatPoints(w?.profile.lifetimeRedeemed ?? 0)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Pending"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xl font-semibold tabular",
						children: formatPoints(w?.pendingPoints ?? 0)
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disclaimer, { className: "mt-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Rewards catalogue"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-subtle",
				children: [
					"Minimum ",
					formatPoints(w?.minWithdrawal ?? 1e3),
					" points. Admin approval required. Not an automatic cash conversion."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-2",
				children: (w?.rewards ?? []).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setSelected(r.id);
						setMethod(r.paymentMethod);
					},
					className: `w-full rounded-xl border p-4 text-left ${selected === r.id ? "border-primary bg-primary/10" : "border-border bg-surface"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: r.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: r.description
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tabular",
							children: formatPoints(r.pointsCost)
						})]
					})
				}, r.id))
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-3 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Payout details"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [
							"easypaisa",
							"jazzcash",
							"bank",
							"voucher"
						].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: method === m ? "default" : "secondary",
							onClick: () => setMethod(m),
							children: m
						}, m))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: method === "bank" ? "IBAN / account title" : "Mobile account number",
						value: account,
						onChange: (e) => setAccount(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: redeem.isPending || account.trim().length < 5,
						onClick: () => redeem.mutate(),
						children: "Request redemption"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Redemption requests"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (w?.withdrawals ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "None yet."
				}) : w.withdrawals.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: r.rewardTitle ?? "Reward" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: r.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								formatPoints(r.points),
								" pts · ",
								r.paymentMethod,
								" · ",
								r.accountMasked
							]
						}),
						r.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							className: "mt-2",
							onClick: () => cancel.mutate(r.id),
							children: "Cancel"
						}) : null
					]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Ledger"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: (w?.transactions ?? []).map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: TX_LABELS[tx.type] ?? tx.type }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: timeAgo(tx.createdAt)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `tabular ${tx.amount >= 0 ? "text-success" : "text-danger"}`,
						children: [tx.amount >= 0 ? "+" : "", formatPoints(tx.amount)]
					})]
				}, tx.id))
			})
		]
	});
}
//#endregion
export { WalletPage as component };
