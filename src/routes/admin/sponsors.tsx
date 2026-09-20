import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListSponsors, adminSaveCampaign, adminSaveSponsor } from "@/lib/server/admin.functions";
import { errorMessage, formatPkr } from "@/lib/utils";

export const Route = createFileRoute("/admin/sponsors")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const data = useQuery({ queryKey: ["admin-sponsors"], queryFn: () => adminListSponsors() });
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [sponsorId, setSponsorId] = useState<number | null>(null);
  const [budget, setBudget] = useState("10000");
  const [cost, setCost] = useState("40");
  const addS = useMutation({
    mutationFn: () => adminSaveSponsor({ data: { name } }),
    onSuccess: () => {
      setName("");
      void qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const addC = useMutation({
    mutationFn: () =>
      adminSaveCampaign({
        data: {
          sponsorId: sponsorId!,
          title,
          taskType: "sponsored",
          rewardPerCompletion: 500,
          budgetPkr: Number(budget),
          costPerCompletionPkr: Number(cost),
          status: "active",
        },
      }),
    onSuccess: () => {
      toast.success("Campaign saved");
      setTitle("");
      void qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <AdminShell title="Sponsors">
      <Card className="space-y-3">
        <Input placeholder="Sponsor name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => addS.mutate()} disabled={!name.trim()}>
          Add sponsor
        </Button>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {(data.data?.sponsors ?? []).map((s) => (
          <Button key={s.id} size="sm" variant={sponsorId === s.id ? "default" : "secondary"} onClick={() => setSponsorId(s.id)}>
            {s.name}
          </Button>
        ))}
      </div>
      <Card className="mt-3 space-y-3">
        <p className="text-sm font-medium">New campaign</p>
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
        </div>
        <Button onClick={() => addC.mutate()} disabled={!sponsorId}>
          Activate campaign
        </Button>
      </Card>
      <div className="mt-4 space-y-2">
        {(data.data?.campaigns ?? []).map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{c.title}</p>
              <Badge>{c.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {c.sponsorName} · budget {formatPkr(c.budgetPkr)} · spent {formatPkr(c.spentPkr)} · remaining{" "}
              {formatPkr(c.remainingPkr)} · {c.completions} completions
            </p>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
