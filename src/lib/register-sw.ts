/** Register a minimal service worker (needed for reliable PWA install on Chrome/Android). */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  // Only on secure contexts (https or localhost)
  if (!window.isSecureContext) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[pwa] SW register failed", err);
    });
  });
}
