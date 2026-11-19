"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { flyToCart } from "@/lib/fly-to-cart";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/catalog";

export function AddToCart({
  product,
  rounds,
  price,
  className,
  size = "xl",
  label = "Add to cart",
  showPrice = false,
}: {
  product: Product;
  rounds?: number;
  price?: number;
  className?: string;
  size?: "lg" | "xl" | "default";
  label?: string;
  showPrice?: boolean;
}) {
  const add = useStore((s) => s.add);
  const router = useRouter();
  const outOfStock = product.stock !== undefined && product.stock <= 0;
  return (
    <Button
      size={size}
      className={cn("w-full", className)}
      disabled={outOfStock}
      onClick={() => {
        add(product, rounds);
        flyToCart(product.slug);
        toast.success("Added to cart", {
          description: rounds ? `${product.name} — ${rounds} ${product.type === "shotgun" ? "shells" : "rounds"}` : product.name,
          action: { label: "View cart", onClick: () => router.push("/cart") },
        });
      }}
    >
      <ShoppingBag className="size-5" strokeWidth={2} />
      {outOfStock ? "Out of stock" : label}
      {showPrice && price !== undefined && !outOfStock && (
        <span className="ml-1 border-l border-primary-foreground/30 pl-3 tabular-nums">{money(price)}</span>
      )}
    </Button>
  );
}
