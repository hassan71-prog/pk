import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload, useCaptureReferral } from "@/lib/identity";
import { getDashboard, listTasks } from "@/lib/server/user.functions";
import { formatPoints } from "@/lib/utils";
import { useState } from "react";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

const FILTERS = ["all", "telegram", "website", "social", "sponsored", "affiliate", "daily"] as const;

function TasksPage() {
  useCaptureReferral();
  const { user, isPending } = useCurrentUserState();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: identityPayload(user) }),
  });
  const tasks = useQuery({
    queryKey: ["tasks"],
    enabled: !!user,
    queryFn: () => listTasks({ data: identityPayload(user) }),
  });

  if (isPending)
    return (
      <AppShell title="Tasks">
        <Skeleton className="h-40 rounded-xl" />
      </AppShell>
    );
  if (!user) return <RedirectToSignIn />;

  const list = (tasks.data ?? []).filter((t) => (filter === "all" ? true : t.category === filter));

  return (
    <AppShell title="Tasks" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <p className="text-sm text-muted">
        Task open karein, complete karein, phir points claim karein. Admin naye tasks add karta
        rehta hai.
      </p>
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
          <Card className="text-sm text-muted">
            Abhi koi task nahi. Admin panel se tasks add hone ke baad yahan dikhenge.
          </Card>
        ) : (
          list.map((t) => (
            <Link key={t.id} to="/tasks/$taskId" params={{ taskId: String(t.id) }} className="block">
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="mt-1 text-xs text-muted line-clamp-2">{t.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge>{t.category}</Badge>
                      <Badge tone={stateTone(t.userState)}>{labelState(t.userState)}</Badge>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-primary tabular">
                    +{formatPoints(t.rewardPoints)}
                  </p>
                </div>
              </Card>
            </Link>
          ))
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
