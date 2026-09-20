import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListRewards, adminSaveReward } from "@/lib/server/admin.functions";
import { errorMessage, formatPoints } from "@/lib/utils";

export const Route = createFileRoute("/admin/rewards")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-rewards"], queryFn: () => adminListRewards() });
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("1000");
  const [method, setMethod] = useState<"easypaisa" | "jazzcash" | "bank" | "voucher">("easypaisa");
  const save = useMutation({
    mutationFn: () =>
      adminSaveReward({
        data: {
          title,
          description: "Campaign reward item",
          pointsCost: Number(cost),
          paymentMethod: method,
          status: "active",
        },
      }),
    onSuccess: () => {
      toast.success("Reward saved");
      setTitle("");
      void qc.invalidateQueries({ queryKey: ["admin-rewards"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <AdminShell title="Rewards">
      <Card className="space-y-3">
        <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          <select
            className="h-11 rounded-md border border-border bg-bg px-3 text-sm"
            value={method}
            onChange={(e) => setMethod(e.target.value as typeof method)}
          >
            <option value="easypaisa">Easypaisa</option>
            <option value="jazzcash">JazzCash</option>
            <option value="bank">Bank</option>
            <option value="voucher">Voucher</option>
          </select>
        </div>
        <Button onClick={() => save.mutate()}>Add catalogue item</Button>
      </Card>
      <div className="mt-4 space-y-2">
        {(list.data ?? []).map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-muted">
                {formatPoints(r.pointsCost)} pts · {r.paymentMethod}
              </p>
            </div>
            <Badge>{r.status}</Badge>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
