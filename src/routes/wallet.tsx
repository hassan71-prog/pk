import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cancelWithdrawal, createWithdrawal, getWallet } from "@/lib/server/user.functions";
import { TX_LABELS } from "@/lib/types";
import { errorMessage, formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

function WalletPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<number | null>(null);
  const [method, setMethod] = useState<"easypaisa" | "jazzcash" | "bank" | "voucher">("easypaisa");
  const [account, setAccount] = useState("");
  const wallet = useQuery({
    queryKey: ["wallet"],
    enabled: !!user,
    queryFn: () => getWallet(),
  });
  const redeem = useMutation({
    mutationFn: () =>
      createWithdrawal({
        data: { rewardId: selected!, paymentMethod: method, accountDetails: account },
      }),
    onSuccess: () => {
      toast.success("Redemption submitted for review");
      setAccount("");
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const cancel = useMutation({
    mutationFn: (id: number) => cancelWithdrawal({ data: { id } }),
    onSuccess: () => {
      toast.success("Request cancelled. Points returned.");
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (isPending) return <AppShell title="Wallet"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;
  const w = wallet.data;

  return (
    <AppShell title="Wallet" points={w?.profile.pointsBalance}>
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <p className="text-xs text-muted">Balance</p>
          <p className="text-xl font-semibold tabular">{formatPoints(w?.profile.pointsBalance ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Lifetime earned</p>
          <p className="text-xl font-semibold tabular">{formatPoints(w?.profile.lifetimeEarned ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Redeemed</p>
          <p className="text-xl font-semibold tabular">{formatPoints(w?.profile.lifetimeRedeemed ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Pending</p>
          <p className="text-xl font-semibold tabular">{formatPoints(w?.pendingPoints ?? 0)}</p>
        </Card>
      </div>
      {w ? (
        <Card className="mt-4 space-y-1">
          <p className="text-xs text-muted">Conversion rate</p>
          <p className="text-sm font-medium">
            1 point = Rs {Number(w.pointsToPkr ?? 0.02).toFixed(3)}
          </p>
          <p className="text-xs text-subtle">
            Your balance ≈ Rs{" "}
            {(Number(w.profile.pointsBalance) * Number(w.pointsToPkr ?? 0.02)).toFixed(2)}
          </p>
        </Card>
      ) : null}

      {w?.comingSoon ? (
        <Card className="mt-3 border-warning/40 bg-warning/5">
          <p className="text-sm font-semibold text-warning">Withdrawals coming soon</p>
          <p className="mt-1 text-xs text-muted">
            {w.opensAt
              ? `Opens ${new Date(w.opensAt).toLocaleString("en-PK", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })} (PKT)`
              : "Admin will open withdrawals soon."}
          </p>
        </Card>
      ) : w && !w.withdrawalsEnabled ? (
        <Card className="mt-3">
          <p className="text-sm font-medium">Withdrawals closed</p>
          <p className="mt-1 text-xs text-muted">Please check back later.</p>
        </Card>
      ) : null}

      <Disclaimer className="mt-4" />

      <h2 className="mt-6 text-sm font-semibold">Rewards catalogue</h2>
      <p className="mt-1 text-xs text-subtle">
        Minimum {formatPoints(w?.minWithdrawal ?? 1000)} points. Admin approval required. Not an
        automatic cash conversion.
      </p>
      <div className="mt-3 space-y-2">
        {(w?.rewards ?? []).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              setSelected(r.id);
              setMethod(r.paymentMethod as typeof method);
            }}
            className={`w-full rounded-xl border p-4 text-left ${selected === r.id ? "border-primary bg-primary/10" : "border-border bg-surface"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="mt-1 text-xs text-muted">{r.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular">{formatPoints(r.pointsCost)} pts</p>
                {w?.pointsToPkr ? (
                  <p className="text-[11px] text-muted">
                    ≈ Rs {(r.pointsCost * Number(w.pointsToPkr)).toFixed(2)}
                  </p>
                ) : null}
              </div>
            </div>
          </button>
        ))}
      </div>
      {selected ? (
        <Card className="mt-3 space-y-3">
          <p className="text-sm font-medium">Payout details</p>
          <div className="grid grid-cols-2 gap-2">
            {(["easypaisa", "jazzcash", "bank", "voucher"] as const).map((m) => (
              <Button key={m} size="sm" variant={method === m ? "default" : "secondary"} onClick={() => setMethod(m)}>
                {m}
              </Button>
            ))}
          </div>
          <Input
            placeholder={method === "bank" ? "IBAN / account title" : "Mobile account number"}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={
              redeem.isPending ||
              account.trim().length < 5 ||
              !w?.withdrawalsEnabled
            }
            onClick={() => redeem.mutate()}
          >
            {!w?.withdrawalsEnabled
              ? w?.comingSoon
                ? "Coming soon"
                : "Withdrawals closed"
              : "Request redemption"}
          </Button>
        </Card>
      ) : null}

      <h2 className="mt-6 text-sm font-semibold">Redemption requests</h2>
      <div className="mt-2 space-y-2">
        {(w?.withdrawals ?? []).length === 0 ? (
          <p className="text-sm text-muted">None yet.</p>
        ) : (
          w!.withdrawals.map((r) => {
            const steps = ["pending", "approved", "processing", "paid"] as const;
            const rejected = r.status === "rejected";
            const idx = rejected ? -1 : steps.indexOf(r.status as (typeof steps)[number]);
            return (
              <Card key={r.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{r.rewardTitle ?? "Reward"}</p>
                  <Badge tone={rejected ? "danger" : r.status === "paid" ? "success" : "muted"}>
                    {r.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatPoints(r.points)} pts · {r.paymentMethod} · {r.accountMasked}
                </p>
                <p className="mt-0.5 text-[11px] text-subtle">{timeAgo(r.createdAt)}</p>
                {!rejected ? (
                  <div className="mt-3 flex items-center gap-1">
                    {steps.map((s, i) => (
                      <div key={s} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className={`h-1.5 w-full rounded-full ${
                            i <= idx ? "bg-primary" : "bg-surface-2"
                          }`}
                        />
                        <span className="text-[9px] capitalize text-muted">{s}</span>
                      </div>
                    ))}
                  </div>
                ) : r.adminNote ? (
                  <p className="mt-2 text-xs text-danger">{r.adminNote}</p>
                ) : null}
                {r.status === "pending" ? (
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => cancel.mutate(r.id)}>
                    Cancel
                  </Button>
                ) : null}
              </Card>
            );
          })
        )}
      </div>

      <h2 className="mt-6 text-sm font-semibold">Ledger</h2>
      <div className="mt-2 space-y-2">
        {(w?.transactions ?? []).map((tx) => (
          <div key={tx.id} className="flex items-center justify-between text-sm">
            <div>
              <p>{TX_LABELS[tx.type] ?? tx.type}</p>
              <p className="text-xs text-subtle">{timeAgo(tx.createdAt)}</p>
            </div>
            <span className={`tabular ${tx.amount >= 0 ? "text-success" : "text-danger"}`}>
              {tx.amount >= 0 ? "+" : ""}
              {formatPoints(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
