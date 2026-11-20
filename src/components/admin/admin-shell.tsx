"use client";

import Link from "next/link";
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

/** Access states rendered by the shell before showing admin pages. */
export function AdminGateView({ children }: { children: React.ReactNode }) {
  const viewer = useStore((s) => s.viewer);
  const backend = useStore((s) => s.backend);
  const checked = useStore((s) => s.viewerChecked);

  // Render the page while the session check runs (keeps the segment renderable for
  // prerender/instant-navigation validation). Data stays protected: every
  // /api/admin/* call re-checks the admin role on the server.
  if (checked && backend && !viewer) {
    return (
      <Gate title="Sign in required" body="Sign in with an admin account to manage the store.">
        <Link href="/welcome?next=/admin" className={buttonVariants({ size: "lg" })}>
          Sign in
        </Link>
      </Gate>
    );
  }
  if (checked && backend && viewer?.role !== "admin") {
    return (
      <Gate title="Not an admin" body={`${viewer?.email} doesn’t have admin access. Ask an admin to promote this account, or run npm run db:make-admin.`}>
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
  const viewer = useStore((s) => s.viewer);
  if (!viewer) return null;
  return (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <p className="truncate text-xs text-echo">{viewer.email}</p>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-echo hover:bg-white/8 hover:text-primary-foreground"
        onClick={async () => {
          await fetch("/api/auth/sign-out", { method: "POST" });
          clearViewerCache();
          useStore.getState().setViewer(null, true);
          router.push("/");
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
