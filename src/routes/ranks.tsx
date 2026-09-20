import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDashboard, getLeaderboard } from "@/lib/server/user.functions";
import { formatPoints, initials } from "@/lib/utils";

export const Route = createFileRoute("/ranks")({ component: RanksPage });

const PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "all", label: "All-time" },
] as const;

function RanksPage() {
  const { user, isPending } = useCurrentUserState();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["id"]>("all");
  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: {} }),
  });
  const board = useQuery({
    queryKey: ["leaderboard", period],
    enabled: !!user,
    queryFn: () => getLeaderboard({ data: { period } }),
  });

  if (isPending) return <AppShell title="Ranks"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;

  return (
    <AppShell title="Ranks" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <p className="text-sm text-muted">
        Ranked by points earned in the selected window. Sample rows are labelled and are not real
        accounts.
      </p>
      <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-surface p-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={`rounded-md py-2 text-xs font-medium ${period === p.id ? "bg-primary text-primary-fg" : "text-muted"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {board.data?.you ? (
        <Card className="mt-4 flex items-center justify-between border-primary/40">
          <div>
            <p className="text-xs text-muted">Your rank</p>
            <p className="text-lg font-semibold tabular">#{board.data.you.rank}</p>
          </div>
          <p className="text-sm font-medium tabular">{formatPoints(board.data.you.points)} pts</p>
        </Card>
      ) : null}
      <div className="mt-4 space-y-2">
        {board.isPending ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : (
          (board.data?.entries ?? []).map((e) => (
            <div
              key={e.userId}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${e.isYou ? "border-primary/50 bg-primary/10" : "border-border bg-surface"}`}
            >
              <span className="w-6 text-xs tabular text-muted">{e.rank}</span>
              {e.avatarUrl ? (
                <img src={e.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
              ) : (
                <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-medium">
                  {initials(e.displayName)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {e.isYou ? "You" : e.displayName}
                </p>
                {e.isDemo ? <Badge className="mt-0.5">Sample</Badge> : null}
              </div>
              <span className="text-sm font-semibold tabular">{formatPoints(e.points)}</span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
