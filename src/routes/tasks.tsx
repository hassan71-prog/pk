import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload, useCaptureReferral } from "@/lib/identity";
import { getDashboard, listTasks, startTask } from "@/lib/server/user.functions";
import { formatPoints } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/utils";

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

  const start = useMutation({
    mutationFn: (taskId: number) => startTask({ data: { taskId } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["tasks"] });
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

  return (
    <AppShell title="Tasks" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <p className="text-sm text-muted">
        Task pe tap karein → details. <strong className="text-fg">Open link</strong> se YouTube /
        site seedha khulegi.
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
          <Card className="text-sm text-muted">
            Abhi koi task nahi. Admin panel se tasks add hone ke baad yahan dikhenge.
          </Card>
        ) : (
          list.map((t) => {
            const href = normalizeUrl(t.targetUrl);
            const canOpen =
              href && (t.userState === "available" || t.userState === "started");
            return (
              <Card key={t.id} className="!p-0 overflow-hidden">
                {/* Hard link — works on old Android browsers better than SPA Link */}
                <a
                  href={`/tasks/${t.id}`}
                  className="block p-4 active:bg-surface-2"
                >
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
                {canOpen ? (
                  <div className="border-t border-border px-4 py-2.5">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-fg"
                      onClick={() => {
                        if (t.userState === "available") {
                          start.mutate(t.id);
                        }
                      }}
                    >
                      <ExternalLink className="size-4" />
                      Open link (YouTube / site)
                    </a>
                    <p className="mt-1.5 break-all text-center text-[10px] text-subtle">{href}</p>
                  </div>
                ) : t.userState === "available" && !href ? (
                  <p className="border-t border-border px-4 py-2 text-center text-[11px] text-danger">
                    Link missing — admin Target URL add kare
                  </p>
                ) : null}
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
