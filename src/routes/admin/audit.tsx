import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { adminListAudit } from "@/lib/server/admin.functions";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/audit")({ component: Page });

function Page() {
  const q = useQuery({ queryKey: ["admin-audit"], queryFn: () => adminListAudit() });
  return (
    <AdminShell title="Audit log">
      <div className="space-y-2 text-sm">
        {(q.data ?? []).map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="font-medium">{r.action}</p>
            <p className="text-xs text-muted">
              {r.actor} · {r.entityType} {r.entityId} · {timeAgo(r.createdAt)}
            </p>
            {r.detail ? <p className="mt-1 text-xs text-subtle">{r.detail}</p> : null}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
