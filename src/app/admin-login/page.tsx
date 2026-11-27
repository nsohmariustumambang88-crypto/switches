import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/config/site";
import { OwnerSignIn } from "./owner-sign-in";

export const metadata: Metadata = {
  title: "Back office sign-in",
  robots: { index: false, follow: false },
};

/** /admin-login — the only way into /admin without a Supabase admin account. */
export default function AdminLoginPage() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center bg-ink px-4 py-16 text-primary-foreground">
      <div className="w-full max-w-sm">
        <p className="relative isolate font-display text-[3rem] leading-none">
          <span aria-hidden="true" className="echo-layer absolute inset-0 -z-10 text-ink-2 [--echo-x:-0.07em] [--echo-y:-0.06em]">
            {site.name}
          </span>
          <span className="relative">{site.name}</span>
        </p>
        <p className="mt-2 label-caps text-echo">Back office</p>
        <Suspense fallback={<div className="mt-10 h-64" />}>
          <OwnerSignIn />
        </Suspense>
      </div>
    </main>
  );
}
