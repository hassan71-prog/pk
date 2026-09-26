import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell, Disclaimer } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { identityPayload } from "@/lib/identity";
import { getDashboard, getReferralInfo } from "@/lib/server/user.functions";
import { formatPoints, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/friends")({ component: FriendsPage });

function FriendsPage() {
  const { user, isPending } = useCurrentUserState();
  const dash = useQuery({
    queryKey: ["dashboard"],
    enabled: !!user,
    queryFn: () => getDashboard({ data: identityPayload(user) }),
  });
  const info = useQuery({
    queryKey: ["referrals"],
    enabled: !!user,
    queryFn: () => getReferralInfo({ data: identityPayload(user) }),
  });

  if (isPending) return <AppShell title="Invite Friends"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;

  const d = info.data;
  const webLink =
    typeof window !== "undefined" && d ? `${window.location.origin}/?ref=${d.code}` : d?.telegramLink;

  async function copy() {
    if (!webLink) return;
    await navigator.clipboard.writeText(webLink);
    toast.success("Referral link copied");
  }

  async function share() {
    if (!webLink) return;
    const text = `Earn.pk pe join karo aur tasks se points kamao! Mera referral link: ${webLink}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Earn.pk", text, url: webLink });
        return;
      } catch { /* cancelled */ }
    }
    await copy();
  }

  function shareWhatsApp() {
    if (!webLink) return;
    const text = encodeURIComponent(
      `Earn.pk pe join karo aur tasks complete karke points kamao!\n${webLink}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  function shareTelegram() {
    if (!webLink) return;
    const text = encodeURIComponent("Earn.pk pe join karo!");
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(webLink)}&text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <AppShell title="Invite Friends" points={dash.data?.profile.pointsBalance} unread={dash.data?.unread}>
      <p className="text-sm text-muted">
        Invite friends with your code. Rewards post only after they meet the qualification — currently{" "}
        {d?.qualifyTasks ?? 1} completed task{d?.qualifyTasks === 1 ? "" : "s"}. Self-referrals are blocked.
      </p>
      <Card className="mt-4 rounded-2xl">
        <p className="text-xs text-muted">Your referral code</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-widest">{d?.code ?? "••••••••"}</p>
        <p className="mt-3 break-all text-xs text-subtle">{webLink}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => void copy()}>
            Copy link
          </Button>
          <Button onClick={() => void share()}>Share</Button>
          <Button variant="secondary" onClick={shareWhatsApp}>
            WhatsApp
          </Button>
          <Button variant="secondary" onClick={shareTelegram}>
            Telegram
          </Button>
        </div>
        <p className="mt-3 text-xs text-subtle">Telegram: {d?.telegramLink}</p>
      </Card>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Card className="p-3">
          <p className="text-[11px] text-muted">Total</p>
          <p className="text-lg font-semibold tabular">{d?.total ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted">Qualified</p>
          <p className="text-lg font-semibold tabular">{d?.active ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] text-muted">Earned</p>
          <p className="text-lg font-semibold tabular text-primary">+{formatPoints(d?.earned ?? 0)}</p>
        </Card>
      </div>
      <p className="mt-2 text-xs text-subtle">Reward per qualified referral: {d?.reward ?? 0} points</p>
      <h2 className="mt-6 text-sm font-semibold">Recent referrals</h2>
      <div className="mt-2 space-y-2">
        {(d?.recent ?? []).length === 0 ? (
          <p className="text-sm text-muted">No referrals yet.</p>
        ) : (
          d!.recent.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p>{r.name}</p>
                <p className="text-xs text-subtle">{timeAgo(r.createdAt)}</p>
              </div>
              <Badge tone={r.status === "rewarded" ? "success" : r.status === "rejected" ? "danger" : "warning"}>
                {r.status}
              </Badge>
            </div>
          ))
        )}
      </div>
      <Disclaimer className="mt-8" />
    </AppShell>
  );
}
