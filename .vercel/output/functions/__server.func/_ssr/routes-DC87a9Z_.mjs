import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-B40BzJxt.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { S as timeAgo, c as errorMessage, u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { t as GROK_PROVIDERS } from "./server-Bftt0Mm5.mjs";
import { c as getDashboard, i as claimDaily, t as RedirectToSignIn } from "./user.functions-D7T_URGM.mjs";
import { t as Logo } from "./logo-CjJelQdP.mjs";
import { g as ClipboardList, i as Trophy, m as Gift, n as Users, x as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Disclaimer, t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { n as useCaptureReferral, t as identityPayload } from "./identity-BXMk-IIH.mjs";
import { t as TX_LABELS } from "./types-nKkEYO28.mjs";
import { i as haptic } from "./router-CwvuNp3Y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DC87a9Z_.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	useCaptureReferral();
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-28 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-40 w-full rounded-xl" })] });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landing, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "app-bg mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-10 font-display text-4xl font-semibold leading-[1.1] tracking-tight",
				children: "Tasks that pay in platform points"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-muted",
				children: "TaskEarn PK is a rewards app for people in Pakistan. Join sponsored campaigns, complete verifiable tasks, and redeem through live reward catalogues — never a mining scheme, never a guaranteed return."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-3",
				children: [GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "w-full",
					variant: p.providerId === "google-grok" ? "default" : "secondary",
					onClick: () => signIn(p.providerId, { callbackURL: "/" }),
					children: ["Continue with ", p.label]
				}, p.providerId)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full",
					asChild: false,
					onClick: () => window.location.href = "/login",
					children: "Email sign in"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disclaimer, { className: "mt-8" })
		]
	});
}
function Dashboard() {
	const { user } = useCurrentUserState();
	const qc = useQueryClient();
	const dash = useQuery({
		queryKey: ["dashboard"],
		queryFn: () => getDashboard({ data: identityPayload(user) })
	});
	const claim = useMutation({
		mutationFn: () => claimDaily(),
		onSuccess: (res) => {
			haptic("medium");
			toast.success(`Daily reward: +${res.points} points`);
			qc.invalidateQueries();
		},
		onError: (err) => toast.error(errorMessage(err))
	});
	if (dash.isPending || !dash.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 grid grid-cols-3 gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-xl" })
		]
	})] });
	if (dash.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const d = dash.data;
	const greet = (user?.displayName ?? d.profile.displayName).split(" ")[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		points: d.profile.pointsBalance,
		unread: d.unread,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Welcome back"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: greet
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 rounded-2xl p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-muted uppercase",
						children: "Available points"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-4xl font-semibold tabular tracking-tight",
						children: formatPoints(d.profile.pointsBalance)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-subtle",
						children: "Platform rewards · not cash"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4 w-full",
						disabled: d.daily.claimed || claim.isPending,
						onClick: () => claim.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "size-4" }), d.daily.claimed ? "Claimed today" : `Claim daily · +${d.daily.nextPoints}`]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-7 gap-1",
						children: d.daily.schedule.map((pts, i) => {
							const day = i + 1;
							const done = d.daily.claimed ? day <= d.daily.dayNumber : day < d.daily.dayNumber;
							const current = day === d.daily.dayNumber;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `rounded-md py-2 text-center ${current ? "bg-primary/15 text-primary" : "bg-bg text-muted"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[10px]",
										children: ["D", day]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold tabular",
										children: pts
									}),
									done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[9px] text-success",
										children: "done"
									}) : null
								]
							}, day);
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Today",
						value: `+${formatPoints(d.todayEarned)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Referrals",
						value: formatPoints(d.referrals)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Tasks",
						value: formatPoints(d.profile.tasksCompleted)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Featured tasks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tasks",
					className: "text-xs text-primary",
					children: "See all"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: d.featured.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "text-sm text-muted",
					children: "No live campaigns right now."
				}) : d.featured.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/tasks/$taskId",
					params: { taskId: String(t.id) },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: t.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted capitalize",
							children: t.category
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-semibold text-primary tabular",
								children: ["+", formatPoints(t.rewardPoints)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-auto mt-1 size-3.5 text-subtle" })]
						})]
					})
				}, t.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
						to: "/tasks",
						icon: ClipboardList,
						label: "Tasks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
						to: "/friends",
						icon: Users,
						label: "Invite"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
						to: "/ranks",
						icon: Trophy,
						label: "Ranks"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-6 text-sm font-semibold",
				children: "Recent activity"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 space-y-2",
				children: d.recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No ledger entries yet."
				}) : d.recent.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: TX_LABELS[tx.type] ?? tx.type }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-subtle",
						children: timeAgo(tx.createdAt)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `tabular font-medium ${tx.amount >= 0 ? "text-success" : "text-danger"}`,
						children: [tx.amount >= 0 ? "+" : "", formatPoints(tx.amount)]
					})]
				}, tx.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disclaimer, { className: "mt-8" })
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm font-semibold tabular",
			children: value
		})]
	});
}
function Quick({ to, icon: Icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: "block",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "flex flex-col items-center gap-1 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[11px] font-medium",
				children: label
			})]
		})
	});
}
//#endregion
export { Home as component };
