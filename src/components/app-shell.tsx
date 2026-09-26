import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  Home,
  Trophy,
  User,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { cn, formatPoints } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/tasks", label: "Tasks", icon: ClipboardList },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/ranks", label: "Ranks", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({
  children,
  points,
  unread = 0,
  title,
}: {
  children: ReactNode;
  points?: number;
  unread?: number;
  title?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="app-bg mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border/80 bg-bg/85 px-4 py-3 backdrop-blur-md">
        {title ? (
          <h1 className="text-base font-bold tracking-tight">{title}</h1>
        ) : (
          <Logo />
        )}
        <div className="flex items-center gap-2">
          {typeof points === "number" ? (
            <Link
              to="/wallet"
              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
            >
              <span className="text-sm">🪙</span>
              <span className="text-xs font-bold tabular text-primary">{formatPoints(points)}</span>
            </Link>
          ) : null}
          <Link
            to="/notifications"
            className="relative grid size-10 place-items-center rounded-full border border-border bg-surface"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unread > 0 ? (
              <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-primary shadow-[0_0_8px_#22c55e]" />
            ) : null}
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 pt-4 pb-28">{children}</main>
      <PwaInstallBanner />
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-border/80 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <ul className="grid grid-cols-5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition-all",
                      active && "bg-primary/15 shadow-[0_0_14px_rgba(34,197,94,0.35)]",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-subtle", className)}>
      Points are platform rewards funded by sponsored tasks and campaigns. They are not
      cash, crypto, or an investment. Redemption depends on available rewards and campaign
      budgets.
    </p>
  );
}
