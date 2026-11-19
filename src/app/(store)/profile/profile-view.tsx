"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { readStorage, useBrowserValue } from "@/lib/use-browser-value";
import {
  Bell,
  ChevronRight,
  CreditCard,
  Heart,
  Info,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";
import { site } from "@/config/site";
import { useStore } from "@/lib/store";
import { clearViewerCache } from "@/components/boot";
import { PageBar } from "@/components/page-bar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const row =
  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-3.5 text-[0.9375rem] font-semibold transition-colors hover:bg-ink/6";

export function ProfileView() {
  const router = useRouter();
  const orders = useStore((s) => (s.hydrated ? s.orders.length : 0));
  const saved = useStore((s) => (s.hydrated ? s.wishlist.length : 0));
  const viewer = useStore((s) => s.viewer);
  const ageOk = useBrowserValue(() => !!readStorage("local", "age-ok"), false);
  const name = viewer?.fullName || viewer?.email || "Guest shopper";

  // POST /api/auth/sign-out
  const signOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {});
    clearViewerCache();
    useStore.getState().setViewer(null, useStore.getState().backend);
    toast("Signed out");
    router.refresh();
  };

  return (
    <>
      <PageBar title="Profile" back={false} />
      {/* Header block (kit screen 10): inked panel with the account identity. */}
      <section className="bg-ink text-primary-foreground">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-3 px-4 pt-8 pb-10 text-center md:flex-row md:items-end md:gap-8 md:px-6 md:pt-16 md:pb-14 md:text-left lg:px-10">
          <span className="grid size-24 place-items-center rounded-lg bg-panel font-display text-[2.75rem] text-ink uppercase md:size-32 md:text-6xl">
            {name.charAt(0)}
          </span>
          <div className="min-w-0 md:flex-1">
            <h1 className="truncate text-2xl font-extrabold md:text-5xl md:tracking-[-0.02em]">{name}</h1>
            <p className="mt-1 text-sm text-echo">
              {viewer ? `${viewer.email}${viewer.role === "admin" ? " · Admin" : ""}` : "Not signed in"}
            </p>
            {ageOk && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ground px-2.5 py-1.5 text-xs font-bold text-ink">
                <ShieldCheck className="size-3.5" />
                Age confirmed {site.minimumAge}+
              </span>
            )}
          </div>
          {viewer ? (
            <div className="mt-2 flex gap-2 md:mt-0">
              {viewer.role === "admin" && (
                <Link href="/admin" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  <LayoutDashboard />
                  Admin
                </Link>
              )}
              <Button variant="outline" size="lg" onClick={signOut} className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground hover:text-ink">
                <LogOut />
                Sign out
              </Button>
            </div>
          ) : (
            <Link href="/welcome" className={buttonVariants({ variant: "secondary", size: "lg", className: "mt-2 md:mt-0" })}>
              Sign in or create account
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pt-4 md:px-6 md:pt-10">
        <nav aria-label="Account">
          <ul className="divide-y divide-ink/12">
            <li>
              <Link href="/orders" className={row}>
                <Package className="size-5" strokeWidth={1.75} />
                <span className="flex-1">My orders</span>
                <span className="text-sm text-ink-2 tabular-nums">{orders || ""}</span>
                <ChevronRight className="size-4" />
              </Link>
            </li>
            <li>
              <Link href="/favorites" className={row}>
                <Heart className="size-5" strokeWidth={1.75} />
                <span className="flex-1">My favorites</span>
                <span className="text-sm text-ink-2 tabular-nums">{saved || ""}</span>
                <ChevronRight className="size-4" />
              </Link>
            </li>
          </ul>
          <Accordion className="border-t border-ink/12">
            {[
              { v: "addresses", icon: MapPin, label: "My addresses", body: "No saved addresses yet. Addresses you use at checkout will appear here once accounts are connected." },
              { v: "payment", icon: CreditCard, label: "Payment methods", body: "No saved payment methods. Cards and bank accounts are added at checkout." },
              { v: "notifications", icon: Bell, label: "Notifications", body: "Order and shipping updates are sent by email. Notification settings arrive with account sign-in." },
              { v: "help", icon: LifeBuoy, label: "Help & support", body: `Email ${site.supportEmail} or call ${site.supportPhone}. For FFL transfer questions, contact your chosen dealer.` },
              { v: "about", icon: Info, label: `About ${site.name}`, body: `${site.description} All firearm sales ship to a licensed FFL and require a background check.` },
            ].map(({ v, icon: Icon, label, body }) => (
              <AccordionItem key={v} value={v} className="border-ink/12">
                <AccordionTrigger className="items-center gap-3 rounded-lg px-1 py-3.5 text-[0.9375rem] font-semibold hover:bg-ink/6 hover:no-underline">
                  <span className="flex flex-1 items-center gap-3">
                    <Icon className="size-5" strokeWidth={1.75} />
                    {label}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pr-2 pl-9 text-sm leading-relaxed text-ink-2">
                  <p>{body}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </nav>
      </div>
    </>
  );
}
