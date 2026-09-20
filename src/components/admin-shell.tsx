import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardCheck,
  Flag,
  Gift,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  Shield,
  Ticket,
  Users,
  Wallet,
  BarChart3,
  ListTodo,
  ArrowLeftRight,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/tasks", label: "Tasks", icon: ListTodo },
  { to: "/admin/verification", label: "Verification", icon: ClipboardCheck },
  { to: "/admin/referrals", label: "Referrals", icon: Flag },
  { to: "/admin/transactions", label: "Ledger", icon: ArrowLeftRight },
  { to: "/admin/rewards", label: "Rewards", icon: Gift },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/admin/sponsors", label: "Sponsors", icon: Megaphone },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/admins", label: "Admins", icon: Shield },
  { to: "/admin/audit", label: "Audit", icon: ScrollText },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket },
] as const;

export function AdminShell({ children, title }: { children: ReactNode; title: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto flex max-w-6xl">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-r border-border p-4 md:block">
          <Logo />
          <p className="mt-2 text-[11px] tracking-wide text-subtle uppercase">Admin</p>
          <nav className="mt-4 space-y-0.5">
            {LINKS.map((l) => {
              const active = l.to === "/admin" ? pathname === "/admin" : pathname.startsWith(l.to);
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                    active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface",
                  )}
                >
                  <Icon className="size-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <Link to="/" className="mt-6 block text-xs text-primary">
            Back to app
          </Link>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur md:px-6">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs whitespace-nowrap",
                    pathname === l.to ? "bg-primary text-primary-fg" : "bg-surface text-muted",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </header>
          <div className="px-4 py-5 md:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
