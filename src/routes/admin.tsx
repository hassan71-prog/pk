import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMeAdminFlag } from "@/lib/server/user.functions";

export const Route = createFileRoute("/admin")({
  component: AdminGate,
});

function AdminGate() {
  const { user, isPending } = useCurrentUserState();
  const admin = useQuery({
    queryKey: ["me-admin"],
    enabled: !!user,
    queryFn: () => getMeAdminFlag(),
  });
  if (isPending || (user && admin.isPending)) {
    return <div className="min-h-dvh bg-bg" />;
  }
  if (!user) return <RedirectToSignIn />;
  if (!admin.data?.isAdmin) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div>
          <h1 className="text-lg font-semibold">Admin only</h1>
          <p className="mt-2 text-sm text-muted">This workspace is limited to operators.</p>
        </div>
      </main>
    );
  }
  return <Outlet />;
}
