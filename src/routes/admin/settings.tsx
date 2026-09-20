import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminGetSettings, adminPurgeDemo, adminSaveSettings } from "@/lib/server/admin.functions";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({ component: Page });

const KEYS = [
  "daily_schedule",
  "referral_reward",
  "referral_qualify_tasks",
  "max_referral_rewards",
  "min_withdrawal_points",
  "daily_withdrawal_limit_points",
  "monthly_withdrawal_limit_points",
  "bot_username",
  "support_email",
] as const;

function Page() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-settings"], queryFn: () => adminGetSettings() });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setForm(q.data);
  }, [q.data]);
  const save = useMutation({
    mutationFn: () => adminSaveSettings({ data: { entries: form } }),
    onSuccess: () => toast.success("Settings saved"),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const purge = useMutation({
    mutationFn: () => adminPurgeDemo(),
    onSuccess: () => {
      toast.success("Demo records removed");
      void qc.invalidateQueries();
    },
  });
  return (
    <AdminShell title="Settings">
      <div className="max-w-lg space-y-3">
        {KEYS.map((k) => (
          <label key={k} className="block">
            <span className="text-xs text-muted">{k}</span>
            <Input className="mt-1" value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <Button onClick={() => save.mutate()}>Save settings</Button>
      </div>
      <Card className="mt-8 max-w-lg">
        <p className="text-sm font-medium">Remove sample records</p>
        <p className="mt-1 text-xs text-muted">
          Deletes rows flagged is_demo (sample leaderboard faces, sample tasks, sample sponsors).
        </p>
        <Button className="mt-3" variant="danger" onClick={() => purge.mutate()}>
          Purge demo data
        </Button>
      </Card>
    </AdminShell>
  );
}
