import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  adminGetSettings,
  adminPurgeDemo,
  adminRestoreDemoUsers,
  adminSaveSettings,
} from "@/lib/server/admin.functions";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({ component: Page });

const SETTINGS: { key: string; label: string; hint: string }[] = [
  {
    key: "daily_schedule",
    label: "Daily claim schedule",
    hint: "Cron-like or time window for daily rewards",
  },
  {
    key: "referral_reward",
    label: "Referral reward (points)",
    hint: "Points given when a referral qualifies",
  },
  {
    key: "referral_qualify_tasks",
    label: "Tasks to qualify referral",
    hint: "How many tasks the invitee must complete",
  },
  {
    key: "max_referral_rewards",
    label: "Max referral rewards per user",
    hint: "Cap on referral bonuses one user can earn",
  },
  {
    key: "points_to_pkr",
    label: "Points to PKR rate",
    hint: "e.g. 0.02 means 1 point = Rs 0.02 (1000 pts = Rs 20)",
  },
  {
    key: "withdrawals_opens_at",
    label: "Withdrawals open at (ISO datetime)",
    hint: "e.g. 2026-10-01T10:00:00+05:00 — before this, users see Coming Soon",
  },
  {
    key: "min_withdrawal_points",
    label: "Minimum withdrawal (points)",
    hint: "Lowest amount users can redeem",
  },
  {
    key: "daily_withdrawal_limit_points",
    label: "Daily withdrawal limit (points)",
    hint: "Max points one user can withdraw per day",
  },
  {
    key: "monthly_withdrawal_limit_points",
    label: "Monthly withdrawal limit (points)",
    hint: "Max points one user can withdraw per month",
  },
  {
    key: "bot_username",
    label: "Telegram bot username",
    hint: "Without @ — used in share links",
  },
  {
    key: "support_email",
    label: "Support email",
    hint: "Shown on legal / support pages",
  },
  {
    key: "spin_prizes",
    label: "Spin prizes (comma list)",
    hint: "0 = Try again. e.g. 0,10,20,30,50,80,100,150",
  },
  {
    key: "leaderboard_bonus_opens_at",
    label: "Rank bonus opens at (ISO datetime)",
    hint: "e.g. 2026-09-28T10:00:00+05:00 — Top 10 can claim for 7 days, once",
  },
  {
    key: "leaderboard_weekly_rewards",
    label: "Rank bonus points (Top 1–10)",
    hint: "e.g. 500,300,200,100,100,50,50,50,50,50",
  },
];

function Page() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-settings"], queryFn: () => adminGetSettings() });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (q.data) setForm(q.data);
  }, [q.data]);

  const save = useMutation({
    mutationFn: () => adminSaveSettings({ data: { entries: form } }),
    onSuccess: () => {
      toast.success("Settings saved");
      void qc.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const purge = useMutation({
    mutationFn: () => adminPurgeDemo(),
    onSuccess: () => {
      toast.success("Demo records removed");
      void qc.invalidateQueries();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <AdminShell title="Settings">
      <div className="max-w-lg space-y-4">
        {SETTINGS.map((s) => (
          <label key={s.key} className="block">
            <span className="text-sm font-medium">{s.label}</span>
            <p className="text-xs text-muted">{s.hint}</p>
            <Input
              className="mt-1"
              value={form[s.key] ?? ""}
              onChange={(e) => setForm({ ...form, [s.key]: e.target.value })}
            />
          </label>
        ))}
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Save settings
        </Button>
      </div>

      <Card className="mt-8 max-w-lg">
        <p className="text-sm font-medium">Remove sample records</p>
        <p className="mt-1 text-xs text-muted">
          Deletes rows flagged is_demo (sample leaderboard faces, sample tasks, sample sponsors).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="danger" onClick={() => purge.mutate()} disabled={purge.isPending}>
            {purge.isPending ? "Purging…" : "Purge demo data"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => restoreDemo.mutate()}
            disabled={restoreDemo.isPending}
          >
            {restoreDemo.isPending ? "Restoring…" : "Restore 100 fake rank users"}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-subtle">
          Restore sirf leaderboard fake users (is_demo) wapas laata hai — real users safe rehte hain.
        </p>
      </Card>
    </AdminShell>
  );
}
