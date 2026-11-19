"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { money, formatDay } from "@/lib/format";
import type { Order } from "@/lib/catalog";
import type { Stats } from "@/lib/data/admin";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Figure, Loading, Notice } from "@/components/admin/admin-ui";
import { StatusChip, orderHasFirearm } from "@/app/(store)/orders/order-shared";

const PIPELINE: { status: keyof Stats["byStatus"]; label: string }[] = [
  { status: "placed", label: "To ship" },
  { status: "shipped", label: "In transit" },
  { status: "at-ffl", label: "At FFL / out for delivery" },
  { status: "complete", label: "Complete" },
  { status: "cancelled", label: "Cancelled" },
];

/** /admin — GET /api/admin/stats */
export default function Dashboard() {
  const { data, error, loading } = useAdmin<{ demo: boolean; stats: Stats; recent: Order[] }>("/api/admin/stats");

  return (
    <>
      <AdminTitle title="Dashboard" meta={data?.demo ? "Sample data — connect Supabase for live numbers." : "Last 30 days unless noted."} />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading rows={4} />}
      {data && (
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            <Figure label="Orders today" value={String(data.stats.ordersToday)} />
            <Figure label="Revenue · 30 days" value={money(data.stats.revenue30d).replace(".00", "")} />
            <Figure label="To ship" value={String(data.stats.byStatus.placed)} sub="Placed, not yet shipped" />
            <Figure label="Live products" value={String(data.stats.products)} sub={`${data.stats.customers} customer accounts`} />
          </div>

          <section aria-labelledby="pipe-h">
            <h2 id="pipe-h" className="mb-3 label-caps text-ink">Order pipeline · 30 days</h2>
            <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {PIPELINE.map((p) => (
                <li key={p.status}>
                  <Link
                    href={`/admin/orders?status=${p.status}`}
                    className="group flex h-full flex-col justify-between gap-3 rounded-lg bg-surface p-4 transition-colors hover:bg-ink hover:text-primary-foreground"
                  >
                    <span className="text-xs font-semibold text-ink-2 group-hover:text-echo">{p.label}</span>
                    <span className="font-display text-4xl tabular-nums">{data.stats.byStatus[p.status]}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-10 lg:grid-cols-12">
            <section aria-labelledby="recent-h" className="lg:col-span-8">
              <div className="mb-3 flex items-end justify-between">
                <h2 id="recent-h" className="label-caps text-ink">Recent orders</h2>
                <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-bold hover:underline">
                  All orders <ArrowRight className="size-4" />
                </Link>
              </div>
              {data.recent.length ? (
                <ul className="divide-y divide-ink/12 border-y border-ink/12">
                  {data.recent.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/orders/${o.id}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-3 hover:bg-ink/4 sm:grid-cols-[7rem_1fr_auto_auto]">
                        <span className="font-extrabold">#{o.id}</span>
                        <span className="col-span-2 row-start-2 truncate text-sm text-ink-2 sm:col-span-1 sm:row-start-auto">
                          {o.email} · {formatDay(o.date)}
                        </span>
                        <span className="text-right font-bold tabular-nums">{money(o.total ?? 0)}</span>
                        <span className="hidden sm:block">
                          <StatusChip status={o.status} ffl={orderHasFirearm(o)} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-surface p-6 text-sm text-ink-2">No orders yet.</p>
              )}
            </section>

            <section aria-labelledby="low-h" className="lg:col-span-4">
              <h2 id="low-h" className="mb-3 label-caps text-ink">Low stock (under 5)</h2>
              {data.stats.lowStock.length ? (
                <ul className="divide-y divide-ink/12 border-y border-ink/12">
                  {data.stats.lowStock.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/admin/products/${p.id ?? p.slug}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:underline">
                        <span className="truncate font-semibold">{p.name}</span>
                        <span className="shrink-0 font-display text-2xl text-figure tabular-nums">{p.stock}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-surface p-6 text-sm text-ink-2">Everything is stocked.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
