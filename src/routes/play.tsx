import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDashboard, getScratchStatus, scratchDaily } from "@/lib/server/user.functions";
import { errorMessage, formatPoints } from "@/lib/utils";
import { haptic } from "@/lib/telegram";

export const Route = createFileRoute("/play")({ component: PlayPage });

function PlayPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: {} }),
  });
  const status = useQuery({
    queryKey: ["scratch-status"],
    enabled: !!user,
    queryFn: () => getScratchStatus(),
  });
  const scratch = useMutation({
    mutationFn: () => scratchDaily(),
    onSuccess: (res) => {
      setRevealed(true);
      setResult(res.points);
      haptic("medium");
      if (res.points > 0) toast.success(`+${res.points} points!`);
      else toast.message("Better luck — 0 points. Kal free card dobara.");
      void qc.invalidateQueries();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (isPending)
    return (
      <AppShell title="Play">
        <Skeleton className="h-40 rounded-xl" />
      </AppShell>
    );
  if (!user) return <RedirectToSignIn />;

  const used = status.data?.usedToday;

  return (
    <AppShell title="Play" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <Card className="rounded-2xl border-primary/25 bg-gradient-to-b from-primary/10 to-surface p-5 text-center">
        <p className="text-sm font-bold">Daily Scratch Card</p>
        <p className="mt-1 text-xs text-muted">Roz 1 free card — random coins</p>
        <button
          type="button"
          disabled={used || scratch.isPending || status.data?.enabled === false}
          onClick={() => {
            if (used || revealed) return;
            scratch.mutate();
          }}
          className="relative mx-auto mt-5 flex h-36 w-full max-w-xs items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/40 bg-surface-2"
        >
          {!revealed && !used ? (
            <span className="text-lg font-bold text-primary">
              {scratch.isPending ? "Scratching…" : "Tap to scratch"}
            </span>
          ) : (
            <span className="text-3xl font-black text-primary">
              {result != null ? (result > 0 ? `🪙 +${result}` : "Try tomorrow") : used ? `🪙 +${status.data?.todayPoints ?? 0}` : ""}
            </span>
          )}
        </button>
        <p className="mt-3 text-[11px] text-subtle">
          {used || revealed ? "Aaj ka card use ho chuka" : "Ek dafa free — kal dobara"}
        </p>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link to="/">
          <Card className="p-4 text-center active:bg-surface-2">
            <p className="text-2xl">🎡</p>
            <p className="mt-1 text-xs font-semibold">Lucky Spin</p>
            <p className="text-[10px] text-muted">Home pe</p>
          </Card>
        </Link>
        <Link to="/friends">
          <Card className="p-4 text-center active:bg-surface-2">
            <p className="text-2xl">🎁</p>
            <p className="mt-1 text-xs font-semibold">Invite & Gifts</p>
            <p className="text-[10px] text-muted">Contest</p>
          </Card>
        </Link>
      </div>

      <Card className="mt-4 p-4">
        <p className="text-xs font-semibold">Prize pool</p>
        <p className="mt-1 text-[11px] text-muted">
          {(status.data?.prizes ?? [0, 5, 10, 20, 50, 100]).map((p) => (p === 0 ? "0" : p)).join(" · ")} pts
        </p>
        <p className="mt-2 text-[11px] text-subtle">
          Points platform rewards hain — cash guarantee nahi.
        </p>
      </Card>
    </AppShell>
  );
}
