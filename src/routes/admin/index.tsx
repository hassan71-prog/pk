import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminOverview } from "@/lib/server/admin.functions";
import { formatPkr, formatPoints } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

function AdminHome() {
  const q = useQuery({ queryKey: ["admin-overview"], queryFn: () => getAdminOverview() });
  const d = q.data;
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
