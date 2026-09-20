import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/legal/privacy")({ component: Privacy });

function Privacy() {
  return (
    <AppShell title="Privacy">
      <article className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          We store the account identity you sign in with, your points ledger, task completions,
          referral graph, and payout details you submit for a redemption.
        </p>
        <p>
          Payout numbers are never shown on leaderboards or public pages. Admins can view them only
          to process a request.
        </p>
        <p>
          Telegram Mini App data is used only when you open the app inside Telegram. Bot tokens and
          database credentials stay on the server.
        </p>
        <p>
          Replace this notice with a full privacy policy before production, including how long
          ledgers are retained and how to request deletion.
        </p>
      </article>
    </AppShell>
  );
}
