import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { adminListTickets, adminReplyTicket } from "@/lib/server/admin.functions";
import { errorMessage, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/tickets")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const [id, setId] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const list = useQuery({ queryKey: ["admin-tickets"], queryFn: () => adminListTickets() });
  const reply = useMutation({
    mutationFn: () => adminReplyTicket({ data: { id: id!, body, status: "pending" } }),
    onSuccess: () => {
      toast.success("Replied");
      setBody("");
      void qc.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <AdminShell title="Tickets">
      <div className="space-y-2">
        {(list.data ?? []).map((t) => (
          <Card key={t.id} className={id === t.id ? "border-primary" : ""}>
            <button type="button" className="w-full text-left" onClick={() => setId(t.id)}>
              <div className="flex justify-between">
                <p className="text-sm font-medium">{t.subject}</p>
                <Badge>{t.status}</Badge>
              </div>
              <p className="text-xs text-muted">
                {t.displayName} · {t.category} · {timeAgo(t.updatedAt)}
              </p>
            </button>
          </Card>
        ))}
      </div>
      {id ? (
        <div className="mt-4 space-y-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply" />
          <Button onClick={() => reply.mutate()} disabled={reply.isPending}>
            Send reply
          </Button>
        </div>
      ) : null}
    </AdminShell>
  );
}
