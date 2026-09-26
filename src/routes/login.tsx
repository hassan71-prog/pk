import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { errorMessage } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  async function onOAuth(providerId: string) {
    if (oauthBusy || busy) return;
    setOauthBusy(true);
    try {
      await signIn(providerId, { callbackURL: "/" });
    } catch (err) {
      toast.error(errorMessage(err));
      setOauthBusy(false);
    }
  }

  if (isPending) {
    return <div className="app-bg min-h-dvh" />;
  }
  if (user) return <Navigate to="/" />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({ name: name || email.split("@")[0]!, email, password });
        if (res.error) throw new Error(res.error.message);
      }
      const res = await authClient.signIn.email({ email, password });
      if (res.error) throw new Error(res.error.message);
      window.location.href = "/";
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <main className="app-bg mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <Logo className="mb-8" />
      <h1 className="font-display text-3xl font-bold tracking-tight">Earn <span className="text-primary">rewards</span> daily</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Complete sponsored tasks for Pakistani brands. Points are platform rewards — not a
        guaranteed payout, investment, or currency.
      </p>

      {authEnabled ? (
        <div className="mt-8 space-y-3">
          {GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              type="button"
              variant="secondary"
              className="w-full"
              disabled={oauthBusy || busy}
              onClick={() => void onOAuth(p.providerId)}
            >
              {oauthBusy ? "Redirecting…" : `Continue with ${p.label}`}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p>
      )}

      <div className="my-6 flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-border" />
        Email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-3" onSubmit={onEmail}>
        {mode === "up" ? (
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        ) : null}
        <Input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          type="password"
          required
          minLength={8}
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "up" ? "new-password" : "current-password"}
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-4 text-sm text-muted"
        onClick={() => setMode(mode === "up" ? "in" : "up")}
      >
        {mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </main>
  );
}
