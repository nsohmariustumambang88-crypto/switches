import Image from "next/image";
import { cn } from "@/lib/utils";
import { img } from "@/config/site";
import type { Order, OrderItem, OrderStatus, Product } from "@/lib/catalog";
import { linePrice, lookupProduct } from "@/lib/store";

type Find = (slug: string) => Product | undefined;

/** Item name/image/price: the order's own snapshot first, then the product catalog. */
export function itemView(i: OrderItem, find: Find = lookupProduct) {
  const p = find(i.slug);
  return {
    name: i.name ?? p?.name ?? i.slug,
    image: i.image ?? p?.image,
    unit: i.unitPrice ?? linePrice(i, find),
    ffl: i.ffl ?? !!p?.ffl,
    product: p,
  };
}

/** Product shot on a grey panel, from an image path/id (works for order snapshots). */
export function Thumb({ image, alt, size, className }: { image?: string; alt: string; size: number; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-lg bg-panel", className)}>
      {image && (
        <Image src={img(image)} alt={alt} fill sizes={`${size}px`} className="multiply object-contain p-[8%]" />
      )}
    </span>
  );
}

export function orderTotal(o: Order, find: Find = lookupProduct) {
  return o.total ?? o.items.reduce((n, i) => n + itemView(i, find).unit * i.qty, 0);
}

export function orderHasFirearm(o: Order, find: Find = lookupProduct) {
  return o.items.some((i) => itemView(i, find).ffl);
}

export function statusLabel(s: OrderStatus, ffl: boolean) {
  switch (s) {
    case "placed":
      return "Order placed";
    case "shipped":
      return "On the way";
    case "at-ffl":
      return ffl ? "At your FFL" : "Out for delivery";
    case "complete":
      return ffl ? "Picked up" : "Delivered";
    case "cancelled":
      return "Cancelled";
  }
}

export function StatusChip({ status, ffl }: { status: OrderStatus; ffl: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-lg border px-2.5 text-xs font-bold",
        status === "complete"
          ? "border-ink bg-ink text-primary-foreground"
          : status === "cancelled"
            ? "border-ink/40 bg-transparent text-ink-2 line-through"
            : "border-ink bg-transparent text-ink"
      )}
    >
      {statusLabel(status, ffl)}
    </span>
  );
}
