import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { u as formatPoints } from "./helpers-NOxQJUtC.mjs";
import { c as getDashboard, n as UserButton, t as RedirectToSignIn, u as getMeAdminFlag, x as updateProfileSettings } from "./user.functions-D7T_URGM.mjs";
import { v as ChevronRight } from "../_libs/lucide-react.mjs";
import { t as Card } from "./card-BhJt3SEv.mjs";
import { t as Badge } from "./badge-Cx3brCck.mjs";
import { t as Button } from "./button-DzK8JVDL.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Disclaimer, t as AppShell } from "./app-shell-CfMoYIQm.mjs";
import { t as Skeleton } from "./skeleton-cxt51Vek.mjs";
import { t as identityPayload } from "./identity-BXMk-IIH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-R431Kv2z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const [installEvent, setInstallEvent] = (0, import_react.useState)(null);
	const dash = useQuery({
		queryKey: ["dashboard"],
		enabled: !!user,
		queryFn: () => getDashboard({ data: identityPayload(user) })
	});
	const admin = useQuery({
		queryKey: ["me-admin"],
		enabled: !!user,
		queryFn: () => getMeAdminFlag()
	});
	const save = useMutation({
		mutationFn: (payload) => updateProfileSettings({ data: payload }),
		onSuccess: () => {
			toast.success("Settings saved");
			qc.invalidateQueries({ queryKey: ["dashboard"] });
		}
	});
	(0, import_react.useEffect)(() => {
		const onPrompt = (e) => {
			e.preventDefault();
			setInstallEvent(e);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		return () => window.removeEventListener("beforeinstallprompt", onPrompt);
	}, []);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Profile",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 rounded-xl" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const p = dash.data?.profile;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Profile",
		points: p?.pointsBalance,
		unread: dash.data?.unread,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex items-center gap-3 rounded-2xl",
				children: [user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: user.profileImageUrl,
					alt: "",
					className: "size-14 rounded-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-14 place-items-center rounded-full bg-surface-2 text-lg font-semibold",
					children: (p?.displayName ?? "M").charAt(0)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: p?.displayName ?? user.displayName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: user.primaryEmail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: p?.status ?? "active" }), admin.data?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "primary",
								children: "Admin"
							}) : null]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: "Points"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tabular",
							children: formatPoints(p?.pointsBalance ?? 0)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: "Tasks"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold tabular",
							children: p?.tasksCompleted ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted",
							children: "Member"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: p?.createdAt ? new Date(p.createdAt).toLocaleDateString("en-PK") : "—"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						to: "/wallet",
						label: "Wallet & rewards"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						to: "/support",
						label: "Support"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						to: "/legal/terms",
						label: "Terms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						to: "/legal/privacy",
						label: "Privacy"
					}),
					admin.data?.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						to: "/admin",
						label: "Admin panel"
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "mt-4 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: "Language"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: p?.language === "en" ? "default" : "secondary",
							size: "sm",
							onClick: () => save.mutate({ language: "en" }),
							children: "English"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: p?.language === "ur" ? "default" : "secondary",
							size: "sm",
							onClick: () => save.mutate({ language: "ur" }),
							children: "اردو"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm",
							children: "Notifications"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: p?.notificationsEnabled ? "default" : "secondary",
							onClick: () => save.mutate({ notificationsEnabled: !p?.notificationsEnabled }),
							children: p?.notificationsEnabled ? "On" : "Off"
						})]
					})
				]
			}),
			installEvent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				variant: "secondary",
				onClick: async () => {
					await installEvent.prompt();
					setInstallEvent(null);
				},
				children: "Install app"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Disclaimer, { className: "mt-6" })
		]
	});
}
function Row({ to, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 text-subtle" })]
	});
}
//#endregion
export { ProfilePage as component };
