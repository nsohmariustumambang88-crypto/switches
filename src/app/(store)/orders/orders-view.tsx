"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { demoOrders, type Order } from "@/lib/catalog";
import { formatDay, money } from "@/lib/format";
import { useProductLookup, useStore } from "@/lib/store";
import { PageBar } from "@/components/page-bar";
import { CartButton } from "@/components/cart-button";
import { PageTitle } from "@/components/page-title";
import { Reveal } from "@/components/reveal";
import { StatusChip, Thumb, itemView, orderHasFirearm, orderTotal } from "./order-shared";

export function OrdersView() {
  const hydrated = useStore((s) => s.hydrated);
  const local = useStore((s) => s.orders);
  const viewer = useStore((s) => s.viewer);
  const backend = useStore((s) => s.backend);
  const find = useProductLookup();
  const [remote, setRemote] = useState<Order[]>([]);

  // Signed in: GET /api/orders (account orders across devices).
  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    fetch("/api/orders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d: { orders: Order[] }) => !cancelled && setRemote(d.orders))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [viewer]);

  const seen = new Set<string>();
  const orders = [...remote, ...(hydrated ? local : []), ...(backend ? [] : demoOrders)].filter((o) =>
    seen.has(o.id) ? false : (seen.add(o.id), true)
  );

  return (
    <>
      <PageBar title="" back={false} actions={<CartButton />} />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle
          title="Orders"
          meta={
            viewer
              ? `${orders.length} orders on ${viewer.email}`
              : `${orders.length} orders on this device${backend ? " · sign in to see orders from other devices" : " · sample orders are marked"}`
          }
        />
        <Reveal as="ul" className="grid gap-3 md:grid-cols-2 md:gap-5">
          {orders.map((o) => {
            const first = itemView(o.items[0], find);
            const ffl = orderHasFirearm(o, find);
            const sample = demoOrders.includes(o);
            return (
              <li key={o.id} data-reveal>
                <Link href={`/orders/${o.id}`} className="group flex gap-4 rounded-lg bg-surface p-3 transition-colors hover:bg-surface-2 md:p-4">
                  <Thumb image={first.image} alt={first.name} size={96} className="size-20 md:size-24" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-extrabold">#{o.id}</span>
                      <StatusChip status={o.status} ffl={ffl} />
                    </span>
                    <span className="mt-1 text-xs text-ink-2">
                      {formatDay(o.date)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                      {sample && " · sample"}
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-bold tabular-nums">{money(orderTotal(o, find))}</span>
                      <span className="inline-flex items-center text-sm font-bold">
                        Track
                        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </Reveal>
      </div>
    </>
  );
}
