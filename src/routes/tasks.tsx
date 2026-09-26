import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload, useCaptureReferral } from "@/lib/identity";
import { completeTask, getDashboard, listTasks, startTask } from "@/lib/server/user.functions";
import { errorMessage, formatPoints } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { haptic } from "@/lib/telegram";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

const FILTERS = ["all", "telegram", "website", "social", "sponsored", "affiliate", "daily"] as const;

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const href = url.trim();
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  return "https://" + href.replace(/^\/\//, "");
}

function TasksPage() {
  useCaptureReferral();
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [nowTick, setNowTick] = useState(Date.now());

  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: identityPayload(user) }),
  });
  const tasks = useQuery({
    queryKey: ["tasks"],
    enabled: !!user,
    queryFn: () => listTasks({ data: identityPayload(user) }),
    refetchInterval: 5_000,
  });

  // Live timer for started tasks
  useEffect(() => {
    const hasStarted = (tasks.data ?? []).some((t) => t.userState === "started");
    if (!hasStarted) return;
    const id = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(id);
  }, [tasks.data]);

  const start = useMutation({
    mutationFn: (taskId: number) => startTask({ data: { taskId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const claim = useMutation({
    mutationFn: (taskId: number) => completeTask({ data: { taskId } }),
    onSuccess: (res) => {
      haptic("medium");
      if (res.status === "pending") toast.success("Submitted for review.");
      else toast.success(`+${res.points} points mil gaye!`);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (isPending)
    return (
      <AppShell title="Tasks">
        <Skeleton className="h-40 rounded-xl" />
      </AppShell>
    );
  if (!user) return <RedirectToSignIn />;

  const list = useMemo(() => {
    const base = (tasks.data ?? []).filter((t) => (filter === "all" ? true : t.category === filter));
    const term = q.trim().toLowerCase();
    if (!term) return base;
    return base.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        (t.description ?? "").toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term),
    );
  }, [tasks.data, filter, q]);

  function remainingFor(t: { startedAt: string | null; minDwellSeconds: number }) {
    if (!t.startedAt) return 0;
    const elapsed = (nowTick - new Date(t.startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(t.minDwellSeconds - elapsed));
  }

  return (
    <AppShell title="Tasks" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <p className="text-sm text-muted">
        1) Open link → 2) Action complete → 3) Wait timer → 4) Claim points
      </p>
      <Input
        className="mt-3"
        placeholder="Search tasks..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs capitalize ${filter === f ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {tasks.isPending ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : list.length === 0 ? (
          <Card className="text-sm text-muted">Abhi koi task nahi.</Card>
        ) : (
          list.map((t) => {
            const href = normalizeUrl(t.targetUrl);
            const left = t.userState === "started" ? remainingFor(t) : 0;
            const canClaim =
              t.userState === "started" &&
              left <= 0 &&
              (t.verificationType === "visit_token" || t.verificationType === "unique_token");

            return (
              <Card key={t.id} className="!p-0 overflow-hidden">
                <a href={`/tasks/${t.id}`} className="block p-4 active:bg-surface-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="mt-1 text-xs text-muted line-clamp-2">{t.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge>{t.category}</Badge>
                        <Badge tone={stateTone(t.userState)}>{labelState(t.userState)}</Badge>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-primary tabular">
                      +{formatPoints(t.rewardPoints)}
                    </p>
                  </div>
                </a>

                <div className="space-y-2 border-t border-border px-4 py-3">
                  {t.userState === "available" && href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-fg"
                      onClick={() => start.mutate(t.id)}
                    >
                      <ExternalLink className="size-4" />
                      Open link & start
                    </a>
                  ) : null}

                  {t.userState === "available" && !href ? (
                    <p className="text-center text-[11px] text-danger">
                      Link missing — admin Target URL add kare
                    </p>
                  ) : null}

                  {t.userState === "started" ? (
                    <>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface-2 py-2 text-sm font-medium"
                        >
                          <ExternalLink className="size-4" />
                          Link dobara open
                        </a>
                      ) : null}
                      {left > 0 ? (
                        <p className="text-center text-sm text-primary tabular">
                          Claim in <span className="text-lg font-semibold">{left}s</span>
                        </p>
                      ) : (
                        <Button
                          className="w-full"
                          disabled={claim.isPending}
                          onClick={() => claim.mutate(t.id)}
                        >
                          {claim.isPending
                            ? "Claiming…"
                            : `Claim +${formatPoints(t.rewardPoints)} points`}
                        </Button>
                      )}
                    </>
                  ) : null}

                  {t.userState === "completed" ? (
                    <p className="text-center text-sm text-success">Done — points credited</p>
                  ) : null}
                  {t.userState === "pending" ? (
                    <p className="text-center text-sm text-warning">Waiting for admin review</p>
                  ) : null}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

function labelState(s: string) {
  if (s === "available") return "open";
  if (s === "started") return "in progress";
  if (s === "completed") return "done";
  if (s === "pending") return "review";
  return s;
}

function stateTone(s: string): "muted" | "primary" | "success" | "warning" | "danger" {
  if (s === "completed") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected" || s === "expired") return "danger";
  if (s === "started") return "primary";
  return "muted";
}
