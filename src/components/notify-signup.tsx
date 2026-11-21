"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Email capture → POST /api/subscribe. Used on /shipping for international visitors. */
export function NotifySignup({ source = "international" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error" | "offline">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("busy");
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country, source, website }),
      });
      if (r.ok) return setState("done");
      if (r.status === 503) return setState("offline");
      const d = await r.json().catch(() => ({}));
      setMessage(d.error ?? "Check the email address and try again.");
      setState("error");
    } catch {
      setMessage("Network error. Try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return <p className="rounded-lg bg-surface p-4 text-sm font-semibold">Thanks. We&apos;ll email you if that changes.</p>;
  }
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
      <div>
        <Label htmlFor="notify-email" className="mb-1.5 block text-xs font-bold text-ink-2">Email</Label>
        <Input id="notify-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-lg border-transparent bg-surface px-3.5" />
      </div>
      <div>
        <Label htmlFor="notify-country" className="mb-1.5 block text-xs font-bold text-ink-2">Country</Label>
        <Input id="notify-country" autoComplete="country-name" value={country} onChange={(e) => setCountry(e.target.value)} className="h-12 rounded-lg border-transparent bg-surface px-3.5" />
      </div>
      {/* Honeypot, hidden from people and assistive tech. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <Button type="submit" size="lg" disabled={state === "busy"} className="h-12">
        {state === "busy" ? "Saving…" : "Notify me"}
      </Button>
      {state === "error" && <p className="text-sm font-semibold text-destructive sm:col-span-3">{message}</p>}
      {state === "offline" && <p className="text-sm text-ink-2 sm:col-span-3">Sign-ups open when the store goes live.</p>}
    </form>
  );
}
