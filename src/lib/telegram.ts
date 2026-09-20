type Haptic = { impactOccurred?: (style: "light" | "medium" | "heavy") => void };

type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  close: () => void;
  colorScheme?: "light" | "dark";
  themeParams?: Record<string, string>;
  BackButton?: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; offClick: (fn: () => void) => void };
  HapticFeedback?: Haptic;
  initData?: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string; username?: string; photo_url?: string } };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegram(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isTelegramMiniApp() {
  const tg = getTelegram();
  return Boolean(tg?.initData);
}

export function haptic(style: "light" | "medium" | "heavy" = "light") {
  try {
    getTelegram()?.HapticFeedback?.impactOccurred?.(style);
  } catch {
    /* unsupported */
  }
}
