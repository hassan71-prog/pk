import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { errorMessage, formatPoints } from "@/lib/utils";

export const Route = createFileRoute("/tasks/$taskId")({ component: TaskDetail });

function TaskDetail() {
  const { taskId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
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

  const start = useMutation({
    mutationFn: () => startTask({ data: { taskId: Number(taskId) } }),
    onSuccess: async (res) => {
      haptic();
      toast.success("Task started. Complete the action, then submit.");
      if (task.data?.targetUrl) window.open(task.data.targetUrl, "_blank", "noopener,noreferrer");
      await qc.invalidateQueries({ queryKey: ["task", taskId] });
      await qc.invalidateQueries({ queryKey: ["tasks"] });
      return res;
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
      if (res.status === "pending") toast.success("Submitted for review. No points yet.");
      else toast.success(`Verified. +${res.points} points.`);
      void qc.invalidateQueries();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remaining = useMemo(() => {
    if (!task.data?.startedAt || !task.data.minDwellSeconds) return 0;
    const elapsed = (Date.now() - new Date(task.data.startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(task.data.minDwellSeconds - elapsed));
  }, [task.data]);

  if (isPending) return <AppShell title="Task"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;
  if (task.isPending) return <AppShell title="Task"><Skeleton className="h-48 rounded-xl" /></AppShell>;
  if (!task.data) {
    return (
      <AppShell title="Task">
        <p className="text-sm text-muted">Task not found.</p>
        <Link to="/tasks" className="mt-3 inline-block text-sm text-primary">Back to tasks</Link>
      </AppShell>
    );
  }

  const t = task.data;
  const needsProof = t.verificationType === "admin_approval" || t.verificationType === "telegram_membership";

  return (
    <AppShell title="Task" points={dash.data?.profile.pointsBalance}>
      <div className="flex flex-wrap gap-1.5">
        <Badge>{t.category}</Badge>
        <Badge tone="primary">{t.verificationType.replace("_", " ")}</Badge>
        {t.isDemo ? <Badge>Sample</Badge> : null}
      </div>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{t.description}</p>
      <Card className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Reward if verified</p>
          <p className="text-lg font-semibold text-primary tabular">+{formatPoints(t.rewardPoints)}</p>
        </div>
        {t.sponsorName ? <p className="text-xs text-subtle">{t.sponsorName}</p> : null}
      </Card>
      <p className="mt-3 text-xs leading-relaxed text-subtle">
        Clicking a button does not add points. The server issues a task token, checks dwell time or
        admin review, and only then writes the ledger.
      </p>

      {t.userState === "completed" ? (
        <Card className="mt-4 text-sm text-success">This task is already completed.</Card>
      ) : t.userState === "pending" ? (
        <Card className="mt-4 text-sm text-warning">Submitted — waiting for review.</Card>
      ) : t.userState === "rejected" ? (
        <Card className="mt-4 text-sm text-danger">Previous submission was rejected.</Card>
      ) : (
        <div className="mt-4 space-y-3">
          {t.userState === "available" ? (
            <Button className="w-full" disabled={start.isPending} onClick={() => start.mutate()}>
              Start task
            </Button>
          ) : null}
          {t.userState === "started" ? (
            <>
              {t.targetUrl ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => window.open(t.targetUrl!, "_blank", "noopener,noreferrer")}
                >
                  Open destination
                </Button>
              ) : null}
              {needsProof ? (
                <>
                  <Input placeholder="Proof URL (optional)" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} />
                  <Textarea placeholder="What did you complete?" value={proofNote} onChange={(e) => setProofNote(e.target.value)} />
                </>
              ) : null}
              <Button className="w-full" disabled={submit.isPending} onClick={() => submit.mutate()}>
                {submit.isPending ? "Checking…" : remaining > 0 ? `Submit (wait ${remaining}s)` : "Submit for verification"}
              </Button>
            </>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
