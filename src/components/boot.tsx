"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { useStore } from "@/lib/store";
import { readStorage, useBrowserValue } from "@/lib/use-browser-value";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

/** Inline script: hides the splash before first paint on repeat visits. */
const bootScript = `(function(){try{if(sessionStorage.getItem("splash-seen"))document.documentElement.setAttribute("data-splash","seen")}catch(e){}})()`;

/**
 * Emits the boot script into <head> as raw HTML via useServerInsertedHTML, so it
 * is not part of React's tree. Security suites and extensions (e.g. Kaspersky
 * web protection) inject their own <script> tags into <head>; a React-rendered
 * <script> there collides with them and throws a hydration mismatch.
 */
export function BootScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script id="boot-splash" dangerouslySetInnerHTML={{ __html: bootScript }} />;
  });
  return null;
}

export function StoreHydrator() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);
  return null;
}

/**
 * Loads the signed-in viewer from GET /api/auth/me and, when signed in,
 * merges server favorites (GET /api/wishlist) with this browser's list.
 */
export function ViewerSync() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const { configured, viewer } = await res.json();
        if (cancelled) return;
        useStore.getState().setViewer(viewer ?? null, !!configured);
        if (viewer) {
          const w = await fetch("/api/wishlist", { cache: "no-store" });
          if (w.ok && !cancelled) {
            const { slugs } = (await w.json()) as { slugs: string[] };
            const local = useStore.getState().wishlist;
            useStore.getState().setWishlist([...new Set([...local, ...slugs])]);
          }
        }
      } catch {
        // Offline or API unavailable: stay in local-only mode.
        if (!cancelled) useStore.getState().setViewer(null, false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

/**
 * Splash (kit screen 1): the wordmark registers, a loading rule runs, then
 * the whole poster wipes upward off the store.
 */
export function Splash() {
  const root = useRef<HTMLDivElement>(null);
  const seen = useBrowserValue(() => !!readStorage("session", "splash-seen"), false);
  const [finished, setFinished] = useState(false);
  const done = seen || finished;

  // Dev Strict Mode resets <html> attributes on remount; re-apply the flag.
  useLayoutEffect(() => {
    if (seen) document.documentElement.setAttribute("data-splash", "seen");
  }, [seen]);

  const finish = () => {
    try {
      sessionStorage.setItem("splash-seen", "1");
    } catch {}
    document.documentElement.setAttribute("data-splash", "seen");
    setFinished(true);
  };

  useGSAP(
    () => {
      if (done || !root.current) return;
      const el = root.current;
      if (prefersReducedMotion()) {
        gsap.to(el, { autoAlpha: 0, duration: 0.3, delay: 0.6, onComplete: finish });
        return;
      }
      const tl = gsap.timeline({ onComplete: finish });
      tl.from("[data-splash-word] span", { yPercent: 105, stagger: 0.06, duration: 1 })
        .from("[data-splash-echo]", { "--echo-p": 0, duration: 1.2 }, 0.25)
        .from("[data-splash-meta]", { autoAlpha: 0, y: 8, duration: 0.6 }, 0.5)
        .fromTo("[data-splash-bar]", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.4)
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, "+=0.15");
    },
    { scope: root, dependencies: [done] }
  );

  if (done) return null;

  const letters = site.name.split("");
  return (
    <div
      ref={root}
      data-splash-root
      role="presentation"
      onClick={finish}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col bg-ground px-6 [clip-path:inset(0_0_0_0)]"
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="relative isolate font-display text-[min(22vw,10rem)] uppercase">
          <span data-splash-echo aria-hidden="true" className="echo-layer absolute inset-0 -z-10 text-echo">
            {site.name}
          </span>
          <span data-splash-word className="relative flex overflow-hidden">
            {letters.map((l, i) => (
              <span key={i} className="inline-block">
                {l}
              </span>
            ))}
          </span>
        </p>
        <p data-splash-meta className="mt-5 label-caps text-ink-2">
          {site.tagline}
        </p>
      </div>
      <div className="mx-auto mb-[calc(3rem+env(safe-area-inset-bottom))] h-[3px] w-40 overflow-hidden bg-ink/15">
        <div data-splash-bar className="h-full origin-left bg-ink" />
      </div>
    </div>
  );
}

/** Age gate: required before browsing a firearms store. */
export function AgeGate() {
  const needed = useBrowserValue(() => !readStorage("local", "age-ok"), false);
  const [confirmed, setConfirmed] = useState(false);
  const [refused, setRefused] = useState(false);
  const open = needed && !confirmed;

  const confirm = () => {
    try {
      localStorage.setItem("age-ok", "1");
    } catch {}
    setConfirmed(true);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} disablePointerDismissal>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] gap-0 rounded-lg bg-ground p-0 ring-0 sm:max-w-md"
      >
        <div className="relative overflow-hidden bg-panel px-6 pt-8 pb-6">
          <p aria-hidden="true" className="relative isolate font-display text-[7.5rem]">
            <span className="echo-layer absolute inset-0 -z-10 text-echo">{site.minimumAge}+</span>
            <span className="relative">{site.minimumAge}+</span>
          </p>
        </div>
        <div className="space-y-3 px-6 pt-6 pb-6">
          {refused ? (
            <>
              <DialogTitle className="text-xl font-extrabold">Sorry, you can’t enter</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-ink-2">
                You must be {site.minimumAge} or older to use this store. Close this tab to leave.
              </DialogDescription>
              <Button variant="outline" size="lg" className="mt-2 w-full" onClick={() => setRefused(false)}>
                Go back
              </Button>
            </>
          ) : (
            <>
              <DialogTitle className="text-xl font-extrabold">Confirm your age</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-ink-2">
                This store sells firearms and ammunition. You must be {site.minimumAge} or older to
                enter. Your age is verified again at checkout and at the FFL dealer.
              </DialogDescription>
              <div className="grid gap-2 pt-3">
                <Button size="lg" onClick={confirm}>
                  I’m {site.minimumAge} or older
                </Button>
                <Button variant="outline" size="lg" onClick={() => setRefused(true)}>
                  I’m under {site.minimumAge}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
