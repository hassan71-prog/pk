import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    mutationFn: (payload: { language?: "en" | "ur"; notificationsEnabled?: boolean }) =>
      updateProfileSettings({ data: payload }),
    onSuccess: () => {
      toast.success("Settings saved");
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
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
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt="" className="size-14 rounded-full object-cover" />
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
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-[11px] text-muted">Points</p>
          <p className="text-sm font-semibold tabular">{formatPoints(p?.pointsBalance ?? 0)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted">Tasks</p>
          <p className="text-sm font-semibold tabular">{p?.tasksCompleted ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted">Member</p>
          <p className="text-sm font-semibold">
            {p?.createdAt ? new Date(p.createdAt).toLocaleDateString("en-PK") : "—"}
          </p>
        </Card>
      </div>

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
