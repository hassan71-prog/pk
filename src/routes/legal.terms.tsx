import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/legal/terms")({ component: Terms });

function Terms() {
  return (
    <AppShell title="Terms">
      <article className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          TaskEarn PK is a rewards platform. By using the app you agree that points are a promotional
          balance, not money, not a security, and not a guaranteed claim against the operator.
        </p>
        <p>
          Tasks may require verification. Fraud, multi-accounting, self-referrals, and automated
          completion are grounds for suspension and reversal of points.
        </p>
        <p>
          Redemptions are processed only after admin review and only when a corresponding campaign or
          catalogue item has remaining budget. Processing times for Easypaisa, JazzCash, and bank
          transfers are not guaranteed.
        </p>
        <p>
          The first production operator should replace this placeholder with counsel-reviewed terms
          before taking live sponsor funds.
        </p>
      </article>
    </AppShell>
  );
}
