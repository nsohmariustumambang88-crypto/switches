"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const field =
  "h-12 w-full rounded-lg border border-white/15 bg-white/8 px-3.5 text-[0.9375rem] text-primary-foreground outline-none placeholder:text-echo focus-visible:border-white/60";

/** POST /api/auth/owner, then back to the admin page that was requested. */
export function OwnerSignIn() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "";
  // Only ever return to an admin path (no open redirects).
  const target = /^\/admin(\/|$)/.test(next) ? next : "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) {
        router.replace(target);
        router.refresh();
        return;
      }
      const d = await r.json().catch(() => ({}));
      setError(d.error ?? "Sign-in failed.");
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mt-10 space-y-4">
      <div>
        <label htmlFor="owner-email" className="mb-1.5 block text-xs font-bold text-echo">Email</label>
        <input id="owner-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="owner-password" className="mb-1.5 block text-xs font-bold text-echo">Password</label>
        <input id="owner-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#ff8a80]">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={busy} className="h-12 w-full bg-primary-foreground text-ink hover:bg-primary-foreground/90">
        <Lock />
        {busy ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-xs leading-relaxed text-echo">Staff only. Sessions end after 12 hours.</p>
    </form>
  );
}
