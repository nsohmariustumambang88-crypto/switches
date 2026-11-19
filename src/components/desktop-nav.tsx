"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, User, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/catalog";
import { Wordmark } from "@/components/brand";
import { CartButton } from "@/components/cart-button";
import { SearchField } from "@/components/search-field";

function Links({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1">
      {categories.map((c) => {
        const href = `/shop/${c.id}`;
        const active = pathname?.startsWith(href);
        return (
          <li key={c.id}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative px-3 py-2 text-sm font-semibold transition-colors hover:text-ink",
                active ? "text-ink" : "text-ink-2"
              )}
            >
              {c.short === "Ammo" ? "Ammunition" : c.short}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-3 -bottom-[1.1rem] h-[3px] origin-left bg-ink transition-transform duration-300 ease-out-expo",
                  active ? "scale-x-100" : "scale-x-0"
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinks() {
  return <Links pathname={usePathname()} />;
}
export function NavLinksFallback() {
  return <Links pathname={null} />;
}

const iconLink =
  "inline-flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/8";

export function DesktopNav({ links }: { links: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-ink/15 bg-ground/92 backdrop-blur-md md:block">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-6 px-6 lg:px-10">
        <Wordmark className="text-[1.625rem]" />
        <nav aria-label="Departments" className="hidden lg:block">
          {links}
        </nav>
        <SearchField size="sm" className="ml-auto w-full max-w-xs" placeholder="Search the store" />
        <div className="flex items-center gap-0.5">
          <Link href="/favorites" aria-label="Favorites" className={iconLink}>
            <Heart className="size-5" strokeWidth={1.75} />
          </Link>
          <Link href="/orders" aria-label="Orders" className={iconLink}>
            <Package className="size-5" strokeWidth={1.75} />
          </Link>
          <Link href="/profile" aria-label="Profile" className={iconLink}>
            <User className="size-5" strokeWidth={1.75} />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
