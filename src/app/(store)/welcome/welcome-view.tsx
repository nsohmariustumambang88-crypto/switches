"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Checkbox } from "@/components/ui/checkbox";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { EchoType } from "@/components/echo-type";
import { ProductImage } from "@/components/product-card";
import { AppleMark, GoogleMark } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const slides = ["glock-19-gen5-fde", "hornady-critical-defense-9mm", "rare-breed-frt-15"].map(
  (s) => getProduct(s)!
);

/** Welcome / onboarding (kit screen 2). */
export function WelcomeView() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<null | "create" | "signin">(null);
  const stage = useRef<HTMLDivElement>(null);

  // Slides cross-cut every 3.2s: the outgoing shot slides left, the next rises in.
  useGSAP(
    () => {
      if (!stage.current) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-slide]", stage.current);
      gsap.set(items, { autoAlpha: (i: number) => (i === index ? 1 : 0) });
      if (prefersReducedMotion()) return;
      const id = window.setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, 3200);
      return () => window.clearInterval(id);
    },
    { scope: stage, dependencies: [] }
  );

  useGSAP(
    () => {
      if (!stage.current) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-slide]", stage.current);
      items.forEach((el, i) => {
        if (i === index) gsap.fromTo(el, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.9 });
        else gsap.to(el, { autoAlpha: 0, x: -40, duration: 0.6, ease: "power2.in" });
      });
    },
    { scope: stage, dependencies: [index] }
  );

  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // POST /api/auth/sign-in | /api/auth/sign-up, then return to ?next= (e.g. /admin) or /profile.
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch(mode === "create" ? "/api/auth/sign-up" : "/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "create"
            ? { fullName: f.get("name"), email: f.get("email"), password: f.get("password"), ageConfirmed: f.get("age") === "on" }
            : { email: f.get("email"), password: f.get("password") }
        ),
      });
      const data = await res.json();
      if (res.status === 503) {
        setFormError("Accounts open once the store's database is connected.");
        return;
      }
      if (!res.ok) {
        setFormError(data.error === "Invalid request." ? "Check the highlighted details and try again." : data.error);
        return;
      }
      if (data.needsConfirmation) {
        setMode(null);
        toast.success("Check your email", { description: "Confirm your address to finish creating the account." });
        return;
      }
      useStore.getState().setViewer(data.viewer, true);
      setMode(null);
      toast.success(mode === "create" ? "Account created" : "Signed in");
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile");
    } catch {
      setFormError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-1rem)] max-w-[90rem] flex-col px-5 pt-6 md:grid md:min-h-0 md:grid-cols-12 md:gap-12 md:px-6 md:pt-16 lg:px-10">
      <div className="flex items-center justify-end md:hidden">
        <Link href="/" className="text-sm font-bold underline-offset-4 hover:underline">
          Skip
        </Link>
      </div>

      <div className="mt-2 md:col-span-5 md:mt-0 md:flex md:flex-col md:justify-center">
        <p className="text-2xl leading-tight font-extrabold md:text-3xl">Welcome to</p>
        <EchoType text={site.name} as="h1" className="mt-1 font-display text-[clamp(4.25rem,22vw,9rem)]" />
        <p className="mt-4 text-[0.9375rem] text-ink-2">{site.tagline}</p>

        <div className="hidden md:mt-12 md:block">
          <Actions onCreate={() => setMode("create")} onSignIn={() => setMode("signin")} />
        </div>
      </div>

      <div className="relative mt-6 md:col-span-7 md:mt-0">
        <div ref={stage} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-panel md:aspect-square">
          {slides.map((p, i) => (
            <div key={p.slug} data-slide className="absolute inset-0" aria-hidden={i !== index}>
              <ProductImage product={p} sizes="(min-width: 768px) 50vw, 100vw" pad="p-[10%]" priority={i === 0} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Slides">
          {slides.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${p.name}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 cursor-pointer rounded-[2px] transition-[width,background-color] duration-500 ease-out-expo",
                i === index ? "w-8 bg-ink" : "w-3 bg-ink/25 hover:bg-ink/50"
              )}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8 pb-6 md:hidden">
        <Actions onCreate={() => setMode("create")} onSignIn={() => setMode("signin")} />
      </div>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] gap-5 rounded-lg bg-ground p-6 ring-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">
              {mode === "create" ? "Create account" : "Sign in"}
            </DialogTitle>
            <DialogDescription className="text-ink-2">
              {mode === "create"
                ? "Save addresses, FFL dealers and order history."
                : "Welcome back."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="grid gap-3">
            {mode === "create" && (
              <div>
                <Label htmlFor="w-name" className="mb-1.5 block text-xs font-bold text-ink-2">Full name</Label>
                <Input id="w-name" name="name" autoComplete="name" required className="h-12 rounded-lg border-transparent bg-surface px-3.5 text-[0.9375rem] focus-visible:border-ink focus-visible:ring-0" />
              </div>
            )}
            <div>
              <Label htmlFor="w-email" className="mb-1.5 block text-xs font-bold text-ink-2">Email</Label>
              <Input id="w-email" name="email" type="email" autoComplete="email" required className="h-12 rounded-lg border-transparent bg-surface px-3.5 text-[0.9375rem] focus-visible:border-ink focus-visible:ring-0" />
            </div>
            <div>
              <Label htmlFor="w-pass" className="mb-1.5 block text-xs font-bold text-ink-2">Password</Label>
              <Input id="w-pass" name="password" type="password" autoComplete={mode === "create" ? "new-password" : "current-password"} required minLength={8} className="h-12 rounded-lg border-transparent bg-surface px-3.5 text-[0.9375rem] focus-visible:border-ink focus-visible:ring-0" />
            </div>
            {mode === "create" && (
              <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
                <Checkbox name="age" required className="mt-0.5" />
                I’m {site.minimumAge} or older.
              </label>
            )}
            {formError && (
              <p role="alert" className="rounded-lg bg-danger px-3 py-2 text-sm text-primary-foreground">
                {formError}
              </p>
            )}
            <Button type="submit" size="lg" className="mt-2" disabled={busy}>
              {busy ? "One moment…" : mode === "create" ? "Create account" : "Sign in"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Actions({ onCreate, onSignIn }: { onCreate: () => void; onSignIn: () => void }) {
  const social = (name: string) =>
    toast("Demo mode", { description: `${name} sign-in connects with Supabase Auth in the next phase.` });
  return (
    <div className="grid gap-3">
      <Button size="xl" onClick={onCreate}>
        Create account
      </Button>
      <Button size="xl" variant="outline" onClick={onSignIn}>
        Sign in
      </Button>
      <p className="mt-3 text-center text-xs font-semibold text-ink-2 md:text-left">or continue with</p>
      <div className="flex justify-center gap-3 md:justify-start">
        <Button variant="secondary" size="icon-lg" aria-label="Continue with Google" onClick={() => social("Google")}>
          <GoogleMark className="size-5" />
        </Button>
        <Button variant="secondary" size="icon-lg" aria-label="Continue with Apple" onClick={() => social("Apple")}>
          <AppleMark className="size-5" />
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-ink-2 md:text-left">
        You must be {site.minimumAge}+ to buy handguns. Firearms ship to a licensed FFL.
      </p>
    </div>
  );
}
