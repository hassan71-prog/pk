import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Input } from "@/components/ui/input";
import { adminListAudit } from "@/lib/server/admin.functions";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/audit")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const list = useQuery({ queryKey: ["admin-audit"], queryFn: () => adminListAudit() });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list.data ?? [];
    return (list.data ?? []).filter(
      (r) =>
        r.action.toLowerCase().includes(term) ||
        r.actor.toLowerCase().includes(term) ||
        (r.detail ?? "").toLowerCase().includes(term) ||
        r.entityType.toLowerCase().includes(term),
    );
  }, [list.data, q]);

  return (
    <AdminShell title="Audit log">
      <Input
        placeholder="Search action, actor, detail"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4 max-w-sm"
      />
      <div className="space-y-2 text-sm">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="font-medium">{r.action}</p>
            <p className="text-xs text-muted">
              {r.actor} · {r.entityType} {r.entityId} · {timeAgo(r.createdAt)}
            </p>
            {r.detail ? <p className="mt-1 text-xs text-subtle">{r.detail}</p> : null}
          </div>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-muted">No audit entries.</p> : null}
      </div>
    </AdminShell>
  );
}
