import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { adminGetReports } from "@/lib/server/admin.functions";
import { TX_LABELS } from "@/lib/types";
import { formatPkr, formatPoints } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({ component: Page });

function Page() {
  const q = useQuery({ queryKey: ["admin-reports"], queryFn: () => adminGetReports() });
  return (
    <AdminShell title="Reports">
      <h2 className="text-sm font-semibold">Points by type</h2>
      <div className="mt-2 space-y-2">
        {(q.data?.pointsByType ?? []).map((r) => (
          <Card key={r.type} className="flex justify-between text-sm">
            <span>{TX_LABELS[r.type] ?? r.type}</span>
            <span className="tabular">
              {formatPoints(r.points)} · {r.count} tx
            </span>
          </Card>
        ))}
      </div>
      <h2 className="mt-6 text-sm font-semibold">Revenue by source</h2>
      <p className="text-xs text-subtle">Empty until campaigns record spend.</p>
      <div className="mt-2 space-y-2">
        {(q.data?.revenueBySource ?? []).length === 0 ? (
          <p className="text-sm text-muted">No revenue records yet.</p>
        ) : (
          q.data!.revenueBySource.map((r) => (
            <Card key={r.source} className="flex justify-between text-sm">
              <span>{r.source}</span>
              <span>
                {formatPkr(r.gross)} gross · {formatPkr(r.platform)} platform
              </span>
            </Card>
          ))
        )}
      </div>
    </AdminShell>
  );
}
