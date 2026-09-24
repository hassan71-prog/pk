import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/server/admin.functions";
import { formatPkr, formatPoints } from "@/lib/utils";
import {
  ClipboardCheck,
  Users,
  Wallet,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const q = useQuery({ queryKey: ["admin-overview"], queryFn: () => getAdminOverview() });
  const d = q.data;

  const alerts = [
    {
      label: "Pending withdrawals",
      value: d?.pendingWithdrawals ?? 0,
      to: "/admin/withdrawals",
      icon: Wallet,
      urgent: (d?.pendingWithdrawals ?? 0) > 0,
    },
    {
      label: "Pending reviews",
      value: d?.pendingVerifications ?? 0,
      to: "/admin/verification",
      icon: ClipboardCheck,
      urgent: (d?.pendingVerifications ?? 0) > 0,
    },
    {
      label: "New users today",
      value: d?.newToday ?? 0,
      to: "/admin/users",
      icon: Users,
      urgent: false,
    },
  ];

  const items = [
    ["Users", d ? formatPoints(d.totalUsers) : "—"],
    ["Active (7d)", d ? formatPoints(d.activeUsers) : "—"],
    ["New today", d ? formatPoints(d.newToday) : "—"],
    ["Tasks completed", d ? formatPoints(d.tasksCompleted) : "—"],
    ["Points issued", d ? formatPoints(d.pointsIssued) : "—"],
    ["Points redeemed", d ? formatPoints(d.pointsRedeemed) : "—"],
    ["Pending withdrawals", d ? formatPoints(d.pendingWithdrawals) : "—"],
    ["Pending reviews", d ? formatPoints(d.pendingVerifications) : "—"],
    ["Gross revenue", d ? formatPkr(d.grossRevenue) : "—"],
    ["User reward cost", d ? formatPkr(d.userRewardsPkr) : "—"],
    ["Platform revenue", d ? formatPkr(d.platformRevenue) : "—"],
    ["Active campaigns", d ? formatPoints(d.activeCampaigns) : "—"],
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {alerts.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to}>
              <Card
                className={`flex items-center gap-3 transition hover:bg-surface-2 ${
                  a.urgent ? "border-danger/40 bg-danger/5" : ""
                }`}
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                    a.urgent ? "bg-danger/15 text-danger" : "bg-surface-2 text-muted"
                  }`}
                >
                  {a.urgent ? <AlertTriangle className="size-5" /> : <Icon className="size-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted">{a.label}</p>
                  <p className="text-lg font-semibold tabular">{formatPoints(a.value)}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="mb-4 text-sm text-muted">
        Revenue figures come from recorded campaign spend only. Empty means no sponsor money has
        been booked yet — nothing is invented.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map(([k, v]) => (
          <Card key={k}>
            <p className="text-xs text-muted">{k}</p>
            <p className="mt-1 text-lg font-semibold tabular">{v}</p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
