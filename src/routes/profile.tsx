import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@/lib/auth/gates";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload } from "@/lib/identity";
import { getDashboard, getMeAdminFlag, updateProfileSettings } from "@/lib/server/user.functions";
import { formatPoints } from "@/lib/utils";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [installEvent, setInstallEvent] = useState<{ prompt: () => Promise<void> } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: identityPayload(user) }),
  });
  const admin = useQuery({
    queryKey: ["me-admin"],
    enabled: !!user,
    queryFn: () => getMeAdminFlag(),
  });
  const save = useMutation({
    mutationFn: (payload: {
      language?: "en" | "ur";
      notificationsEnabled?: boolean;
      displayName?: string;
      avatarUrl?: string | null;
    }) => updateProfileSettings({ data: payload }),
    onSuccess: () => {
      toast.success("Profile saved");
      setEditOpen(false);
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Save failed");
    },
  });

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as unknown as { prompt: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (isPending) return <AppShell title="Profile"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;
  const p = dash.data?.profile;

  return (
    <AppShell title="Profile" points={p?.pointsBalance} unread={dash.data?.unread}>
      <Card className="flex items-center gap-3 rounded-2xl">
        {(p?.avatarUrl || user.profileImageUrl) ? (
          <img src={p?.avatarUrl || user.profileImageUrl || ""} alt="" className="size-14 rounded-full object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full bg-surface-2 text-lg font-semibold">
            {(p?.displayName ?? "M").charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{p?.displayName ?? user.displayName}</p>
          <p className="text-xs text-muted">{user.primaryEmail}</p>
          <div className="mt-1 flex gap-1">
            <Badge>{p?.status ?? "active"}</Badge>
            {admin.data?.isAdmin ? <Badge tone="primary">Admin</Badge> : null}
          </div>
        </div>
      </Card>
      <Button className="mt-3 w-full" variant="secondary" onClick={() => {
        setDisplayName(p?.displayName ?? "");
        setAvatarUrl(p?.avatarUrl ?? "");
        setEditOpen((v) => !v);
      }}>
        {editOpen ? "Close edit" : "Edit profile"}
      </Button>
      {editOpen ? (
        <Card className="mt-3 space-y-3">
          <p className="text-sm font-semibold">Edit profile</p>
          <Input
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
          />
          <Input
            placeholder="Avatar image URL (optional)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          <Button
            className="w-full"
            disabled={save.isPending || displayName.trim().length < 2}
            onClick={() =>
              save.mutate({
                displayName: displayName.trim(),
                avatarUrl: avatarUrl.trim() || null,
              })
            }
          >
            Save profile
          </Button>
        </Card>
      ) : null}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-[11px] text-muted">Points</p>
          <p className="text-sm font-semibold tabular text-primary">{formatPoints(p?.pointsBalance ?? 0)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted">Tasks</p>
          <p className="text-sm font-semibold tabular">{p?.tasksCompleted ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted">Streak</p>
          <p className="text-sm font-semibold tabular">🔥 {p?.dailyStreak ?? 0}</p>
        </Card>
      </div>

      {/* Rank path — Bronze → Silver → Gold → Diamond */}
      <Card className="mt-4 space-y-3">
        <p className="text-sm font-semibold">Your ranks</p>
        {(() => {
          const earned = p?.lifetimeEarned ?? 0;
          const tasks = p?.tasksCompleted ?? 0;
          const score = tasks * 10 + Math.floor(earned / 100);
          const tiers = [
            { name: "Bronze", need: 0, emoji: "🥉", color: "text-amber-700" },
            { name: "Silver", need: 50, emoji: "🥈", color: "text-slate-300" },
            { name: "Gold", need: 200, emoji: "🥇", color: "text-warning" },
            { name: "Diamond", need: 500, emoji: "💎", color: "text-cyan-300" },
          ];
          let current = tiers[0]!;
          for (const t of tiers) {
            if (score >= t.need) current = t;
          }
          const next = tiers.find((t) => t.need > score);
          const progress = next
            ? Math.min(100, Math.round(((score - current.need) / (next.need - current.need)) * 100))
            : 100;
          return (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{current.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${current.color}`}>{current.name}</p>
                  <p className="text-[11px] text-muted">
                    {next ? `${next.need - score} score to ${next.name}` : "Max rank unlocked"}
                  </p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {tiers.map((t) => {
                  const unlocked = score >= t.need;
                  return (
                    <div
                      key={t.name}
                      className={`rounded-xl border py-2 text-center ${
                        unlocked ? "border-primary/40 bg-primary/10" : "border-border bg-bg opacity-50"
                      }`}
                    >
                      <div className="text-lg">{t.emoji}</div>
                      <div className="text-[10px] font-medium">{t.name}</div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </Card>

      <div className="mt-4 space-y-1">
        <Row to="/wallet" label="Wallet & rewards" />
        <Row to="/support" label="Support" />
        <Row to="/legal/terms" label="Terms" />
        <Row to="/legal/privacy" label="Privacy" />
        {admin.data?.isAdmin ? <Row to="/admin" label="Admin panel" /> : null}
      </div>

      <Card className="mt-4 space-y-3">
        <p className="text-sm font-medium">Language</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={p?.language === "en" ? "default" : "secondary"}
            size="sm"
            onClick={() => save.mutate({ language: "en" })}
          >
            English
          </Button>
          <Button
            variant={p?.language === "ur" ? "default" : "secondary"}
            size="sm"
            onClick={() => save.mutate({ language: "ur" })}
          >
            اردو
          </Button>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm">Notifications</p>
          <Button
            size="sm"
            variant={p?.notificationsEnabled ? "default" : "secondary"}
            onClick={() => save.mutate({ notificationsEnabled: !p?.notificationsEnabled })}
          >
            {p?.notificationsEnabled ? "On" : "Off"}
          </Button>
        </div>
      </Card>

      {installEvent ? (
        <Button
          className="mt-4 w-full"
          variant="secondary"
          onClick={async () => {
            await installEvent.prompt();
            setInstallEvent(null);
          }}
        >
          Install app
        </Button>
      ) : null}

      <div className="mt-6">
        <UserButton />
      </div>
      <Disclaimer className="mt-6" />
    </AppShell>
  );
}

function Row({
  to,
  label,
}: {
  to: "/wallet" | "/support" | "/legal/terms" | "/legal/privacy" | "/admin";
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm"
    >
      {label}
      <ChevronRight className="size-4 text-subtle" />
    </Link>
  );
}
