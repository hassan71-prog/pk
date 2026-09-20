import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { createTicket, listTickets } from "@/lib/server/user.functions";
import { errorMessage, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/support")({ component: SupportPage });

const FAQ = [
  {
    q: "Are points cash?",
    a: "No. Points are platform rewards. Redemption only happens through listed catalogue items and only when campaign budget exists.",
  },
  {
    q: "Why didn’t I get points after clicking a task?",
    a: "Points are never granted on click. You must start the task, complete the action, and pass server-side verification or admin review.",
  },
  {
    q: "When do referral rewards post?",
    a: "After the referred member meets the qualification (a completed task by default). Self-referrals are rejected.",
  },
  {
    q: "How are payouts sent?",
    a: "Easypaisa, JazzCash, bank transfer, or voucher — all require admin approval. We never show your account number publicly.",
  },
];

function SupportPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [category, setCategory] = useState<"general" | "task" | "payment">("general");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const tickets = useQuery({
    queryKey: ["tickets"],
    enabled: !!user,
    queryFn: () => listTickets(),
  });
  const create = useMutation({
    mutationFn: () => createTicket({ data: { category, subject, body } }),
    onSuccess: () => {
      toast.success("Ticket opened");
      setSubject("");
      setBody("");
      void qc.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (isPending) return <AppShell title="Support"><Skeleton className="h-40 rounded-xl" /></AppShell>;
  if (!user) return <RedirectToSignIn />;

  return (
    <AppShell title="Support">
      <h2 className="text-sm font-semibold">FAQ</h2>
      <div className="mt-2 space-y-2">
        {FAQ.map((f) => (
          <Card key={f.q}>
            <p className="text-sm font-medium">{f.q}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{f.a}</p>
          </Card>
        ))}
      </div>
      <h2 className="mt-6 text-sm font-semibold">Contact support</h2>
      <Card className="mt-2 space-y-3">
        <div className="grid grid-cols-3 gap-1">
          {(["general", "task", "payment"] as const).map((c) => (
            <Button key={c} size="sm" variant={category === c ? "default" : "secondary"} onClick={() => setCategory(c)}>
              {c === "task" ? "Report task" : c === "payment" ? "Payment" : "General"}
            </Button>
          ))}
        </div>
        <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea placeholder="Describe the issue" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button className="w-full" disabled={create.isPending} onClick={() => create.mutate()}>
          Open ticket
        </Button>
      </Card>
      <h2 className="mt-6 text-sm font-semibold">Your tickets</h2>
      <div className="mt-2 space-y-2">
        {(tickets.data ?? []).map((t) => (
          <Link key={t.id} to="/support/$ticketId" params={{ ticketId: String(t.id) }} className="block">
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-xs text-subtle">{timeAgo(t.updatedAt)}</p>
              </div>
              <Badge>{t.status}</Badge>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
