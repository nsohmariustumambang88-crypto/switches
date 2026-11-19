"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { money, formatDayTime } from "@/lib/format";
import type { Order } from "@/lib/catalog";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice, Shot } from "@/components/admin/admin-ui";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StatusChip, orderHasFirearm } from "@/app/(store)/orders/order-shared";

const FILTERS = [
  { id: "", label: "All" },
  { id: "placed", label: "To ship" },
  { id: "shipped", label: "In transit" },
  { id: "at-ffl", label: "At FFL" },
  { id: "complete", label: "Complete" },
  { id: "cancelled", label: "Cancelled" },
];

/** /admin/orders — GET /api/admin/orders?status=&q= */
export function OrdersAdmin() {
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get("status") ?? "";
  const [q, setQ] = useState(params.get("q") ?? "");
  const query = new URLSearchParams({ ...(status && { status }), ...(params.get("q") && { q: params.get("q")! }) });
  const { data, error, loading } = useAdmin<{ demo: boolean; orders: Order[] }>(`/api/admin/orders?${query}`);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/admin/orders${next.size ? `?${next}` : ""}`);
  };

  return (
    <>
      <AdminTitle title="Orders" meta={data ? `${data.orders.length} shown${data.demo ? " · sample orders" : ""}` : undefined} />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ToggleGroup
          aria-label="Filter by status"
          value={[status]}
          onValueChange={(v) => setParam("status", (v as string[])[0] ?? "")}
          className="no-scrollbar -mx-4 w-auto max-w-none gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
        >
          {FILTERS.map((f) => (
            <ToggleGroupItem key={f.id || "all"} value={f.id}>
              {f.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <form
          role="search"
          className="relative md:w-72"
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", q.trim());
          }}
        >
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" />
          <label htmlFor="order-q" className="sr-only">Search orders</label>
          <input
            id="order-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order # or email"
            className="h-10 w-full rounded-lg bg-surface pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ink"
          />
        </form>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading />}
      {data && !data.orders.length && <p className="rounded-lg bg-surface p-6 text-sm text-ink-2">No orders match.</p>}
      {data && data.orders.length > 0 && (
        <ul className="divide-y divide-ink/12 border-y border-ink/12">
          {data.orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/orders/${o.id}`}
                className="group grid grid-cols-[3.5rem_1fr_auto] items-center gap-x-4 gap-y-1 py-3 transition-colors hover:bg-ink/4 md:grid-cols-[3.5rem_7rem_1fr_9rem_7rem_auto_1.25rem]"
              >
                <Shot image={o.items[0]?.image} alt="" size={56} className="row-span-2 md:row-span-1" />
                <span className="font-extrabold">#{o.id}</span>
                <span className="text-right font-bold tabular-nums md:order-last md:hidden">{money(o.total ?? 0)}</span>
                <span className="col-span-2 truncate text-sm text-ink-2 md:col-span-1">
                  {o.email} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </span>
                <span className="hidden text-sm text-ink-2 md:block">{formatDayTime(o.date)}</span>
                <span className="hidden text-right font-bold tabular-nums md:block">{money(o.total ?? 0)}</span>
                <span className="hidden md:block">
                  <StatusChip status={o.status} ffl={orderHasFirearm(o)} />
                </span>
                <ChevronRight className="hidden size-4 transition-transform group-hover:translate-x-0.5 md:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
