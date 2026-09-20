import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminListWithdrawals, adminUpdateWithdrawal } from "@/lib/server/admin.functions";
import { errorMessage, formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/withdrawals")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-wd"], queryFn: () => adminListWithdrawals() });
  const upd = useMutation({
    mutationFn: (p: { id: number; status: "approved" | "processing" | "paid" | "rejected" }) =>
      adminUpdateWithdrawal({ data: p }),
    onSuccess: () => {
      toast.success("Updated");
      void qc.invalidateQueries({ queryKey: ["admin-wd"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <AdminShell title="Withdrawals">
      <p className="mb-3 text-sm text-muted">
        Account details are visible here only. They never appear on public leaderboards.
      </p>
      <div className="space-y-3">
        {(list.data ?? []).map((w) => (
          <Card key={w.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">
                  {w.displayName} · {formatPoints(w.points)} pts
                </p>
                <p className="text-xs text-muted">
                  {w.paymentMethod} · {w.accountDetails} · {timeAgo(w.createdAt)}
                </p>
              </div>
              <Badge>{w.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {w.status === "pending" ? (
                <>
                  <Button size="sm" onClick={() => upd.mutate({ id: w.id, status: "approved" })}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => upd.mutate({ id: w.id, status: "rejected" })}>
                    Reject
                  </Button>
                </>
              ) : null}
              {w.status === "approved" ? (
                <Button size="sm" onClick={() => upd.mutate({ id: w.id, status: "processing" })}>
                  Mark processing
                </Button>
              ) : null}
              {w.status === "processing" ? (
                <Button size="sm" onClick={() => upd.mutate({ id: w.id, status: "paid" })}>
                  Mark paid
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
