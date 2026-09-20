import { o as __toESM } from "../_runtime.mjs";
import { o as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/identity-BXMk-IIH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var REF_KEY = "taskearn.ref";
function captureReferralFromUrl() {
	if (typeof window === "undefined") return;
	const url = new URL(window.location.href);
	const ref = url.searchParams.get("ref") ?? url.searchParams.get("start");
	if (ref) try {
		sessionStorage.setItem(REF_KEY, ref.trim().toUpperCase());
	} catch {}
}
function readReferral() {
	if (typeof window === "undefined") return null;
	try {
		return sessionStorage.getItem(REF_KEY);
	} catch {
		return null;
	}
}
function identityPayload(user) {
	return {
		name: user?.displayName ?? null,
		email: user?.primaryEmail ?? null,
		image: user?.profileImageUrl ?? null,
		referralCode: readReferral()
	};
}
function useCaptureReferral() {
	(0, import_react.useEffect)(() => {
		captureReferralFromUrl();
	}, []);
}
//#endregion
export { useCaptureReferral as n, identityPayload as t };
