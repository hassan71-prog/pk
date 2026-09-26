import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  adminSaveSettings,
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
  const [rate, setRate] = useState("0.02");
  const [opensAtLocal, setOpensAtLocal] = useState("");

  const withdrawalStatus = useQuery({
    queryKey: ["admin-withdrawal-status"],
    queryFn: () => adminGetWithdrawalStatus(),
  });

  useEffect(() => {
    if (withdrawalStatus.data?.pointsToPkr) setRate(String(withdrawalStatus.data.pointsToPkr));
    if (withdrawalStatus.data?.opensAt) {
      // datetime-local needs YYYY-MM-DDTHH:mm
      const d = new Date(withdrawalStatus.data.opensAt);
      if (Number.isFinite(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, "0");
        const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setOpensAtLocal(local);
      }
    }
  }, [withdrawalStatus.data]);

  const saveConfig = useMutation({
    mutationFn: async (p: { open?: boolean; opensAt?: string | null; pointsToPkr?: string }) => {
      // 1) Rate + schedule via settings (same as Settings page — more reliable)
      const entries: Record<string, string> = {};
      if (p.pointsToPkr !== undefined) entries.points_to_pkr = String(p.pointsToPkr);
      if (p.opensAt !== undefined) entries.withdrawals_opens_at = p.opensAt?.trim() || "";
      if (Object.keys(entries).length > 0) {
        await adminSaveSettings({ data: { entries } });
      }
      // 2) Open flag via dedicated endpoint
      if (typeof p.open === "boolean") {
        await adminSetWithdrawalStatus({ data: { open: p.open } });
      } else if (Object.keys(entries).length === 0) {
        // nothing else — still call set with full payload for compatibility
        await adminSetWithdrawalStatus({ data: p });
      }
      return { ok: true };
    },
    onSuccess: () => {
      toast.success("Saved");
      void qc.invalidateQueries({ queryKey: ["admin-withdrawal-status"] });
    },
    onError: (e) => {
      const msg = errorMessage(e);
      if (msg === "Unauthorized" || /unauthorized/i.test(msg)) {
        toast.error("Session expired — dobara login karke Admin kholo, phir Save karo.");
      } else {
        toast.error(msg);
      }
    },
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
  const rateNum = Number(rate) || 0;

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

  function saveSchedule() {
    const iso = opensAtLocal ? new Date(opensAtLocal).toISOString() : null;
    saveConfig.mutate({
      pointsToPkr: rate,
      opensAt: iso,
    });
  }

  return (
    <AdminShell title="Withdrawals">
      <Card className="mb-4 space-y-3">
        <p className="font-medium">Withdraw config</p>
        <p className="text-sm text-muted">
          Status:{" "}
          {withdrawalStatus.data?.comingSoon
            ? "Coming soon (scheduled)"
            : withdrawalStatus.data?.open
              ? "Open for users"
              : "Closed"}
          {withdrawalStatus.data?.opensAt
            ? ` · Opens at ${new Date(withdrawalStatus.data.opensAt).toLocaleString("en-PK")}`
            : ""}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-xs text-muted">1 point = PKR</span>
            <Input
              className="mt-1"
              type="number"
              step="0.001"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <span className="mt-1 block text-[11px] text-subtle">
              Example: 1000 pts = Rs {(1000 * rateNum).toFixed(2)}
            </span>
          </label>
          <label className="block text-sm">
            <span className="text-xs text-muted">Open date & time (local)</span>
            <Input
              className="mt-1"
              type="datetime-local"
              value={opensAtLocal}
              onChange={(e) => setOpensAtLocal(e.target.value)}
            />
            <span className="mt-1 block text-[11px] text-subtle">
              Before this time users see “Coming soon”
            </span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={saveSchedule} disabled={saveConfig.isPending}>
            Save rate & schedule
          </Button>
          <Button
            size="sm"
            variant={withdrawalStatus.data?.flagOpen ? "danger" : "default"}
            disabled={saveConfig.isPending}
            onClick={() => saveConfig.mutate({ open: !withdrawalStatus.data?.flagOpen })}
          >
            {withdrawalStatus.data?.flagOpen ? "Force close" : "Force open flag"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setOpensAtLocal("");
              saveConfig.mutate({ opensAt: null });
            }}
          >
            Clear schedule
          </Button>
        </div>
      </Card>

      <div className="mb-3 flex flex-wrap gap-1">
        {(["all", "pending", "approved", "processing", "paid", "rejected"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "secondary"} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>

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
        Account details are visible here only. PKR shown using rate 1 pt = Rs {rateNum || "—"}.
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
                      {rateNum > 0 ? (
                        <span className="ml-1 text-xs text-muted">
                          (≈ Rs {(w.points * rateNum).toFixed(2)})
                        </span>
                      ) : null}
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
