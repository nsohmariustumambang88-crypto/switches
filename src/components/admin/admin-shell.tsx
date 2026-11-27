"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Cog,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import { useStore } from "@/lib/store";
import { clearViewerCache } from "@/components/boot";
import { Button, buttonVariants } from "@/components/ui/button";

export const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/products", label: "Products", icon: Tags },
  { href: "/admin/learn", label: "Learn", icon: BookOpen },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/dealers", label: "FFL dealers", icon: Store },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Cog },
];

function NavList({ pathname, compact }: { pathname: string | null; compact?: boolean }) {
  return (
    <ul className={cn(compact ? "no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2" : "space-y-0.5")}>
      {adminNav.map(({ href, label, icon: Icon, exact }) => {
        const active = pathname ? (exact ? pathname === href : pathname.startsWith(href)) : false;
        return (
          <li key={href} className={compact ? "shrink-0" : undefined}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-lg text-sm font-semibold transition-colors",
                compact ? "h-9 px-3" : "h-11 px-3",
                active ? "bg-primary-foreground text-ink" : "text-echo hover:bg-white/8 hover:text-primary-foreground"
              )}
            >
              <Icon className="size-[1.125rem]" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav() {
  return <NavList pathname={usePathname()} />;
}
export function AdminNavCompact() {
  return <NavList pathname={usePathname()} compact />;
}
export function AdminNavFallback({ compact }: { compact?: boolean }) {
  return <NavList pathname={null} compact={compact} />;
}

type AdminSession = { email: string; via: "owner" | "supabase"; demo: boolean };
type SessionState = { status: "checking" } | { status: "ok"; session: AdminSession } | { status: "signin" } | { status: "denied"; message: string };

// One GET /api/admin/session per page load, shared by the gate and the account menu.
let sessionRequest: Promise<SessionState> | null = null;
function loadSession(): Promise<SessionState> {
  sessionRequest ??= fetch("/api/admin/session", { cache: "no-store" })
    .then(async (r): Promise<SessionState> => {
      const body = await r.json().catch(() => ({}));
      if (r.ok) return { status: "ok", session: body as AdminSession };
      if (r.status === 401) return { status: "signin" };
      return { status: "denied", message: body.error ?? "This account can't use the back office." };
    })
    .catch((): SessionState => ({ status: "signin" }));
  return sessionRequest;
}
const forgetSession = () => {
  sessionRequest = null;
};

function useAdminSession() {
  const [state, setState] = useState<SessionState>({ status: "checking" });
  useEffect(() => {
    let live = true;
    loadSession().then((s) => live && setState(s));
    return () => {
      live = false;
    };
  }, []);
  return state;
}

/**
 * Access states rendered by the shell. The proxy already turns away visitors
 * without a session and every /api/admin/* handler re-checks; this handles an
 * expired session (back to sign-in) and signed-in customers who aren't admins.
 * Pages render while the check runs, so the segment stays prerenderable.
 */
export function AdminGateView({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const state = useAdminSession();
  useEffect(() => {
    // Read the URL in the browser only: the shell must stay prerenderable.
    if (state.status === "signin") router.replace(`/admin-login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [state.status, router]);

  if (state.status === "signin") return <Gate title="Sign in required" body="Your session ended. Taking you to sign-in…">{null}</Gate>;
  if (state.status === "denied") {
    return (
      <Gate title="Not an admin" body={state.message}>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Back to the store
        </Link>
      </Gate>
    );
  }
  return <>{children}</>;
}

function Gate({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-start justify-center gap-4">
      <p aria-hidden="true" className="relative isolate font-display text-[6rem]">
        <span className="echo-layer absolute inset-0 -z-10 text-echo">403</span>
        <span className="relative">403</span>
      </p>
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-2">{body}</p>
      {children}
    </div>
  );
}

export function DemoStrip() {
  const backend = useStore((s) => s.backend);
  const checked = useStore((s) => s.viewerChecked);
  if (!checked || backend) return null;
  return (
    <p className="bg-ink-2 px-4 py-2 text-xs text-primary-foreground md:px-8">
      <strong className="font-bold">Demo mode — read-only.</strong> Supabase isn’t connected yet, so this shows the
      built-in catalog and sample orders. Add the keys to <code>.env.local</code>, then run{" "}
      <code>npm run db:migrate</code> and <code>npm run db:seed</code>.
    </p>
  );
}

export function AdminAccount() {
  const router = useRouter();
  const state = useAdminSession();
  if (state.status !== "ok") return null;
  return (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <p className="truncate text-xs text-echo">{state.session.email}</p>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-echo hover:bg-white/8 hover:text-primary-foreground"
        onClick={async () => {
          await Promise.allSettled([
            fetch("/api/auth/owner", { method: "DELETE" }),
            fetch("/api/auth/sign-out", { method: "POST" }),
          ]);
          forgetSession();
          clearViewerCache();
          useStore.getState().setViewer(null, useStore.getState().backend);
          router.replace("/admin-login");
        }}
      >
        <LogOut />
        Sign out
      </Button>
    </div>
  );
}

export function StoreLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-1 text-sm font-semibold text-echo hover:text-primary-foreground", className)}>
      View {site.name}
      <ArrowUpRight className="size-4" />
    </Link>
  );
}
