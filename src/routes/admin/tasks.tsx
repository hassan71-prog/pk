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

function AdminTasks() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-tasks"], queryFn: () => adminListTasks() });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("300");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<"website" | "telegram" | "social" | "sponsored" | "affiliate" | "daily">("website");
  const [verification, setVerification] = useState<"visit_token" | "admin_approval">("visit_token");
  const save = useMutation({
    mutationFn: () =>
      adminSaveTask({
        data: {
          title,
          description,
          category,
          rewardPoints: Number(reward),
          targetUrl: url || null,
          verificationType: verification,
          status: "active",
          isFeatured: true,
        },
      }),
    onSuccess: () => {
      toast.success("Task saved");
      setTitle("");
      setDescription("");
      void qc.invalidateQueries({ queryKey: ["admin-tasks"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const pause = useMutation({
    mutationFn: (t: NonNullable<typeof list.data>[number]) =>
      adminSaveTask({
        data: {
          id: t.id,
          title: t.title,
          description: t.title,
          category: t.category as "website",
          rewardPoints: t.rewardPoints,
          targetUrl: t.targetUrl,
          verificationType: t.verificationType as "visit_token",
          status: t.status === "active" ? "paused" : "active",
        },
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin-tasks"] }),
  });

  return (
    <AdminShell title="Tasks">
      <Card className="space-y-3">
        <p className="text-sm font-medium">Create task</p>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} />
          <Input placeholder="Target URL" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["website", "telegram", "social", "sponsored", "affiliate", "daily"] as const).map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "secondary"} onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={verification === "visit_token" ? "default" : "secondary"} onClick={() => setVerification("visit_token")}>
            Visit token
          </Button>
          <Button size="sm" variant={verification === "admin_approval" ? "default" : "secondary"} onClick={() => setVerification("admin_approval")}>
            Admin review
          </Button>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Publish task
        </Button>
      </Card>
      <div className="mt-4 space-y-2">
        {(list.data ?? []).map((t) => (
          <Card key={t.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-xs text-muted">
                {t.category} · +{t.rewardPoints} · {t.completionCount} completions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{t.status}</Badge>
              {t.isDemo ? <Badge>Sample</Badge> : null}
              <Button size="sm" variant="ghost" onClick={() => pause.mutate(t)}>
                {t.status === "active" ? "Pause" : "Resume"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
