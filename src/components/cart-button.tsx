"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, cartCount } from "@/lib/store";

export function CartButton({ className }: { className?: string }) {
  const count = useStore((s) => (s.hydrated ? cartCount(s.cart) : 0));
  return (
    <Link
      href="/cart"
      data-cart-target
      aria-label={count ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/8",
        className
      )}
    >
      <ShoppingBag className="size-[1.375rem]" strokeWidth={1.75} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-[3px] bg-ink px-1 text-[0.625rem] font-bold text-primary-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
