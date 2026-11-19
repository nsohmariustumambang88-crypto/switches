"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, RotateCcw, Store, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getOrder, type Order, type Product } from "@/lib/catalog";
import { formatDay, formatDayTime, money } from "@/lib/format";
import { lookupProduct, useProductLookup, useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { PageBar } from "@/components/page-bar";
import { EchoType } from "@/components/echo-type";
import { EmptyState } from "@/components/empty-state";
import { StatusChip, Thumb, itemView, orderHasFirearm, orderTotal, statusLabel } from "../order-shared";

export function TrackView({ id }: { id: string }) {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const viewer = useStore((s) => s.viewer);
  const mine = useStore((s) => s.orders.find((o) => o.id === id));
  const find = useProductLookup();
  const [remote, setRemote] = useState<Order | null>(null);

  // Signed in: GET /api/orders/:id for the live status (shipping, FFL arrival…).
  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { order: Order } | null) => !cancelled && d && setRemote(d.order))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [viewer, id]);

  const order = remote ?? mine ?? getOrder(id);
  const line = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

  const doneCount = order ? order.events.filter((e) => e.at).length : 0;
  const progress = order ? Math.max(0, doneCount - 1) / (order.events.length - 1) : 0;

  // The route line draws down to the latest completed event; nodes pop in behind it.
  useGSAP(
    () => {
      if (!order || !line.current || !list.current) return;
      if (prefersReducedMotion()) {
        gsap.set(line.current, { scaleY: progress });
        return;
      }
      const nodes = list.current.querySelectorAll("[data-node-done]");
      gsap
        .timeline({ delay: 0.2 })
        .fromTo(line.current, { scaleY: 0 }, { scaleY: progress, duration: 1.4, ease: "power3.inOut" })
        .from(nodes, { scale: 0.4, autoAlpha: 0, stagger: 1.4 / Math.max(1, nodes.length), duration: 0.5, ease: "back.out(2)" }, 0);
    },
    { dependencies: [order?.id, progress] }
  );

  if (!order && !hydrated) return <PageBar title="Track Order" back="/orders" />;
  if (!order) {
    return (
      <>
        <PageBar title="Track Order" back="/orders" />
        <EmptyState figure="?" title="Order not found" body={`We couldn’t find order #${id} on this device.`} href="/orders" cta="All orders" />
      </>
    );
  }

  const ffl = orderHasFirearm(order, find);
  const mineOrder = !getOrder(id);
  const cancelled = order.status === "cancelled";

  // Re-add every line to the cart. Products this browser hasn't seen are
  // fetched once via GET /api/products?slugs=… (only when needed).
  const buyAgain = async () => {
    const missing = order.items.map((i) => i.slug).filter((s) => !lookupProduct(s));
    if (missing.length) {
      try {
        const r = await fetch(`/api/products?slugs=${encodeURIComponent(missing.join(","))}`);
        const d = (await r.json()) as { products: Product[] };
        d.products.forEach((p) => useStore.getState().remember(p));
      } catch {}
    }
    let added = 0;
    for (const i of order.items) {
      const p = lookupProduct(i.slug);
      if (p && p.stock !== 0) {
        useStore.getState().add(p, i.rounds, i.qty);
        added++;
      }
    }
    if (added) {
      toast.success(`Added ${added} item${added === 1 ? "" : "s"} to your cart`);
      router.push("/cart");
    } else toast.error("These items are no longer available.");
  };

  return (
    <>
      <PageBar title="Track Order" back="/orders" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <div className="pt-2 md:pt-12">
          <EchoType text={`#${order.id}`} as="h1" className="font-display text-[clamp(3.5rem,17vw,9rem)]" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StatusChip status={order.status} ffl={ffl} />
            <Button variant="outline" size="sm" onClick={buyAgain}>
              <RotateCcw /> Buy again
            </Button>
            <span className="text-sm text-ink-2">
              {formatDay(order.date)} · {order.items.length} item{order.items.length === 1 ? "" : "s"} · {money(orderTotal(order, find))}
            </span>
          </div>
          {mineOrder && !cancelled && (
            <p className="mt-4 max-w-prose rounded-lg bg-surface p-4 text-sm leading-relaxed">
              Thanks — your order is in. We’ll email tracking details once it ships.
              {ffl && " Your FFL dealer will contact you when the firearm arrives."}
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-12">
          <section aria-label="Order progress" className="md:col-span-6">
            <ol ref={list} className="relative space-y-7">
              <div aria-hidden="true" className="absolute top-4 bottom-4 left-[0.9375rem] w-[2px] bg-ink/15">
                <div ref={line} className="h-full origin-top bg-ink" style={{ transform: `scaleY(${progress})` }} />
              </div>
              {order.events.map((e) => {
                const done = !!e.at;
                return (
                  <li key={e.status} className="relative flex items-start gap-4">
                    <span
                      {...(done ? { "data-node-done": "" } : {})}
                      className={cn(
                        "relative z-10 grid size-8 shrink-0 place-items-center rounded-lg",
                        done ? "bg-ink text-primary-foreground" : "border-2 border-ink/25 bg-ground"
                      )}
                    >
                      {done && <Check className="size-4" strokeWidth={3} />}
                    </span>
                    <span className="pt-1">
                      <span className={cn("block font-bold", !done && "text-ink-2")}>{statusLabel(e.status, ffl)}</span>
                      <span className="block text-sm text-ink-2">{e.at ? formatDayTime(e.at) : "Pending"}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="space-y-4 md:col-span-6">
            {order.ffl && (
              <div className="flex gap-3 rounded-lg bg-surface p-4">
                <Store className="mt-0.5 size-5 shrink-0" />
                <p className="text-sm leading-relaxed">
                  <span className="label-caps text-ink-2">FFL dealer</span>
                  <strong className="mt-1.5 block">{order.ffl.name}</strong>
                  {order.ffl.address}
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-lg bg-ink p-4 text-primary-foreground">
              <Truck className="size-6 shrink-0" />
              <p className="flex-1 text-sm">
                <span className="label-caps text-echo">Carrier</span>
                <strong className="mt-1 block">{order.carrier}</strong>
                <span className="text-[#b9b9b6] tabular-nums">{order.tracking}</span>
              </p>
            </div>
            <ul className="divide-y divide-ink/12 border-y border-ink/12">
              {order.items.map((i) => {
                const v = itemView(i, find);
                return (
                  <li key={i.slug + (i.rounds ?? "")}>
                    <Link href={`/product/${i.slug}`} className="flex items-center gap-3 py-3 hover:underline">
                      <Thumb image={v.image} alt={v.name} size={56} className="size-14" />
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="line-clamp-1 font-semibold">{v.name}</span>
                        <span className="text-xs text-ink-2">
                          Qty {i.qty}
                          {i.rounds ? ` · ${i.rounds} rds` : ""}
                        </span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums">{money(v.unit * i.qty)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
