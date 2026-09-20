import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react, r as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as createFileRoute, d as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as __exportAll } from "./ssr.mjs";
import { B as union, F as number, I as object, N as literal, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { a as creditPoints, b as recordCampaignSpend, g as maybeQualifyReferral, m as getSql, v as notify } from "./helpers-NOxQJUtC.mjs";
import { n as auth } from "./server-Bftt0Mm5.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { a as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CwvuNp3Y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function getTelegram() {
	if (typeof window === "undefined") return null;
	return window.Telegram?.WebApp ?? null;
}
function haptic(style = "light") {
	try {
		getTelegram()?.HapticFeedback?.impactOccurred?.(style);
	} catch {}
}
function Providers({ children }) {
	const [client] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 15e3,
		retry: 1,
		refetchOnWindowFocus: false
	} } }));
	(0, import_react.useEffect)(() => {
		const tg = getTelegram();
		if (!tg) return;
		tg.ready();
		tg.expand?.();
		const bg = tg.themeParams?.bg_color;
		if (bg) document.documentElement.style.setProperty("--color-bg", bg);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			theme: "dark",
			position: "top-center",
			toastOptions: { style: {
				background: "#0d1730",
				border: "1px solid rgba(243,246,251,0.12)",
				color: "#f3f6fb"
			} }
		})]
	});
}
var styles_default = "/assets/styles-Dj2O3bcv.css";
var APP_NAME = "TaskEarn PK";
var Route$31 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "TaskEarn PK is a Pakistan rewards app for sponsored tasks. Points are platform rewards, not cash or an investment."
			},
			{
				name: "theme-color",
				content: "#07101F"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
			}
		],
		scripts: [{
			src: "https://telegram.org/js/telegram-web-app.js",
			defer: true
		}]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "min-h-dvh bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Providers, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$27 = () => import("./routes-DC87a9Z_.mjs");
var Route$30 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
Badge;
var $$splitComponentImporter$26 = () => import("./admin-Br7DMLsh.mjs");
var Route$29 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./friends-MWLwWNdp.mjs");
var Route$28 = createFileRoute("/friends")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./login-yr89X02q.mjs");
var Route$27 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./notifications-DUytT4Il.mjs");
var Route$26 = createFileRoute("/notifications")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./profile-R431Kv2z.mjs");
var Route$25 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./ranks-BTixax33.mjs");
var Route$24 = createFileRoute("/ranks")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./support-N9rFDB5K.mjs");
var Route$23 = createFileRoute("/support")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./tasks-C59emUN0.mjs");
var Route$22 = createFileRoute("/tasks")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./wallet-1YBZiij0.mjs");
var Route$21 = createFileRoute("/wallet")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./admin-C8bPXcGq.mjs");
var Route$20 = createFileRoute("/admin/")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./admins-B3ffb3Bq.mjs");
var Route$19 = createFileRoute("/admin/admins")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./audit-BrZdAc9P.mjs");
var Route$18 = createFileRoute("/admin/audit")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./referrals-C0RVedhs.mjs");
var Route$17 = createFileRoute("/admin/referrals")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./reports-DC4KxSTD.mjs");
var Route$16 = createFileRoute("/admin/reports")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./rewards-zqghRDGa.mjs");
var Route$15 = createFileRoute("/admin/rewards")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./settings-DKx5jjZD.mjs");
var Route$14 = createFileRoute("/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./sponsors-C4qIjuFN.mjs");
var Route$13 = createFileRoute("/admin/sponsors")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./tasks-miNmKXm3.mjs");
var Route$12 = createFileRoute("/admin/tasks")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./tickets-CYF5Oy39.mjs");
var Route$11 = createFileRoute("/admin/tickets")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./transactions-hZ4sHul7.mjs");
var Route$10 = createFileRoute("/admin/transactions")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./users-BXHWuiOJ.mjs");
var Route$9 = createFileRoute("/admin/users")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./verification-njFSpgMN.mjs");
var Route$8 = createFileRoute("/admin/verification")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./withdrawals-OkuO_-B_.mjs");
var Route$7 = createFileRoute("/admin/withdrawals")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./legal.privacy-DxDDDGwB.mjs");
var Route$6 = createFileRoute("/legal/privacy")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./legal.terms-Br-x5ZWn.mjs");
var Route$5 = createFileRoute("/legal/terms")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./support._ticketId-BelxLifj.mjs");
var Route$4 = createFileRoute("/support/$ticketId")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./tasks._taskId-D2qrEUGO.mjs");
var Route$3 = createFileRoute("/tasks/$taskId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$2 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var Route$1 = createFileRoute("/api/sponsor/callback")({ server: { handlers: { POST: async ({ request }) => {
	const body = await request.json();
	const expected = process.env.SPONSOR_CALLBACK_SECRET;
	if (expected && body.secret !== expected) return Response.json({
		success: false,
		message: "Unauthorized"
	}, { status: 401 });
	if (!body.token) return Response.json({
		success: false,
		message: "Missing token"
	}, { status: 400 });
	const sql = await getSql();
	const c = (await sql`
          select id, user_id, task_id, status from task_completions where token = ${body.token}
        `)[0];
	if (!c) return Response.json({
		success: false,
		message: "Unknown token"
	}, { status: 404 });
	if (c.status !== "started" && c.status !== "pending") return Response.json({
		success: true,
		message: "Already processed"
	});
	const t = (await sql`select title, reward_points, campaign_id, verification_type from tasks where id = ${c.task_id}`)[0];
	if (!t || t.verification_type !== "sponsor_callback") return Response.json({
		success: false,
		message: "Task does not accept callbacks"
	}, { status: 400 });
	await recordCampaignSpend(sql, t.campaign_id);
	await sql`
          update task_completions set status = 'completed', submitted_at = now(), updated_at = now()
          where id = ${c.id}
        `;
	await sql`update tasks set completion_count = completion_count + 1 where id = ${c.task_id}`;
	await sql`update app_profiles set tasks_completed = tasks_completed + 1 where user_id = ${c.user_id}`;
	await creditPoints(sql, c.user_id, Number(t.reward_points), "task_reward", t.title, "task", String(c.task_id));
	await maybeQualifyReferral(sql, c.user_id);
	await notify(sql, c.user_id, "task_approved", "Task verified", `+${t.reward_points} points for ${t.title}.`);
	return Response.json({
		success: true,
		message: "Completion recorded"
	});
} } } });
async function telegramApi(method, body) {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	if (!token) throw new Error("Bot token is not configured");
	return (await fetch(`https://api.telegram.org/bot${token}/${method}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body)
	})).json();
}
var Route = createFileRoute("/api/telegram/webhook")({ server: { handlers: { POST: async ({ request }) => {
	if (!process.env.TELEGRAM_BOT_TOKEN) return Response.json({
		success: false,
		message: "TELEGRAM_BOT_TOKEN is not set"
	}, { status: 503 });
	const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
	if (secret) {
		if (request.headers.get("x-telegram-bot-api-secret-token") !== secret) return Response.json({
			success: false,
			message: "Unauthorized"
		}, { status: 401 });
	}
	const msg = (await request.json()).message;
	if (!msg?.text) return Response.json({ success: true });
	const [cmd, arg] = msg.text.trim().split(/\s+/, 2);
	const keyboard = { inline_keyboard: [[{
		text: "Open TaskEarn PK",
		web_app: { url: process.env.TELEGRAM_MINI_APP_URL ?? new URL(request.url).origin }
	}]] };
	if (cmd === "/start") {
		if (arg) await (await getSql())`
              insert into notifications (user_id, type, title, body)
              select user_id, 'referral_joined', 'Telegram start', ${"Start payload " + arg}
              from app_profiles where referral_code = ${arg.toUpperCase()}
            `;
		await telegramApi("sendMessage", {
			chat_id: msg.chat.id,
			text: "Welcome to TaskEarn PK. Points are campaign rewards, not cash. Open the app to start.",
			reply_markup: keyboard
		});
	} else if (cmd === "/help") await telegramApi("sendMessage", {
		chat_id: msg.chat.id,
		text: "/start /profile /tasks /balance /referral /leaderboard /support",
		reply_markup: keyboard
	});
	else if (cmd === "/support") await telegramApi("sendMessage", {
		chat_id: msg.chat.id,
		text: "Open the app and go to Support to create a ticket.",
		reply_markup: keyboard
	});
	else await telegramApi("sendMessage", {
		chat_id: msg.chat.id,
		text: "Open TaskEarn PK to view your profile, tasks, and ledger.",
		reply_markup: keyboard
	});
	return Response.json({ success: true });
} } } });
var IndexRoute = Route$30.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$31
});
var AdminRoute = Route$29.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$31
});
var FriendsRoute = Route$28.update({
	id: "/friends",
	path: "/friends",
	getParentRoute: () => Route$31
});
var LoginRoute = Route$27.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$31
});
var NotificationsRoute = Route$26.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => Route$31
});
var ProfileRoute = Route$25.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$31
});
var RanksRoute = Route$24.update({
	id: "/ranks",
	path: "/ranks",
	getParentRoute: () => Route$31
});
var SupportRoute = Route$23.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => Route$31
});
var TasksRoute = Route$22.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => Route$31
});
var WalletRoute = Route$21.update({
	id: "/wallet",
	path: "/wallet",
	getParentRoute: () => Route$31
});
var AdminIndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var AdminAdminsRoute = Route$19.update({
	id: "/admins",
	path: "/admins",
	getParentRoute: () => AdminRoute
});
var AdminAuditRoute = Route$18.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AdminRoute
});
var AdminReferralsRoute = Route$17.update({
	id: "/referrals",
	path: "/referrals",
	getParentRoute: () => AdminRoute
});
var AdminReportsRoute = Route$16.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AdminRoute
});
var AdminRewardsRoute = Route$15.update({
	id: "/rewards",
	path: "/rewards",
	getParentRoute: () => AdminRoute
});
var AdminSettingsRoute = Route$14.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AdminRoute
});
var AdminSponsorsRoute = Route$13.update({
	id: "/sponsors",
	path: "/sponsors",
	getParentRoute: () => AdminRoute
});
var AdminTasksRoute = Route$12.update({
	id: "/tasks",
	path: "/tasks",
	getParentRoute: () => AdminRoute
});
var AdminTicketsRoute = Route$11.update({
	id: "/tickets",
	path: "/tickets",
	getParentRoute: () => AdminRoute
});
var AdminTransactionsRoute = Route$10.update({
	id: "/transactions",
	path: "/transactions",
	getParentRoute: () => AdminRoute
});
var AdminUsersRoute = Route$9.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AdminRoute
});
var AdminVerificationRoute = Route$8.update({
	id: "/verification",
	path: "/verification",
	getParentRoute: () => AdminRoute
});
var AdminWithdrawalsRoute = Route$7.update({
	id: "/withdrawals",
	path: "/withdrawals",
	getParentRoute: () => AdminRoute
});
var LegalPrivacyRoute = Route$6.update({
	id: "/legal/privacy",
	path: "/legal/privacy",
	getParentRoute: () => Route$31
});
var LegalTermsRoute = Route$5.update({
	id: "/legal/terms",
	path: "/legal/terms",
	getParentRoute: () => Route$31
});
var SupportTicketIdRoute = Route$4.update({
	id: "/$ticketId",
	path: "/$ticketId",
	getParentRoute: () => SupportRoute
});
var TasksTaskIdRoute = Route$3.update({
	id: "/$taskId",
	path: "/$taskId",
	getParentRoute: () => TasksRoute
});
var ApiAuthSplatRoute = Route$2.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$31
});
var ApiSponsorCallbackRoute = Route$1.update({
	id: "/api/sponsor/callback",
	path: "/api/sponsor/callback",
	getParentRoute: () => Route$31
});
var ApiTelegramWebhookRoute = Route.update({
	id: "/api/telegram/webhook",
	path: "/api/telegram/webhook",
	getParentRoute: () => Route$31
});
var AdminRouteChildren = {
	AdminAdminsRoute,
	AdminAuditRoute,
	AdminReferralsRoute,
	AdminReportsRoute,
	AdminRewardsRoute,
	AdminSettingsRoute,
	AdminSponsorsRoute,
	AdminTasksRoute,
	AdminTicketsRoute,
	AdminTransactionsRoute,
	AdminUsersRoute,
	AdminVerificationRoute,
	AdminWithdrawalsRoute,
	AdminIndexRoute
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var SupportRouteChildren = { SupportTicketIdRoute };
var SupportRouteWithChildren = SupportRoute._addFileChildren(SupportRouteChildren);
var TasksRouteChildren = { TasksTaskIdRoute };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRouteWithChildren,
	FriendsRoute,
	LoginRoute,
	NotificationsRoute,
	ProfileRoute,
	RanksRoute,
	SupportRoute: SupportRouteWithChildren,
	TasksRoute: TasksRoute._addFileChildren(TasksRouteChildren),
	WalletRoute,
	LegalPrivacyRoute,
	LegalTermsRoute,
	ApiAuthSplatRoute,
	ApiSponsorCallbackRoute,
	ApiTelegramWebhookRoute
};
var routeTree = Route$31._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { haptic as i, Route$3 as n, Route$4 as r, router_exports as t };
