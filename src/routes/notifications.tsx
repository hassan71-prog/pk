import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listNotifications, markNotificationsRead } from "@/lib/server/user.functions";
import { timeAgo } from "@/lib/utils";
import { useEffect } from "react";

export const Route = createFileRoute("/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["notifications"],
    enabled: !!user,
    queryFn: () => listNotifications(),
  });
  const mark = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
  useEffect(() => {
    if (user && list.data?.some((n) => !n.readAt)) mark.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, list.data]);

  if (isPending) return <AppShell title="Inbox"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;

  return (
    <AppShell title="Inbox">
      {(list.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">No notifications yet.</p>
      ) : (
        <div className="space-y-2">
          {(list.data ?? []).map((n) => (
            <Card key={n.id} className={n.readAt ? "opacity-80" : ""}>
              <p className="text-sm font-medium">{n.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{n.body}</p>
              <p className="mt-2 text-[11px] text-subtle">{timeAgo(n.createdAt)}</p>
            </Card>
          ))}
        </div>
      )}
      <Button className="mt-4" variant="ghost" onClick={() => mark.mutate()}>
        Mark all read
      </Button>
    </AppShell>
  );
}
