import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getTicket, replyTicket } from "@/lib/server/user.functions";
import { errorMessage, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/support/$ticketId")({ component: TicketPage });

function TicketPage() {
  const { ticketId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const data = useQuery({
    queryKey: ["ticket", ticketId],
    enabled: !!user,
    queryFn: () => getTicket({ data: { id: Number(ticketId) } }),
  });
  const reply = useMutation({
    mutationFn: () => replyTicket({ data: { id: Number(ticketId), body } }),
    onSuccess: () => {
      setBody("");
      toast.success("Reply sent");
      void qc.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (isPending) return <AppShell title="Ticket"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;

  return (
    <AppShell title={data.data?.ticket.subject ?? "Ticket"}>
      <div className="space-y-2">
        {(data.data?.replies ?? []).map((r) => (
          <Card key={r.id} className={r.isAdmin ? "border-primary/30" : ""}>
            <p className="text-[11px] text-muted">{r.isAdmin ? "Support" : "You"} · {timeAgo(r.createdAt)}</p>
            <p className="mt-1 text-sm leading-relaxed">{r.body}</p>
          </Card>
        ))}
      </div>
      {data.data?.ticket.status !== "closed" ? (
        <div className="mt-4 space-y-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply" />
          <Button className="w-full" disabled={reply.isPending || body.trim().length < 2} onClick={() => reply.mutate()}>
            Send
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">This ticket is closed.</p>
      )}
    </AppShell>
  );
}
