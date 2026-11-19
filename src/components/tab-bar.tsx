"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Heart, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: House, match: (p: string) => p === "/" },
  { href: "/categories", label: "Categories", icon: LayoutGrid, match: (p: string) => p.startsWith("/categories") || p.startsWith("/shop") },
  { href: "/favorites", label: "Favorites", icon: Heart, match: (p: string) => p.startsWith("/favorites") },
  { href: "/orders", label: "Orders", icon: Package, match: (p: string) => p.startsWith("/orders") },
  { href: "/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/profile") },
];

// Screens that carry their own sticky action bar instead of the tab bar.
const HIDDEN = ["/product/", "/cart", "/checkout", "/welcome"];

function Bar({ pathname }: { pathname: string | null }) {
  if (pathname && HIDDEN.some((h) => pathname.startsWith(h))) return null;
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 bg-ink pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid h-[var(--tabbar-h)] max-w-md grid-cols-5">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = pathname ? match(pathname) : false;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors",
                  active ? "text-primary-foreground" : "text-echo hover:text-primary-foreground"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-0 h-[3px] w-8 bg-primary-foreground transition-transform duration-300 ease-out-expo",
                    active ? "scale-x-100" : "scale-x-0"
                  )}
                />
                <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} fill={active && label === "Favorites" ? "currentColor" : "none"} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TabBar() {
  return <Bar pathname={usePathname()} />;
}

/** Static fallback while the pathname resolves (dynamic routes under Suspense). */
export function TabBarFallback() {
  return <Bar pathname={null} />;
}
