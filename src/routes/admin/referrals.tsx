import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListReferrals } from "@/lib/server/admin.functions";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/referrals")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const list = useQuery({ queryKey: ["admin-refs"], queryFn: () => adminListReferrals() });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list.data ?? [];
    return (list.data ?? []).filter(
      (r) =>
        r.referrer.toLowerCase().includes(term) ||
        r.referred.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term),
    );
  }, [list.data, q]);

  return (
    <AdminShell title="Referrals">
      <Input
        placeholder="Search referrer or referred"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 max-w-sm"
      />

      <div className="space-y-2 md:hidden">
        {filtered.map((r) => (
          <Card key={r.id}>
            <p className="text-sm font-medium">{r.referrer}</p>
            <p className="text-xs text-muted">→ {r.referred}</p>
            <div className="mt-1 flex items-center justify-between">
              <Badge>{r.status}</Badge>
              <span className="text-xs text-subtle">{timeAgo(r.createdAt)}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2">Referrer</th>
              <th>Referred</th>
              <th>Status</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="py-2">{r.referrer}</td>
                <td>{r.referred}</td>
                <td>
                  <Badge>{r.status}</Badge>
                </td>
                <td className="text-subtle">{timeAgo(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? <p className="mt-4 text-sm text-muted">No referrals found.</p> : null}
    </AdminShell>
  );
}
