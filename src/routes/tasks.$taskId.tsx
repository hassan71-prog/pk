import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { completeTask, getDashboard, getTask, startTask } from "@/lib/server/user.functions";
import { haptic } from "@/lib/telegram";
import { cn, errorMessage, formatPoints } from "@/lib/utils";
import { ExternalLink, CheckCircle2, Play } from "lucide-react";

export const Route = createFileRoute("/tasks/$taskId")({ component: TaskDetail });

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const href = url.trim();
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  // youtube.com/xxx without scheme
  return "https://" + href.replace(/^\/\//, "");
}

function TaskDetail() {
  const { taskId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());

  const task = useQuery({
    queryKey: ["task", taskId],
    enabled: !!user,
    queryFn: () => getTask({ data: { taskId: Number(taskId) } }),
  });
  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: {} }),
  });

  useEffect(() => {
    if (task.data?.userState !== "started") return;
    const id = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(id);
  }, [task.data?.userState]);

  const remaining = useMemo(() => {
    if (!task.data?.startedAt || !task.data.minDwellSeconds) return 0;
    const elapsed = (nowTick - new Date(task.data.startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(task.data.minDwellSeconds - elapsed));
  }, [task.data, nowTick]);

  const isAutoVerify =
    task.data?.verificationType === "visit_token" ||
    task.data?.verificationType === "unique_token";

  const start = useMutation({
    mutationFn: () => startTask({ data: { taskId: Number(taskId) } }),
    onSuccess: async () => {
      haptic();
      toast.success("Task start. Link open rakho, action complete karke claim karo.");
      await qc.invalidateQueries({ queryKey: ["task", taskId] });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const submit = useMutation({
    mutationFn: () =>
      completeTask({
        data: {
          taskId: Number(taskId),
          token: task.data?.token ?? undefined,
          proofUrl: proofUrl || undefined,
          proofNote: proofNote || undefined,
        },
      }),
    onSuccess: (res) => {
      haptic("medium");
      if (res.status === "pending") toast.success("Review ke liye bhej diya. Approval ke baad points.");
      else toast.success(`+${res.points} points mil gaye!`);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (isPending) {
    return (
      <AppShell title="Task">
        <Skeleton className="h-40 rounded-xl" />
      </AppShell>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (task.isPending) {
    return (
      <AppShell title="Task">
        <Skeleton className="h-48 rounded-xl" />
      </AppShell>
    );
  }
  if (!task.data) {
    return (
      <AppShell title="Task">
        <p className="text-sm text-muted">Task nahi mila.</p>
        <Link to="/tasks" className="mt-3 inline-block text-sm text-primary">
          Wapas tasks
        </Link>
      </AppShell>
    );
  }

  const t = task.data;
  const href = normalizeUrl(t.targetUrl);
  const needsProof =
    t.verificationType === "admin_approval" || t.verificationType === "telegram_membership";

  function onStartClick() {
    // Fire start in parallel; navigation is handled by real <a href>
    if (!start.isPending) start.mutate();
  }

  return (
    <AppShell title="Task" points={dash.data?.profile.pointsBalance}>
      <div className="flex flex-wrap gap-1.5">
        <Badge>{t.category}</Badge>
        {t.isFeatured ? <Badge tone="primary">featured</Badge> : null}
      </div>

      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.description}</p>

      <Card className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Reward</p>
          <p className="text-lg font-semibold text-primary tabular">+{formatPoints(t.rewardPoints)}</p>
        </div>
        {t.sponsorName ? <p className="text-xs text-subtle">{t.sponsorName}</p> : null}
      </Card>

      <Card className="mt-4 space-y-1 text-sm">
        <p className="font-medium">Steps</p>
        <p className="text-muted">1. Neeche button se link open karo</p>
        <p className="text-muted">2. Subscribe / action complete karo</p>
        <p className="text-muted">3. Wapas aao aur points claim karo</p>
      </Card>

      {!href && t.userState !== "completed" ? (
        <Card className="mt-3 border-danger/40 text-sm text-danger">
          Is task mein Target URL nahi hai. Admin panel → Tasks → Edit → Target URL add karo
          (example: https://youtube.com/@channel).
        </Card>
      ) : null}

      {t.userState === "completed" ? (
        <Card className="mt-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-5 shrink-0" />
          Complete — points mil chuke hain.
        </Card>
      ) : t.userState === "pending" ? (
        <Card className="mt-4 text-sm text-warning">Admin review pending.</Card>
      ) : t.userState === "rejected" ? (
        <Card className="mt-4 text-sm text-danger">Reject ho gaya. Support se contact karo.</Card>
      ) : (
        <div className="mt-4 space-y-3">
          {t.userState === "available" ? (
            href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onStartClick}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-fg active:scale-[0.98]",
                  start.isPending && "opacity-70",
                )}
              >
                <Play className="size-4" />
                {start.isPending ? "Starting…" : "Start & open link"}
              </a>
            ) : (
              <Button className="w-full" disabled={start.isPending} onClick={() => start.mutate()}>
                <Play className="size-4" />
                Start task (no link)
              </Button>
            )
          ) : null}

          {t.userState === "started" ? (
            <>
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-4 text-sm font-medium text-fg"
                >
                  <ExternalLink className="size-4" />
                  Link dobara open karo
                </a>
              ) : null}

              {href ? (
                <p className="break-all text-center text-[11px] text-primary underline">
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {href}
                  </a>
                </p>
              ) : null}

              {isAutoVerify ? (
                <Card className="text-center">
                  {remaining > 0 ? (
                    <>
                      <p className="text-xs text-muted">Action complete karke wait karo</p>
                      <p className="mt-1 text-3xl font-semibold tabular text-primary">{remaining}s</p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-success">Ab points claim kar sakte ho</p>
                  )}
                </Card>
              ) : null}

              {needsProof ? (
                <>
                  <Input
                    placeholder="Proof photo URL (Imgur/Drive link)"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                  />
                  <Textarea
                    placeholder="Note + proof details"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                  />
                </>
              ) : null}

              <Button
                className="w-full"
                disabled={submit.isPending || (isAutoVerify && remaining > 0)}
                onClick={() => submit.mutate()}
              >
                {submit.isPending
                  ? "Checking…"
                  : isAutoVerify && remaining > 0
                    ? `Wait ${remaining}s…`
                    : isAutoVerify
                      ? `Claim +${formatPoints(t.rewardPoints)} points`
                      : "Submit for review"}
              </Button>
            </>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
