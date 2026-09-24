import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListTransactions } from "@/lib/server/admin.functions";
import { TX_LABELS } from "@/lib/types";
import { formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/transactions")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const list = useQuery({
    queryKey: ["admin-tx", q, from, to],
    queryFn: () => adminListTransactions({ data: { q, from: from || undefined, to: to || undefined } }),
  });

  return (
    <AdminShell title="Ledger">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex-1">
          <label className="text-xs text-muted">Search</label>
          <Input
            placeholder="Name, type, note"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-0.5"
          />
        </div>
        <div>
          <label className="text-xs text-muted">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-0.5" />
        </div>
        <div>
          <label className="text-xs text-muted">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-0.5" />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {(list.data ?? []).map((r) => (
          <Card key={r.id} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{r.displayName}</p>
              <p className="text-xs text-muted">
                {TX_LABELS[r.type] ?? r.type} · {timeAgo(r.createdAt)}
              </p>
            </div>
            <span className={`tabular text-sm font-medium ${r.amount >= 0 ? "text-success" : "text-danger"}`}>
              {r.amount >= 0 ? "+" : ""}
              {formatPoints(r.amount)}
            </span>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2">Member</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {(list.data ?? []).map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2">{r.displayName}</td>
                <td>{TX_LABELS[r.type] ?? r.type}</td>
                <td className={`tabular ${r.amount >= 0 ? "text-success" : "text-danger"}`}>
                  {r.amount >= 0 ? "+" : ""}
                  {formatPoints(r.amount)}
                </td>
                <td className="max-w-[12rem] truncate text-muted">{r.note ?? "—"}</td>
                <td className="text-subtle">{timeAgo(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(list.data ?? []).length === 0 ? <p className="mt-4 text-sm text-muted">No transactions found.</p> : null}
    </AdminShell>
  );
}
