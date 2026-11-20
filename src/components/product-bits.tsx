"use client";

import { Heart, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/catalog";

export function WishButton({
  product,
  className,
  size = "sm",
}: {
  product: Product;
  className?: string;
  size?: "sm" | "lg";
}) {
  const { slug, name } = product;
  const on = useStore((s) => s.hydrated && s.wishlist.includes(slug));
  const toggleWish = useStore((s) => s.toggleWish);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favorites` : `Save ${name} to favorites`}
      onClick={(e) => {
        e.preventDefault();
        const added = toggleWish(product);
        toast(added ? "Saved to favorites" : "Removed from favorites", { description: name });
        // Signed in: mirror to the account (POST/DELETE /api/wishlist).
        if (useStore.getState().viewer) {
          fetch("/api/wishlist", {
            method: added ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          }).catch(() => {});
        }
      }}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg bg-surface-2/85 text-ink backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-surface-2 active:scale-90",
        size === "sm" ? "size-8" : "size-10",
        className
      )}
    >
      <Heart
        className={cn(size === "sm" ? "size-4" : "size-5", "transition-transform duration-300", on && "scale-110")}
        strokeWidth={2}
        fill={on ? "currentColor" : "none"}
      />
    </button>
  );
}

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  if (!value || count === 0) {
    return <span className={cn("inline-flex items-center text-xs font-semibold text-ink-2", className)}>New · no reviews yet</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold tabular-nums", className)}>
      <Star className="size-3.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
      <span>
        {value.toFixed(1)}
        <span className="sr-only"> out of 5</span>
      </span>
      {count !== undefined && (
        <span className="font-normal text-ink-2">({count.toLocaleString("en-US")} reviews)</span>
      )}
    </span>
  );
}
