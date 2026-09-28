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

  if (isPending)
    return (
      <AppShell title="Invite Friends">
        <Skeleton className="h-40 rounded-xl" />
      </AppShell>
    );
  if (!user) return <RedirectToSignIn />;

  const d = info.data;
  const webLink =
    typeof window !== "undefined" && d ? `${window.location.origin}/?ref=${d.code}` : d?.telegramLink;
  const contest = d?.contest;

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
      } catch {
        /* cancelled */
      }
    }
    await copy();
  }

  function shareWhatsApp() {
    if (!webLink) return;
    const text = encodeURIComponent(
      `Earn.pk pe join karo! Tasks + daily rewards. Top referrers jeetenge iPhone 12 / iPad / EarPods. Link:\n${webLink}`,
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
      {/* Contest hero */}
      <Card className="overflow-hidden rounded-2xl border-primary/30 bg-gradient-to-b from-primary/15 to-surface p-4">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-primary">
          {contest?.title ?? "Referral Mega Contest"}
        </p>
        <p className="mt-1 text-center text-sm font-bold">
          Withdraw open hone par Top 10 ko gifts
        </p>
        <p className="mt-1 text-center text-[11px] text-muted">
          {contest?.ended
            ? "Contest window khatam — winners announce admin karega"
            : contest?.open
              ? "Contest live — zyada qualified referrals = higher rank"
              : contest?.opensAt
                ? `Gifts jab withdraw open: ${new Date(contest.opensAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}`
                : "Admin withdraw date set karega — tab gifts"}
        </p>
        {contest?.endsAt && !contest.ended ? (
          <p className="mt-1 text-center text-[11px] font-semibold text-warning">
            Ends {new Date(contest.endsAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        ) : null}

        {/* Top 3 prizes with images */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { rank: 2, title: contest?.prizes?.[1]?.title ?? "iPad", img: "/prizes/ipad.jpg", h: "h-20" },
            { rank: 1, title: contest?.prizes?.[0]?.title ?? "iPhone 12", img: "/prizes/iphone12.jpg", h: "h-24" },
            { rank: 3, title: contest?.prizes?.[2]?.title ?? "EarPods", img: "/prizes/earpods.jpg", h: "h-20" },
          ].map((p) => (
            <div
              key={p.rank}
              className={`flex flex-col items-center rounded-xl border border-border bg-bg/80 p-2 ${
                p.rank === 1 ? "border-primary/50 shadow-[0_0_16px_rgba(34,197,94,0.25)]" : ""
              }`}
            >
              <span className="text-[10px] font-bold text-primary">#{p.rank}</span>
              <img src={p.img} alt={p.title} className={`${p.h} w-auto object-contain`} />
              <p className="mt-1 text-center text-[10px] font-semibold leading-tight">{p.title}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">
          Rank 4–10: {contest?.prizes?.[3]?.title ?? "Gift pack"} 🎁
        </p>
      </Card>

      {/* Per-referral points reward (separate from contest gifts) */}
      <Card className="mt-3 rounded-2xl p-4">
        <p className="text-sm font-semibold">Invite milestones</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            { n: 5, pts: 100 },
            { n: 10, pts: 300 },
            { n: 25, pts: 1000 },
          ].map((m) => (
            <div key={m.n} className="rounded-xl border border-border bg-bg p-2">
              <p className="text-xs font-bold text-primary">{m.n} friends</p>
              <p className="text-[10px] text-muted">+{m.pts} pts</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-subtle">Auto bonus jab qualified count hit ho (ek dafa per milestone).</p>
      </Card>

      <Card className="mt-3 rounded-2xl p-4">
        <p className="text-sm font-semibold">Referral points reward</p>
        <p className="mt-1 text-xs text-muted">
          Har qualified friend pe <span className="font-bold text-primary">+{d?.reward ?? 250} points</span>
          {d?.l2Reward ? (
            <>
              {" "}
              · L2 team bonus <span className="text-primary">+{d.l2Reward}</span>
            </>
          ) : null}
        </p>
        <p className="mt-1 text-[11px] text-subtle">
          Qualify: friend {d?.qualifyTasks ?? 1} task complete kare. Yeh points gifts se alag hain.
        </p>
      </Card>

      <Card className="mt-3 rounded-2xl">
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
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <p className="text-[11px] text-muted">Total</p>
          <p className="text-lg font-bold tabular">{d?.total ?? 0}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[11px] text-muted">Qualified</p>
          <p className="text-lg font-bold tabular text-primary">{d?.active ?? 0}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-[11px] text-muted">Points</p>
          <p className="text-lg font-bold tabular text-primary">+{formatPoints(d?.earned ?? 0)}</p>
        </Card>
      </div>

      {contest?.yourRank ? (
        <p className="mt-2 text-center text-xs text-primary">
          Aapka contest rank: #{contest.yourRank} ({contest.yourQualified} qualified)
        </p>
      ) : (
        <p className="mt-2 text-center text-xs text-muted">Contest rank ke liye qualified referrals chahiye</p>
      )}

      {contest?.ended ? (
        <Card className="mt-4 border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-bold text-primary">Contest closed — provisional winners</p>
          <p className="mt-1 text-[11px] text-muted">
            Final gifts admin announce karega. Neeche current Top 10 ranking hai.
          </p>
        </Card>
      ) : null}
      <h2 className="mt-6 text-sm font-semibold">
        {contest?.ended ? "Winners / Top 10" : "Top referrers (gifts)"}
      </h2>
      <div className="mt-2 space-y-2">
        {(contest?.topReferrers ?? []).length === 0 ? (
          <Card className="text-sm text-muted">Abhi ranking empty — invite start karo.</Card>
        ) : (
          contest!.topReferrers.map((r) => (
            <div
              key={r.rank}
              className={`flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 ${
                r.isYou ? "border-primary/40 bg-primary/5" : ""
              }`}
            >
              <span className="w-6 text-center text-xs font-bold text-muted">#{r.rank}</span>
              {r.rank <= 3 ? (
                <img
                  src={r.rank === 1 ? "/prizes/iphone12.jpg" : r.rank === 2 ? "/prizes/ipad.jpg" : "/prizes/earpods.jpg"}
                  alt=""
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <img src="/prizes/gift.svg" alt="" className="h-8 w-8 object-contain" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {r.name}
                  {r.isYou ? " (you)" : ""}
                  {r.isDemo ? " · sample" : ""}
                </p>
                <p className="text-[11px] text-muted">{r.count} qualified · {r.prize}</p>
              </div>
            </div>
          ))
        )}
      </div>

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
