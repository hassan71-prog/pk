import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminListVerifications, adminReviewTask } from "@/lib/server/admin.functions";
import { errorMessage, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/verification")({ component: VerificationPage });

function VerificationPage() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin-verify"], queryFn: () => adminListVerifications() });
  const review = useMutation({
    mutationFn: (p: { completionId: number; approve: boolean }) => adminReviewTask({ data: p }),
    onSuccess: () => {
      toast.success("Review saved");
      void qc.invalidateQueries({ queryKey: ["admin-verify"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <AdminShell title="Task verification">
      {(list.data ?? []).length === 0 ? (
        <p className="text-sm text-muted">No pending submissions.</p>
      ) : (
        <div className="space-y-3">
          {(list.data ?? []).map((c) => (
            <Card key={c.id}>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-muted">
                {c.displayName} · +{c.rewardPoints} · {c.submittedAt ? timeAgo(c.submittedAt) : ""}
              </p>
              {c.proofNote ? <p className="mt-2 text-sm">{c.proofNote}</p> : null}
              {c.proofUrl ? (
                <a href={c.proofUrl} className="mt-1 block text-xs text-primary break-all" target="_blank" rel="noreferrer">
                  {c.proofUrl}
                </a>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => review.mutate({ completionId: c.id, approve: true })}>
                  Approve
                </Button>
                <Button size="sm" variant="danger" onClick={() => review.mutate({ completionId: c.id, approve: false })}>
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
