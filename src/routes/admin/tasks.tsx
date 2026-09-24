import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminListTasks, adminSaveTask } from "@/lib/server/admin.functions";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/admin/tasks")({ component: AdminTasks });

type Category = "website" | "telegram" | "social" | "sponsored" | "affiliate" | "daily";
type Verification =
  | "visit_token"
  | "admin_approval"
  | "telegram_membership"
  | "unique_token"
  | "sponsor_callback";

const emptyForm = {
  id: undefined as number | undefined,
  title: "",
  description: "",
  rewardPoints: "300",
  targetUrl: "",
  category: "website" as Category,
  verificationType: "visit_token" as Verification,
  maxCompletions: "",
  status: "active" as "active" | "paused" | "archived",
  sponsorName: "",
  isFeatured: false,
  minDwellSeconds: "8",
};

function AdminTasks() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-tasks"], queryFn: () => adminListTasks() });
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      adminSaveTask({
        data: {
          id: form.id,
          title: form.title,
          description: form.description,
          category: form.category,
          rewardPoints: Number(form.rewardPoints) || 1,
          targetUrl: form.targetUrl || null,
          verificationType: form.verificationType,
          maxCompletions: form.maxCompletions ? Number(form.maxCompletions) : null,
          status: form.status,
          sponsorName: form.sponsorName || null,
          isFeatured: form.isFeatured,
          minDwellSeconds: Number(form.minDwellSeconds) || 8,
        },
      }),
    onSuccess: () => {
      toast.success(form.id ? "Task updated" : "Task created");
      setForm(emptyForm);
      setShowForm(false);
      void qc.invalidateQueries({ queryKey: ["admin-tasks"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const toggleStatus = useMutation({
    mutationFn: (t: NonNullable<typeof list.data>[number]) =>
      adminSaveTask({
        data: {
          id: t.id,
          title: t.title,
          description: t.title,
          category: (t.category as Category) || "website",
          rewardPoints: t.rewardPoints,
          targetUrl: t.targetUrl,
          verificationType: (t.verificationType as Verification) || "visit_token",
          status: t.status === "active" ? "paused" : "active",
        },
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-tasks"] }),
    onError: (e) => toast.error(errorMessage(e)),
  });

  function editTask(t: NonNullable<typeof list.data>[number]) {
    setForm({
      id: t.id,
      title: t.title,
      description: "",
      rewardPoints: String(t.rewardPoints),
      targetUrl: t.targetUrl ?? "",
      category: (t.category as Category) || "website",
      verificationType: (t.verificationType as Verification) || "visit_token",
      maxCompletions: t.maxCompletions != null ? String(t.maxCompletions) : "",
      status: (t.status as "active" | "paused" | "archived") || "active",
      sponsorName: t.sponsorName ?? "",
      isFeatured: t.isFeatured,
      minDwellSeconds: "8",
    });
    setShowForm(true);
  }

  return (
    <AdminShell title="Tasks">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{list.data?.length ?? 0} tasks</p>
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyForm);
            setShowForm((v) => !v);
          }}
        >
          {showForm ? "Close form" : "New task"}
        </Button>
      </div>

      {showForm ? (
        <Card className="mb-4 space-y-3">
          <p className="text-sm font-medium">{form.id ? `Edit task #${form.id}` : "Create task"}</p>
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Reward points"
              value={form.rewardPoints}
              onChange={(e) => setForm({ ...form, rewardPoints: e.target.value })}
            />
            <Input
              placeholder="Target URL"
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Max completions (empty = unlimited)"
              value={form.maxCompletions}
              onChange={(e) => setForm({ ...form, maxCompletions: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Min dwell seconds"
              value={form.minDwellSeconds}
              onChange={(e) => setForm({ ...form, minDwellSeconds: e.target.value })}
            />
          </div>
          <Input
            placeholder="Sponsor name (optional)"
            value={form.sponsorName}
            onChange={(e) => setForm({ ...form, sponsorName: e.target.value })}
          />

          <div>
            <p className="mb-1 text-xs text-muted">Category</p>
            <div className="flex flex-wrap gap-1">
              {(["website", "telegram", "social", "sponsored", "affiliate", "daily"] as const).map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={form.category === c ? "default" : "secondary"}
                  onClick={() => setForm({ ...form, category: c })}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted">Verification</p>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  "visit_token",
                  "admin_approval",
                  "telegram_membership",
                  "unique_token",
                  "sponsor_callback",
                ] as const
              ).map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={form.verificationType === v ? "default" : "secondary"}
                  onClick={() => setForm({ ...form, verificationType: v })}
                >
                  {v.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs text-muted">Status</p>
            <div className="flex flex-wrap gap-1">
              {(["active", "paused", "archived"] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={form.status === s ? "default" : "secondary"}
                  onClick={() => setForm({ ...form, status: s })}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            Featured
          </label>

          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title.trim()}>
              {form.id ? "Update task" : "Publish task"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setForm(emptyForm);
                setShowForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <div className="space-y-2">
        {(list.data ?? []).map((t) => (
          <Card key={t.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted">
                {t.category} · +{t.rewardPoints} · {t.completionCount}
                {t.maxCompletions != null ? `/${t.maxCompletions}` : ""} completions
                {t.sponsorName ? ` · ${t.sponsorName}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t.status}</Badge>
              {t.isFeatured ? <Badge tone="primary">featured</Badge> : null}
              {t.isDemo ? <Badge>Sample</Badge> : null}
              <Button size="sm" variant="outline" onClick={() => editTask(t)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleStatus.mutate(t)}>
                {t.status === "active" ? "Pause" : "Resume"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
