import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminListUsers, adminSetAdminFlag } from "@/lib/server/admin.functions";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/admin/admins")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const users = useQuery({ queryKey: ["admin-users", ""], queryFn: () => adminListUsers({ data: { q: "" } }) });
  const set = useMutation({
    mutationFn: (p: { userId: string; isAdmin: boolean }) => adminSetAdminFlag({ data: p }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <AdminShell title="Admins">
      <p className="mb-3 text-sm text-muted">The first real account is granted admin automatically.</p>
      <div className="space-y-2">
        {(users.data ?? [])
          .filter((u) => !u.isDemo)
          .map((u) => (
            <div key={u.userId} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div>
                <p className="text-sm font-medium">{u.displayName}</p>
                {u.isAdmin ? <Badge tone="primary">admin</Badge> : <Badge>member</Badge>}
              </div>
              <Button size="sm" variant="secondary" onClick={() => set.mutate({ userId: u.userId, isAdmin: !u.isAdmin })}>
                {u.isAdmin ? "Revoke" : "Make admin"}
              </Button>
            </div>
          ))}
      </div>
    </AdminShell>
  );
}
