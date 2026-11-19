"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { money, formatDayTime } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/catalog";
import { adminRequest, useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Field, Loading, Notice, Section, Shot, TextInput } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { StatusChip, orderHasFirearm, statusLabel } from "@/app/(store)/orders/order-shared";

const FLOW: OrderStatus[] = ["placed", "shipped", "at-ffl", "complete"];

/** Button wording for advancing to each status. */
const ACTION: Record<OrderStatus, (ffl: boolean) => string> = {
  placed: () => "Mark placed",
  shipped: () => "Mark shipped",
  "at-ffl": (ffl) => (ffl ? "Mark arrived at FFL" : "Mark out for delivery"),
  complete: (ffl) => (ffl ? "Mark picked up" : "Mark delivered"),
  cancelled: () => "Cancel order",
};

/** /admin/orders/:id — GET + PATCH /api/admin/orders/:id */
export function OrderDetail({ id }: { id: string }) {
  const { data, error, loading, reload } = useAdmin<{ demo: boolean; order: Order }>(`/api/admin/orders/${encodeURIComponent(id)}`);
  const [carrier, setCarrier] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (loading || !data) return <Loading />;
  const o = data.order;
  const ffl = orderHasFirearm(o);
  const idx = FLOW.indexOf(o.status);
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

  const save = async (patch: Record<string, unknown>, message: string) => {
    setBusy(true);
    try {
      await adminRequest(`/api/admin/orders/${encodeURIComponent(o.id)}`, "PATCH", patch);
      toast.success(message);
      setCarrier(null);
      setTracking(null);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> Orders
      </Link>
      <AdminTitle
        title={`#${o.id}`}
        meta={
          <span className="flex flex-wrap items-center gap-3">
            <StatusChip status={o.status} ffl={ffl} />
            {formatDayTime(o.date)} · {o.email} · {o.payment === "ach" ? "ACH" : "Card"}
          </span>
        }
        actions={
          <>
            {next && (
              <Button size="lg" disabled={busy || data.demo} onClick={() => save({ status: next }, `Order updated: ${statusLabel(next, ffl)}`)}>
                <Check />
                {ACTION[next](ffl)}
              </Button>
            )}
            {o.status !== "cancelled" && o.status !== "complete" && (
              <Button size="lg" variant="outline" disabled={busy || data.demo} onClick={() => save({ status: "cancelled" }, "Order cancelled")}>
                Cancel order
              </Button>
            )}
          </>
        }
      />
      {data.demo && <div className="mb-6"><Notice>Sample order — status changes need Supabase connected.</Notice></div>}

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          <Section title="Items">
            <ul className="divide-y divide-ink/12 border-b border-ink/12">
              {o.items.map((i) => (
                <li key={i.slug + (i.rounds ?? "")} className="flex items-center gap-4 py-3">
                  <Shot image={i.image} alt={i.name ?? i.slug} size={64} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{i.name ?? i.slug}</span>
                    <span className="text-xs text-ink-2">
                      Qty {i.qty}
                      {i.rounds ? ` · ${i.rounds} rds` : ""}
                      {i.ffl ? " · FFL transfer" : ""}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums">{money((i.unitPrice ?? 0) * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-ink-2">Subtotal</dt><dd className="tabular-nums">{money(o.subtotal ?? 0)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-2">Shipping</dt><dd className="tabular-nums">{o.shipping ? money(o.shipping) : "Free"}</dd></div>
              <div className="flex justify-between border-t border-ink pt-2 text-base font-extrabold"><dt>Total</dt><dd className="tabular-nums">{money(o.total ?? 0)}</dd></div>
            </dl>
          </Section>

          <Section title="Fulfilment">
            <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end">
              <Field label="Carrier" htmlFor="carrier">
                <TextInput id="carrier" value={carrier ?? (o.carrier === "Pending" ? "" : o.carrier)} onChange={(e) => setCarrier(e.target.value)} placeholder="UPS, FedEx…" />
              </Field>
              <Field label="Tracking number" htmlFor="tracking">
                <TextInput id="tracking" value={tracking ?? (o.tracking === "—" ? "" : o.tracking)} onChange={(e) => setTracking(e.target.value)} />
              </Field>
              <Button
                size="lg"
                variant="outline"
                disabled={busy || data.demo || (carrier === null && tracking === null)}
                onClick={() => save({ carrier: carrier ?? o.carrier, tracking: tracking ?? o.tracking }, "Tracking saved")}
              >
                Save
              </Button>
            </div>
          </Section>
        </div>

        <div className="space-y-10 lg:col-span-5">
          <Section title="Timeline">
            <ol className="space-y-4">
              {o.events.map((e) => (
                <li key={e.status} className="flex items-start gap-3">
                  <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg", e.at ? "bg-ink text-primary-foreground" : "border-2 border-ink/25")}>
                    {e.at && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="text-sm">
                    <span className={cn("block font-bold", !e.at && "text-ink-2")}>{statusLabel(e.status, ffl)}</span>
                    <span className="text-ink-2">{e.at ? formatDayTime(e.at) : "Pending"}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Section>

          {o.ffl && (
            <Section title="FFL dealer">
              <p className="text-sm leading-relaxed"><strong className="block">{o.ffl.name}</strong>{o.ffl.address}</p>
            </Section>
          )}

          {o.billing && (
            <Section title="Billing">
              <p className="text-sm leading-relaxed">
                <strong className="block">{o.billing.name}</strong>
                {o.billing.line1}, {o.billing.city}, {o.billing.state} {o.billing.zip}
              </p>
            </Section>
          )}
        </div>
      </div>
    </>
  );
}
