import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminBulkUpdateWithdrawals,
  adminGetWithdrawalStatus,
  adminListWithdrawals,
  adminSetWithdrawalStatus,
  adminUpdateWithdrawal,
} from "@/lib/server/admin.functions";
import { errorMessage, formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/withdrawals")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "processing" | "paid" | "rejected">("all");

  const withdrawalStatus = useQuery({
    queryKey: ["admin-withdrawal-status"],
    queryFn: () => adminGetWithdrawalStatus(),
  });
  const toggleWithdrawal = useMutation({
    mutationFn: (open: boolean) => adminSetWithdrawalStatus({ data: { open } }),
    onSuccess: () => {
      toast.success("Withdrawal setting updated");
      void qc.invalidateQueries({ queryKey: ["admin-withdrawal-status"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const list = useQuery({ queryKey: ["admin-wd"], queryFn: () => adminListWithdrawals() });

  const upd = useMutation({
    mutationFn: (p: { id: number; status: "approved" | "processing" | "paid" | "rejected"; note?: string }) =>
      adminUpdateWithdrawal({ data: p }),
    onSuccess: () => {
      toast.success("Updated");
      void qc.invalidateQueries({ queryKey: ["admin-wd"] });
      setSelected(new Set());
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const bulk = useMutation({
    mutationFn: (p: { ids: number[]; status: "approved" | "rejected"; note?: string }) =>
      adminBulkUpdateWithdrawals({ data: p }),
    onSuccess: (r) => {
      toast.success(`Done: ${r.ok} ok, ${r.failed} failed`);
      void qc.invalidateQueries({ queryKey: ["admin-wd"] });
      setSelected(new Set());
      setNote("");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const all = list.data ?? [];
  const filtered = filter === "all" ? all : all.filter((w) => w.status === filter);
  const pendingIds = filtered.filter((w) => w.status === "pending").map((w) => w.id);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPending() {
    if (selected.size === pendingIds.length && pendingIds.every((id) => selected.has(id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingIds));
    }
  }

  return (
    <AdminShell title="Withdrawals">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border p-3">
        <div>
          <p className="font-medium">Withdrawals</p>
          <p className="text-sm text-muted">
            {withdrawalStatus.data?.open
              ? "Users can submit withdrawal requests."
              : "Users cannot submit withdrawal requests."}
          </p>
        </div>
        <Button
          size="sm"
          variant={withdrawalStatus.data?.open ? "danger" : "default"}
          disabled={toggleWithdrawal.isPending}
          onClick={() => toggleWithdrawal.mutate(!withdrawalStatus.data?.open)}
        >
          {withdrawalStatus.data?.open ? "Close Withdrawals" : "Open Withdrawals"}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap gap-1">
        {(["all", "pending", "approved", "processing", "paid", "rejected"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "secondary"} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 ? (
        <Card className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <Input
            className="max-w-xs"
            placeholder="Note (shown to user on reject)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={bulk.isPending}
              onClick={() =>
                bulk.mutate({ ids: Array.from(selected), status: "approved", note: note || undefined })
              }
            >
              Bulk Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={bulk.isPending}
              onClick={() =>
                bulk.mutate({ ids: Array.from(selected), status: "rejected", note: note || undefined })
              }
            >
              Bulk Reject
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mb-3">
          <Button size="sm" variant="secondary" onClick={toggleAllPending} disabled={pendingIds.length === 0}>
            Select all pending ({pendingIds.length})
          </Button>
        </div>
      )}

      <p className="mb-3 text-sm text-muted">
        Account details are visible here only. They never appear on public leaderboards.
      </p>

      <div className="space-y-3">
        {filtered.map((w) => (
          <Card key={w.id}>
            <div className="flex items-start gap-3">
              {w.status === "pending" ? (
                <input
                  type="checkbox"
                  className="mt-1 size-4"
                  checked={selected.has(w.id)}
                  onChange={() => toggle(w.id)}
                />
              ) : (
                <div className="size-4" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {w.displayName} · {formatPoints(w.points)} pts
                    </p>
                    <p className="text-xs text-muted break-all">
                      {w.paymentMethod} · {w.accountDetails} · {timeAgo(w.createdAt)}
                    </p>
                    {w.adminNote ? <p className="mt-1 text-xs text-subtle">Note: {w.adminNote}</p> : null}
                  </div>
                  <Badge>{w.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {w.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => upd.mutate({ id: w.id, status: "approved", note: note || undefined })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => upd.mutate({ id: w.id, status: "rejected", note: note || undefined })}
                      >
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
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 ? <p className="text-sm text-muted">No withdrawals in this filter.</p> : null}
      </div>
    </AdminShell>
  );
}
