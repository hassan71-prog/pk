import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { adminListTransactions } from "@/lib/server/admin.functions";
import { TX_LABELS } from "@/lib/types";
import { formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/transactions")({ component: Page });

function Page() {
  const q = useQuery({ queryKey: ["admin-tx"], queryFn: () => adminListTransactions() });
  return (
    <AdminShell title="Ledger">
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-muted">
          <tr>
            <th className="py-2">Member</th>
            <th>Type</th>
            <th>Amount</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          {(q.data ?? []).map((r) => (
            <tr key={r.id} className="border-t border-border">
              <td className="py-2">{r.displayName}</td>
              <td>{TX_LABELS[r.type] ?? r.type}</td>
              <td className={`tabular ${r.amount >= 0 ? "text-success" : "text-danger"}`}>
                {r.amount >= 0 ? "+" : ""}
                {formatPoints(r.amount)}
              </td>
              <td className="text-subtle">{timeAgo(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminShell>
  );
}
