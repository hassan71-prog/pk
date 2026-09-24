import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed-v2";

function detectPlatform(): "ios" | "android" | "desktop" {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1)) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    Boolean(window.navigator.standalone)
  );
}

export function PwaInstallBanner({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    setPlatform(detectPlatform());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const t = setTimeout(() => setVisible(true), 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      clearTimeout(t);
    };
  }, []);

  if (!visible || isStandalone()) return null;

  async function install() {
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          setVisible(false);
          setDeferred(null);
          return;
        }
      } catch {
        /* fall through */
      }
    }
    // Show platform help / install tutorial
    setShowHelp(true);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setShowHelp(false);
  }

  function openGuide() {
    window.location.href = "/?install=1";
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-lg px-3 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      {showHelp ? (
        <div className="rounded-xl border border-border bg-surface-2 p-3 shadow-lg">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-medium">App install kaise karein</p>
            <button type="button" className="p-1 text-muted" onClick={dismiss} aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          {platform === "ios" ? (
            <ol className="space-y-1.5 text-xs text-muted">
              <li className="flex gap-2">
                <Share className="mt-0.5 size-3.5 shrink-0 text-primary" />
                Safari mein bottom <strong className="text-fg">Share</strong> button dabao
              </li>
              <li>
                <strong className="text-fg">Add to Home Screen</strong> select karo
              </li>
              <li>
                <strong className="text-fg">Add</strong> confirm karo — icon home pe aa jayega
              </li>
            </ol>
          ) : platform === "android" ? (
            <ol className="space-y-1.5 text-xs text-muted">
              <li>
                Chrome menu <strong className="text-fg">⋮</strong> → <strong className="text-fg">Install app</strong> /{" "}
                <strong className="text-fg">Add to Home screen</strong>
              </li>
              <li>Ya neeche Install button dobara try karo (HTTPS required)</li>
            </ol>
          ) : (
            <ol className="space-y-1.5 text-xs text-muted">
              <li>Chrome/Edge address bar mein install icon dekho</li>
              <li>
                Menu → <strong className="text-fg">Install app</strong>
              </li>
            </ol>
          )}
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="flex-1" onClick={openGuide}>
              Full guide
            </Button>
            <Button size="sm" variant="secondary" onClick={dismiss}>
              Later
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 shadow-lg">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <Download className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">Install app</p>
            <p className="text-[11px] text-muted">
              {platform === "ios" ? "Add to Home Screen" : "Home screen pe icon"}
            </p>
          </div>
          <Button size="sm" onClick={() => void install()}>
            Install
          </Button>
          <button
            type="button"
            aria-label="Dismiss"
            className="rounded-md p-1.5 text-muted hover:bg-surface"
            onClick={dismiss}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
