import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminListVerifications, adminReviewTask } from "@/lib/server/admin.functions";
import { errorMessage, timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/admin/verification")({ component: VerificationPage });

function VerificationPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rejectReason, setRejectReason] = useState("");

  const list = useQuery({ queryKey: ["admin-verify"], queryFn: () => adminListVerifications() });

  const review = useMutation({
    mutationFn: (p: { completionId: number; approve: boolean }) => adminReviewTask({ data: p }),
    onSuccess: () => {
      toast.success("Review saved");
      void qc.invalidateQueries({ queryKey: ["admin-verify"] });
      setSelected(new Set());
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const items = list.data ?? [];

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkReview(approve: boolean) {
    const ids = Array.from(selected);
    let ok = 0;
    for (const id of ids) {
      try {
        await adminReviewTask({ data: { completionId: id, approve } });
        ok += 1;
      } catch {
        /* continue */
      }
    }
    toast.success(`${ok}/${ids.length} processed`);
    setSelected(new Set());
    void qc.invalidateQueries({ queryKey: ["admin-verify"] });
  }

  function isImageUrl(url: string) {
    return /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url) || url.includes("image");
  }

  return (
    <AdminShell title="Task verification">
      {selected.size > 0 ? (
        <Card className="mb-4 flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium">{selected.size} selected</p>
          <Button size="sm" onClick={() => bulkReview(true)}>
            Bulk Approve
          </Button>
          <Button size="sm" variant="danger" onClick={() => bulkReview(false)}>
            Bulk Reject
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </Card>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-muted">No pending submissions.</p>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 size-4"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted">
                    {c.displayName} · +{c.rewardPoints} · {c.submittedAt ? timeAgo(c.submittedAt) : ""}
                  </p>
                  {c.proofNote ? <p className="mt-2 text-sm">{c.proofNote}</p> : null}
                  {c.proofUrl ? (
                    <div className="mt-2">
                      {isImageUrl(c.proofUrl) ? (
                        <a href={c.proofUrl} target="_blank" rel="noreferrer">
                          <img
                            src={c.proofUrl}
                            alt="Proof"
                            className="max-h-48 max-w-full rounded-md border border-border object-contain"
                          />
                        </a>
                      ) : (
                        <a
                          href={c.proofUrl}
                          className="block text-xs text-primary break-all"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {c.proofUrl}
                        </a>
                      )}
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => review.mutate({ completionId: c.id, approve: true })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => review.mutate({ completionId: c.id, approve: false })}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
