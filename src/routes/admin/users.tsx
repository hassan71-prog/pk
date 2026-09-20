import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminAdjustPoints, adminListUsers, adminSetUserStatus } from "@/lib/server/admin.functions";
import { errorMessage, formatPoints } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("Manual adjustment");
  const users = useQuery({ queryKey: ["admin-users", q], queryFn: () => adminListUsers({ data: { q } }) });
  const status = useMutation({
    mutationFn: (p: { userId: string; status: "active" | "suspended" | "banned" }) => adminSetUserStatus({ data: p }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-users"] }),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const adj = useMutation({
    mutationFn: (userId: string) =>
      adminAdjustPoints({ data: { userId, amount: Number(amount), reason } }),
    onSuccess: () => {
      toast.success("Ledger updated");
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <AdminShell title="Users">
      <Input placeholder="Search name, id, code" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Input className="w-28" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input className="max-w-xs" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2">Member</th>
              <th>Points</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(users.data ?? []).map((u) => (
              <tr key={u.userId} className="border-t border-border">
                <td className="py-2">
                  <p className="font-medium">{u.displayName}</p>
                  <p className="text-xs text-subtle">{u.isDemo ? "Sample" : u.referralCode}</p>
                </td>
                <td className="tabular">{formatPoints(u.points)}</td>
                <td>
                  <Badge>{u.status}</Badge>
                  {u.isAdmin ? <Badge tone="primary" className="ml-1">admin</Badge> : null}
                </td>
                <td className="space-x-1 whitespace-nowrap">
                  {!u.isDemo ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => adj.mutate(u.userId)}>
                        Adjust
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => status.mutate({ userId: u.userId, status: u.status === "active" ? "suspended" : "active" })}>
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
