import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

export function PwaInstallBanner({ className }: { className?: string }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      Boolean(window.navigator.standalone);
    setIsStandalone(standalone);
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    // Fallback: show soft prompt linking to install guide after a short delay
    const t = setTimeout(() => {
      if (!standalone) setVisible(true);
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      clearTimeout(t);
    };
  }, []);

  if (isStandalone || !visible) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        setDeferred(null);
        return;
      }
    }
    // Fallback: open platform install tutorial
    window.location.href = "/?install=1";
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[4.5rem] z-30 mx-auto max-w-lg px-3 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5 shadow-lg">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <Download className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-tight">Install app</p>
          <p className="text-[11px] text-muted">Add to home screen for faster access</p>
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
    </div>
  );
}
