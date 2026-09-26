import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Gift, ClipboardList, Users, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/app-shell";
import { SpinWheel } from "@/components/spin-wheel";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload, useCaptureReferral } from "@/lib/identity";
import {
  claimDaily,
  claimLeaderboardBonus,
  getDashboard,
  getLeaderboardBonusStatus,
  getSpinStatus,
  spinDaily,
} from "@/lib/server/user.functions";
import { haptic } from "@/lib/telegram";
import { TX_LABELS } from "@/lib/types";
import { errorMessage, formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  useCaptureReferral();
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <AppShell>
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="mt-4 h-40 w-full rounded-xl" />
      </AppShell>
    );
  }
  if (!user) return <Landing />;
  return <Dashboard />;
}

function Landing() {
  const [oauthBusy, setOauthBusy] = useState(false);

  async function onOAuth(providerId: string) {
    if (oauthBusy) return;
    setOauthBusy(true);
    try {
      await signIn(providerId, { callbackURL: "/" });
    } catch (err) {
      toast.error(errorMessage(err));
      setOauthBusy(false);
    }
  }

  return (
    <main className="app-bg mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <Logo />
      <h1 className="mt-10 font-display text-4xl font-semibold leading-[1.1] tracking-tight">
        Complete tasks. Earn coins. Rank up.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Pakistan ka rewards app — daily claim, tasks, leaderboard. Points platform rewards hain, cash ya investment nahi.
      </p>
      <div className="mt-8 space-y-3">
        {GROK_PROVIDERS.map((p) => (
          <Button
            key={p.providerId}
            className="w-full"
            variant={p.providerId === "google-grok" || p.providerId === "grok-google" ? "default" : "secondary"}
            disabled={oauthBusy}
            onClick={() => void onOAuth(p.providerId)}
          >
            {oauthBusy ? "Redirecting…" : `Continue with ${p.label}`}
          </Button>
        ))}
        <Button
          variant="outline"
          className="w-full"
          disabled={oauthBusy}
          onClick={() => (window.location.href = "/login")}
        >
          Email sign in
        </Button>
      </div>
      <Disclaimer className="mt-8" />
    </main>
  );
}

function Dashboard() {
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const dash = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard({ data: identityPayload(user) }),
  });
  const claim = useMutation({
    mutationFn: () => claimDaily(),
    onSuccess: (res) => {
      haptic("medium");
      const freeze = (res as { usedFreeze?: boolean }).usedFreeze ? " (streak freeze used)" : "";
      toast.success(`Daily reward: +${res.points} points${freeze}`);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const spinStatus = useQuery({
    queryKey: ["spin-status"],
    queryFn: () => getSpinStatus(),
  });
  const lbStatus = useQuery({
    queryKey: ["lb-bonus-status"],
    queryFn: () => getLeaderboardBonusStatus(),
  });
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const spin = useMutation({
    mutationFn: () => spinDaily(),
    onMutate: () => {
      setSpinning(true);
      setSpinResult(null);
    },
    onSuccess: (res) => {
      // keep spinning animation ~3s then show result
      window.setTimeout(() => {
        setSpinning(false);
        setSpinResult(res.points);
        haptic("medium");
        if (res.tryAgain || res.points === 0) {
          toast.message("Try again — wheel pe dobara spin karo!");
        } else {
          toast.success(`Lucky spin: +${res.points} coins!`);
          void qc.invalidateQueries();
        }
      }, 3200);
    },
    onError: (err) => {
      setSpinning(false);
      toast.error(errorMessage(err));
    },
  });
  const lbBonus = useMutation({
    mutationFn: () => claimLeaderboardBonus(),
    onSuccess: (res) => {
      toast.success(`Rank #${res.rank} bonus: +${res.points}`);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (dash.isPending || !dash.data) {
    return (
      <AppShell>
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </AppShell>
    );
  }
  if (dash.error) return <RedirectToSignIn />;

  const d = dash.data;
  const greet = (d.profile.displayName || user?.displayName || "Member").split(" ")[0];

  return (
    <AppShell points={d.profile.pointsBalance} unread={d.unread}>
      <p className="text-sm text-muted">Welcome back</p>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{greet}</h1>
        {(() => {
          const lv = levelFrom(d.profile.tasksCompleted, d.profile.lifetimeEarned);
          return (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
              {lv.name}
            </span>
          );
        })()}
      </div>
      {d.profile.dailyStreak > 0 ? (
        <p className="mt-1 text-xs text-warning">🔥 {d.profile.dailyStreak}-day streak</p>
      ) : null}

      {/* Balance chip */}
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Balance</p>
          <p className="font-display text-3xl font-bold tabular text-primary">
            {formatPoints(d.profile.pointsBalance)}
          </p>
        </div>
        <div className="coin-chip rounded-full px-3 py-1 text-xs">pts</div>
      </div>

      {/* Daily Reward — gift style */}
      <Card className="mt-4 overflow-hidden rounded-2xl border-primary/20 bg-gradient-to-b from-surface to-bg p-5 text-center">
        <p className="text-sm font-semibold tracking-wide text-fg">Daily Reward</p>
        <div className="gift-glow mx-auto mt-3 grid size-24 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-amber-400/20 text-5xl">
          🎁
        </div>
        <p className="mt-2 text-xs text-muted">
          {d.daily.claimed ? "Already claimed today — come back tomorrow" : `Open your day ${d.daily.dayNumber} reward`}
        </p>
        <Button
          className="mt-4 w-full rounded-xl text-base font-bold shadow-[0_0_20px_rgba(34,197,94,0.35)]"
          size="lg"
          disabled={d.daily.claimed || claim.isPending}
          onClick={() => claim.mutate()}
        >
          <Gift className="size-5" />
          {d.daily.claimed ? "Claimed today" : `Claim · +${d.daily.nextPoints}`}
        </Button>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {d.daily.schedule.map((pts, i) => {
            const day = i + 1;
            const done = d.daily.claimed ? day <= d.daily.dayNumber : day < d.daily.dayNumber;
            const current = day === d.daily.dayNumber;
            return (
              <div
                key={day}
                className={`rounded-xl border py-2 text-center ${
                  current
                    ? "border-primary bg-primary/15 text-primary"
                    : done
                      ? "border-border bg-surface text-success"
                      : "border-border bg-bg text-muted"
                }`}
              >
                <div className="text-[10px] font-medium">Day {day}</div>
                <div className="mt-0.5 text-[11px] font-bold tabular">🪙 {pts}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Lucky Spin Wheel */}
      <Card className="mt-3 rounded-2xl border-warning/30 bg-gradient-to-b from-amber-500/10 to-surface p-4">
        <p className="text-center text-sm font-bold">Lucky Spin 🎡</p>
        <p className="mb-3 text-center text-[11px] text-muted">
          {spinStatus.data?.usedToday
            ? `Aaj +${spinStatus.data.todayPoints} coins mil chuke — kal try again`
            : "Spin karo — coins ya Try Again"}
        </p>
        <SpinWheel
          prizes={spinStatus.data?.prizes ?? [0, 10, 20, 30, 50, 80, 100, 150]}
          spinning={spinning}
          resultPoints={spinResult}
          usedToday={spinStatus.data?.usedToday}
          disabled={spinStatus.data?.enabled === false}
          onSpin={() => spin.mutate()}
        />
      </Card>

      <Card className="mt-2 rounded-2xl p-3">
        <p className="text-xs font-semibold">Weekly rank bonus (Top 10)</p>
        <p className="mt-1 text-[11px] text-muted">
          {!lbStatus.data?.opensAt
            ? "Admin abhi date set nahi ki"
            : lbStatus.data.claimed
              ? "Is schedule ka bonus claim ho chuka"
              : lbStatus.data.open
                ? "Ab claim kar sakte ho (hafta mein 1 dafa)"
                : lbStatus.data.ended
                  ? "Window band — next schedule ka wait"
                  : `Opens ${new Date(lbStatus.data.opensAt).toLocaleString("en-PK")}`}
        </p>
        <Button
          variant="outline"
          className="mt-2 w-full text-xs"
          disabled={lbBonus.isPending || !lbStatus.data?.open || lbStatus.data?.claimed}
          onClick={() => lbBonus.mutate()}
        >
          {lbBonus.isPending ? "Claiming…" : "Claim rank bonus"}
        </Button>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Today" value={`+${formatPoints(d.todayEarned)}`} />
        <Stat label="Referrals" value={formatPoints(d.referrals)} />
        <Stat label="Tasks" value={formatPoints(d.profile.tasksCompleted)} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Featured tasks</h2>
        <Link to="/tasks" className="text-xs text-primary">
          See all
        </Link>
      </div>
      <div className="mt-2 space-y-2">
        {d.featured.length === 0 ? (
          <Card className="text-sm text-muted">No live campaigns right now.</Card>
        ) : (
          d.featured.map((t) => (
            <Link key={t.id} to="/tasks/$taskId" params={{ taskId: String(t.id) }} className="block">
              <Card className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 text-xs text-muted capitalize">{t.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary tabular">+{formatPoints(t.rewardPoints)}</p>
                  <ArrowRight className="ml-auto mt-1 size-3.5 text-subtle" />
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Quick to="/tasks" icon={ClipboardList} label="Tasks" />
        <Quick to="/friends" icon={Users} label="Invite" />
        <Quick to="/ranks" icon={Trophy} label="Ranks" />
      </div>

      
      <h2 className="mt-6 text-sm font-semibold">Achievements</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {achievementsOf(d).map((a) => (
          <span
            key={a.id}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              a.done ? "bg-success/15 text-success" : "bg-surface text-muted"
            }`}
          >
            {a.done ? "✓ " : ""}
            {a.label}
          </span>
        ))}
      </div>

      <h2 className="mt-6 text-sm font-semibold">Recent activity</h2>
      <div className="mt-2 space-y-2">
        {d.recent.length === 0 ? (
          <p className="text-sm text-muted">No ledger entries yet.</p>
        ) : (
          d.recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between text-sm">
              <div>
                <p>{TX_LABELS[tx.type] ?? tx.type}</p>
                <p className="text-xs text-subtle">{timeAgo(tx.createdAt)}</p>
              </div>
              <span className={`tabular font-medium ${tx.amount >= 0 ? "text-success" : "text-danger"}`}>
                {tx.amount >= 0 ? "+" : ""}
                {formatPoints(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>
      <Disclaimer className="mt-8" />
    </AppShell>
  );
}


function levelFrom(tasks: number, earned: number) {
  const score = tasks * 10 + Math.floor(earned / 100);
  if (score >= 500) return { name: "Diamond", tone: "primary" as const };
  if (score >= 200) return { name: "Gold", tone: "warning" as const };
  if (score >= 50) return { name: "Silver", tone: "muted" as const };
  return { name: "Bronze", tone: "muted" as const };
}

function achievementsOf(d: {
  profile: { tasksCompleted: number; lifetimeEarned: number; dailyStreak: number };
  referrals: number;
}) {
  const list: { id: string; label: string; done: boolean }[] = [
    { id: "first", label: "First task", done: d.profile.tasksCompleted >= 1 },
    { id: "five", label: "5 tasks", done: d.profile.tasksCompleted >= 5 },
    { id: "ten", label: "10 tasks", done: d.profile.tasksCompleted >= 10 },
    { id: "ref1", label: "1 referral", done: d.referrals >= 1 },
    { id: "ref5", label: "5 referrals", done: d.referrals >= 5 },
    { id: "streak3", label: "3-day streak", done: d.profile.dailyStreak >= 3 },
    { id: "earn1k", label: "1,000 pts earned", done: d.profile.lifetimeEarned >= 1000 },
  ];
  return list;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular">{value}</p>
    </Card>
  );
}

function Quick({
  to,
  icon: Icon,
  label,
}: {
  to: "/tasks" | "/friends" | "/ranks";
  icon: typeof ClipboardList;
  label: string;
}) {
  return (
    <Link to={to} className="block">
      <Card className="flex flex-col items-center gap-1 py-3">
        <Icon className="size-4 text-primary" />
        <span className="text-[11px] font-medium">{label}</span>
      </Card>
    </Link>
  );
}
