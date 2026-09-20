import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { I as object, O as _enum, j as boolean, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { i as signOut } from "./client-B40BzJxt.mjs";
import { t as useCurrentUser } from "./use-current-user-DG6UNzh9.mjs";
import { n as number } from "../_libs/zod.mjs";
import { a as hasGateSessionMarker } from "./server-Bftt0Mm5.mjs";
import { t as authMiddleware } from "./middleware-Lb1eCpaC.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/user.functions-D7T_URGM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var identitySchema = object({
	name: string().nullable().optional(),
	email: string().nullable().optional(),
	image: string().nullable().optional(),
	referralCode: string().nullable().optional()
}).optional();
var getDashboard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(identitySchema).handler(createSsrRpc("5aafefb7387bec724267f24b91a94e9bc0aa18ae83614d4ac5d5310bcf5d9f71"));
var listTasks = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(identitySchema).handler(createSsrRpc("800937f5b678e0726cffec9636af958ee096fc76e18360ea939e038c07d5fb35"));
var getTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ taskId: number() })).handler(createSsrRpc("bffa5318a15c459a71d667176ef338b14bacc6284a936352bd96a4074e56598c"));
var startTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ taskId: number() })).handler(createSsrRpc("95ad88e37e76aef4d8041804ab7b085bf480d32e2d10fb719526489ddedb58f4"));
var completeTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	taskId: number(),
	token: string().optional(),
	proofUrl: string().max(500).optional(),
	proofNote: string().max(500).optional()
})).handler(createSsrRpc("f93b1680ce43b1d875508d99df94a985151ae3903fb2bf46aaea950e9840dd8e"));
var claimDaily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("70e50a5cd9156073c77b8898e247c747c6cb98fe1fff45f0accb99556a52c621"));
var getReferralInfo = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(identitySchema).handler(createSsrRpc("2ba26624066dab177eafe6a2c6e35ffaa2ffd1a2bcbbd6731e1176d92c277129"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ code: string().min(3).max(16) })).handler(createSsrRpc("a32e81b0734aa34b3a58b79ca83549dfad5a6aeea3e37725ae69728fd567d704"));
var getLeaderboard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ period: _enum([
	"daily",
	"weekly",
	"monthly",
	"all"
]) })).handler(createSsrRpc("1a2ccd7128dd2be39a084a3d040afbf64784afcdc94bc0f2ed24f5e7aeab9bc8"));
var getWallet = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("fcbebee7787e5d6873a5c7a1c59c461c07397453162821afca91271f60629410"));
var createWithdrawal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	rewardId: number(),
	paymentMethod: _enum([
		"easypaisa",
		"jazzcash",
		"bank",
		"voucher"
	]),
	accountDetails: string().min(5).max(120)
})).handler(createSsrRpc("246cd5df9d8ffd11d518d20619fd4c3557d1f1db0c2aa375c2872360e479ae69"));
var cancelWithdrawal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(createSsrRpc("f10578133b9048bf8a09b3c442ae8feb3749f65edb18ecd762314fa1f084d775"));
var listNotifications = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("4e35948944ecbc25272dec051dc79ae6bf78ade9c167b682a3aed09fdf87ee5a"));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("5befb0bb3f900fe45c08e3ef2a8c5c958bc11a6fda9c0ec8e7c07504a8abdac9"));
var updateProfileSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	language: _enum(["en", "ur"]).optional(),
	notificationsEnabled: boolean().optional()
})).handler(createSsrRpc("e9a6205c2e35a7a56848bae26ac92394d7c3bfb46540300fbb8aea75c8a9de9c"));
var createTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	category: _enum([
		"general",
		"task",
		"payment"
	]),
	subject: string().min(4).max(120),
	body: string().min(8).max(2e3)
})).handler(createSsrRpc("af8e8b6de77ebbb1e5599d36e640fae008fb86bcee0b3e5229895a20b0b28846"));
var listTickets = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("30c0826ed2fd61e4dbd8ce6c96c3335510c50abe57c03664e83dd2162a171a3a"));
var getTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({ id: number() })).handler(createSsrRpc("1dd93f6619ffc5797e35644f65be118a0f5501503f57f70982a7ddf963ca97f4"));
var replyTicket = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(object({
	id: number(),
	body: string().min(2).max(2e3)
})).handler(createSsrRpc("2f1d25ac7b0479ef2e692dccda76c47649d1a8b134a559ac92de1662fdd17041"));
var getMeAdminFlag = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("6fa3e029778e828b098e8103ad738ab62858810551ab74dedf6e0f4d1a03fc8c"));
//#endregion
export { listTickets as _, completeTask as a, startTask as b, getDashboard as c, getReferralInfo as d, getTask as f, listTasks as g, listNotifications as h, claimDaily as i, getLeaderboard as l, getWallet as m, UserButton as n, createTicket as o, getTicket as p, cancelWithdrawal as r, createWithdrawal as s, RedirectToSignIn as t, getMeAdminFlag as u, markNotificationsRead as v, updateProfileSettings as x, replyTicket as y };
