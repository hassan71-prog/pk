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
  adminAdjustPoints,
  adminGetUserDetail,
  adminListUsers,
  adminSetUserStatus,
} from "@/lib/server/admin.functions";
import { errorMessage, formatPoints, timeAgo } from "@/lib/utils";
import { TX_LABELS } from "@/lib/types";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended" | "banned">("all");
  const [page, setPage] = useState(0);
  const [amount, setAmount] = useState("100");
  const [reason, setReason] = useState("Manual adjustment");
  const [detailId, setDetailId] = useState<string | null>(null);

  const users = useQuery({
    queryKey: ["admin-users", q, status, page],
    queryFn: () => adminListUsers({ data: { q, status, page, pageSize: 40 } }),
  });

  const detail = useQuery({
    queryKey: ["admin-user-detail", detailId],
    enabled: !!detailId,
    queryFn: () => adminGetUserDetail({ data: { userId: detailId! } }),
  });

  const statusMut = useMutation({
    mutationFn: (p: { userId: string; status: "active" | "suspended" | "banned" }) =>
      adminSetUserStatus({ data: p }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
      void qc.invalidateQueries({ queryKey: ["admin-user-detail"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const adj = useMutation({
    mutationFn: (userId: string) =>
      adminAdjustPoints({ data: { userId, amount: Number(amount), reason } }),
    onSuccess: () => {
      toast.success("Ledger updated");
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
      void qc.invalidateQueries({ queryKey: ["admin-user-detail"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const total = users.data?.total ?? 0;
  const pageSize = users.data?.pageSize ?? 40;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const list = users.data?.users ?? [];

  return (
    <AdminShell title="Users">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search name, id, code"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-1">
          {(["all", "active", "suspended", "banned"] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={status === s ? "default" : "secondary"}
              onClick={() => {
                setStatus(s);
                setPage(0);
              }}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Input className="w-28" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Pts" />
        <Input className="max-w-xs" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
      </div>

      <p className="mt-2 text-xs text-muted">
        {total} users · page {page + 1}/{totalPages}
      </p>

      {/* Table / cards */}
      <div className="mt-3 space-y-2 md:hidden">
        {list.map((u) => (
          <Card key={u.userId} className="space-y-2">
            <button type="button" className="w-full text-left" onClick={() => setDetailId(u.userId)}>
              <p className="font-medium">{u.displayName}</p>
              <p className="text-xs text-subtle">{u.referralCode}</p>
            </button>
            <div className="flex items-center justify-between">
              <span className="tabular text-sm">{formatPoints(u.points)} pts</span>
              <Badge>{u.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="secondary" onClick={() => adj.mutate(u.userId)}>
                Adjust
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  statusMut.mutate({
                    userId: u.userId,
                    status: u.status === "active" ? "suspended" : "active",
                  })
                }
              >
                {u.status === "active" ? "Suspend" : "Activate"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDetailId(u.userId)}>
                Detail
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="py-2">Member</th>
              <th>Points</th>
              <th>Earned</th>
              <th>Tasks</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.userId} className="border-t border-border">
                <td className="py-2">
                  <button type="button" className="text-left" onClick={() => setDetailId(u.userId)}>
                    <p className="font-medium hover:text-primary">{u.displayName}</p>
                    <p className="text-xs text-subtle">{u.referralCode}</p>
                  </button>
                </td>
                <td className="tabular">{formatPoints(u.points)}</td>
                <td className="tabular text-muted">{formatPoints(u.earned)}</td>
                <td className="tabular text-muted">{u.tasks}</td>
                <td>
                  <Badge>{u.status}</Badge>
                  {u.isAdmin ? (
                    <Badge tone="primary" className="ml-1">
                      admin
                    </Badge>
                  ) : null}
                </td>
                <td className="space-x-1 whitespace-nowrap">
                  <Button size="sm" variant="secondary" onClick={() => adj.mutate(u.userId)}>
                    Adjust
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      statusMut.mutate({
                        userId: u.userId,
                        status: u.status === "active" ? "suspended" : "active",
                      })
                    }
                  >
                    {u.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDetailId(u.userId)}>
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <Button size="sm" variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Prev
        </Button>
        <span className="text-xs text-muted">
          {page + 1} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="secondary"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* User detail modal */}
      {detailId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-bg p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">User detail</h2>
              <Button size="sm" variant="ghost" onClick={() => setDetailId(null)}>
                Close
              </Button>
            </div>
            {detail.isPending ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : detail.data ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-base font-medium">{detail.data.displayName}</p>
                  <p className="text-xs text-muted">
                    {detail.data.referralCode} · {detail.data.userId.slice(0, 12)}…
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Card>
                    <p className="text-xs text-muted">Balance</p>
                    <p className="font-semibold tabular">{formatPoints(detail.data.points)}</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-muted">Earned</p>
                    <p className="font-semibold tabular">{formatPoints(detail.data.earned)}</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-muted">Tasks</p>
                    <p className="font-semibold tabular">{detail.data.tasks}</p>
                  </Card>
                  <Card>
                    <p className="text-xs text-muted">Referrals</p>
                    <p className="font-semibold tabular">{detail.data.referralCount}</p>
                  </Card>
                </div>
                <p className="text-xs text-muted">
                  Status: <Badge>{detail.data.status}</Badge>
                  {detail.data.isAdmin ? " · Admin" : ""} · Joined {timeAgo(detail.data.createdAt)}
                </p>

                <div>
                  <p className="mb-1 text-xs font-medium text-muted">Recent ledger</p>
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {detail.data.transactions.map((t) => (
                      <div key={t.id} className="flex justify-between text-xs">
                        <span>{TX_LABELS[t.type] ?? t.type}</span>
                        <span className={t.amount >= 0 ? "text-success" : "text-danger"}>
                          {t.amount >= 0 ? "+" : ""}
                          {formatPoints(t.amount)}
                        </span>
                      </div>
                    ))}
                    {detail.data.transactions.length === 0 ? (
                      <p className="text-xs text-subtle">No transactions</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs font-medium text-muted">Withdrawals</p>
                  <div className="max-h-28 space-y-1 overflow-y-auto">
                    {detail.data.withdrawals.map((w) => (
                      <div key={w.id} className="flex justify-between text-xs">
                        <span>
                          {formatPoints(w.points)} · {w.paymentMethod}
                        </span>
                        <Badge>{w.status}</Badge>
                      </div>
                    ))}
                    {detail.data.withdrawals.length === 0 ? (
                      <p className="text-xs text-subtle">None</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => adj.mutate(detail.data.userId)}>
                    Adjust points
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      statusMut.mutate({
                        userId: detail.data.userId,
                        status: detail.data.status === "active" ? "suspended" : "active",
                      })
                    }
                  >
                    {detail.data.status === "active" ? "Suspend" : "Activate"}
                  </Button>
                  {detail.data.status !== "banned" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        statusMut.mutate({ userId: detail.data.userId, status: "banned" })
                      }
                    >
                      Ban
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="text-sm text-danger">Failed to load</p>
            )}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
