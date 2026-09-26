import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDashboard, getLeaderboard } from "@/lib/server/user.functions";
import { cn, formatPoints, initials } from "@/lib/utils";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/ranks")({ component: RanksPage });

const PERIODS = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "all", label: "All-time" },
] as const;

function Avatar({
  name,
  url,
  size = "md",
  ring,
}: {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
  ring?: string;
}) {
  const sz = size === "lg" ? "size-16" : size === "sm" ? "size-9" : "size-12";
  return (
    <div
      className={cn(
        "grid place-items-center overflow-hidden rounded-full bg-surface-2 text-xs font-bold",
        sz,
        ring,
      )}
    >
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}

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

  if (isPending)
    return (
      <AppShell title="Ranks">
        <Skeleton className="h-40 rounded-xl" />
      </AppShell>
    );
  if (!user) return <RedirectToSignIn />;

  const entries = board.data?.entries ?? [];
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];
  const rest = entries.slice(3);

  return (
    <AppShell title="Leaderboard" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface p-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={cn(
              "rounded-lg py-2 text-xs font-semibold",
              period === p.id ? "bg-primary text-primary-fg shadow-[0_0_12px_rgba(34,197,94,0.35)]" : "text-muted",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="mt-6 flex items-end justify-center gap-2 px-1">
        {/* 2nd */}
        <div className="flex w-[30%] flex-col items-center">
          {top2 ? (
            <>
              <Avatar name={top2.displayName} url={top2.avatarUrl} ring="ring-2 ring-slate-400" />
              <p className="mt-1.5 max-w-full truncate text-center text-[11px] font-medium">{top2.displayName}</p>
              <p className="text-[10px] font-semibold text-primary tabular">{formatPoints(top2.points)}</p>
            </>
          ) : (
            <div className="size-12 rounded-full bg-surface-2" />
          )}
          <div className="podium-2 mt-2 flex h-16 w-full items-start justify-center rounded-t-xl pt-2 text-lg font-black text-white">
            2
          </div>
        </div>
        {/* 1st */}
        <div className="flex w-[34%] flex-col items-center">
          <Crown className="mb-1 size-5 text-warning" />
          {top1 ? (
            <>
              <Avatar
                name={top1.displayName}
                url={top1.avatarUrl}
                size="lg"
                ring="ring-2 ring-primary shadow-[0_0_16px_rgba(34,197,94,0.5)]"
              />
              <p className="mt-1.5 max-w-full truncate text-center text-xs font-semibold">{top1.displayName}</p>
              <p className="text-[11px] font-bold text-primary tabular">{formatPoints(top1.points)}</p>
            </>
          ) : (
            <div className="size-16 rounded-full bg-surface-2" />
          )}
          <div className="podium-1 mt-2 flex h-24 w-full items-start justify-center rounded-t-xl pt-2 text-2xl font-black text-white">
            1
          </div>
        </div>
        {/* 3rd */}
        <div className="flex w-[30%] flex-col items-center">
          {top3 ? (
            <>
              <Avatar name={top3.displayName} url={top3.avatarUrl} ring="ring-2 ring-amber-700" />
              <p className="mt-1.5 max-w-full truncate text-center text-[11px] font-medium">{top3.displayName}</p>
              <p className="text-[10px] font-semibold text-primary tabular">{formatPoints(top3.points)}</p>
            </>
          ) : (
            <div className="size-12 rounded-full bg-surface-2" />
          )}
          <div className="podium-3 mt-2 flex h-12 w-full items-start justify-center rounded-t-xl pt-1.5 text-lg font-black text-white">
            3
          </div>
        </div>
      </div>

      {board.data?.you ? (
        <Card className="mt-4 flex items-center justify-between border-primary/30 bg-primary/5">
          <div>
            <p className="text-[11px] text-muted">Your rank</p>
            <p className="text-lg font-bold tabular text-primary">#{board.data.you.rank}</p>
          </div>
          <p className="text-sm font-semibold tabular">{formatPoints(board.data.you.points)} pts</p>
        </Card>
      ) : null}

      <div className="mt-4 space-y-2">
        {board.isPending ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : rest.length === 0 && !top1 ? (
          <Card className="text-sm text-muted">No rankings yet — complete tasks to appear here.</Card>
        ) : (
          rest.map((e) => (
            <div
              key={e.userId}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5",
                e.isYou && "border-primary/40 bg-primary/5",
              )}
            >
              <span className="w-6 text-center text-xs font-bold text-muted tabular">{e.rank}</span>
              <Avatar name={e.displayName} url={e.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {e.displayName}
                  {e.isYou ? " (you)" : ""}
                </p>
              </div>
              <span className="text-sm font-semibold text-primary tabular">{formatPoints(e.points)}</span>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
