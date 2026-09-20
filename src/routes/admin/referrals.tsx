import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { adminListReferrals } from "@/lib/server/admin.functions";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/referrals")({ component: Page });

function Page() {
  const q = useQuery({ queryKey: ["admin-refs"], queryFn: () => adminListReferrals() });
  return (
    <AdminShell title="Referrals">
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
          {(q.data ?? []).map((r) => (
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
    </AdminShell>
  );
}
