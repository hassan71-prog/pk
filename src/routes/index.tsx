import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, ClipboardList, Users, Trophy } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/app-shell";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload, useCaptureReferral } from "@/lib/identity";
import { claimDaily, getDashboard } from "@/lib/server/user.functions";
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
  return (
    <main className="app-bg mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      <Logo />
      <h1 className="mt-10 font-display text-4xl font-semibold leading-[1.1] tracking-tight">
        Tasks that pay in platform points
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        TaskEarn PK is a rewards app for people in Pakistan. Join sponsored campaigns,
        complete verifiable tasks, and redeem through live reward catalogues — never a
        mining scheme, never a guaranteed return.
      </p>
      <div className="mt-8 space-y-3">
        {GROK_PROVIDERS.map((p) => (
          <Button
            key={p.providerId}
            className="w-full"
            variant={p.providerId === "google-grok" ? "default" : "secondary"}
            onClick={() => signIn(p.providerId, { callbackURL: "/" })}
          >
            Continue with {p.label}
          </Button>
        ))}
        <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/login")}>
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
      toast.success(`Daily reward: +${res.points} points`);
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
  const greet = (user?.displayName ?? d.profile.displayName).split(" ")[0];

  return (
    <AppShell points={d.profile.pointsBalance} unread={d.unread}>
      <p className="text-sm text-muted">Welcome back</p>
      <h1 className="font-display text-2xl font-semibold tracking-tight">{greet}</h1>

      <Card className="mt-4 rounded-2xl p-5">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">Available points</p>
        <p className="mt-1 font-display text-4xl font-semibold tabular tracking-tight">
          {formatPoints(d.profile.pointsBalance)}
        </p>
        <p className="mt-1 text-xs text-subtle">Platform rewards · not cash</p>
        <Button
          className="mt-4 w-full"
          disabled={d.daily.claimed || claim.isPending}
          onClick={() => claim.mutate()}
        >
          <Gift className="size-4" />
          {d.daily.claimed ? "Claimed today" : `Claim daily · +${d.daily.nextPoints}`}
        </Button>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {d.daily.schedule.map((pts, i) => {
            const day = i + 1;
            const done = d.daily.claimed ? day <= d.daily.dayNumber : day < d.daily.dayNumber;
            const current = day === d.daily.dayNumber;
            return (
              <div
                key={day}
                className={`rounded-md py-2 text-center ${current ? "bg-primary/15 text-primary" : "bg-bg text-muted"}`}
              >
                <div className="text-[10px]">D{day}</div>
                <div className="text-[11px] font-semibold tabular">{pts}</div>
                {done ? <div className="text-[9px] text-success">done</div> : null}
              </div>
            );
          })}
        </div>
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
