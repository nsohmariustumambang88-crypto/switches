"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { site } from "@/config/site";
import { money } from "@/lib/format";
import { linePrice, totals, useProductLookup, useStore } from "@/lib/store";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { ProductImage } from "@/components/product-card";
import { QtyStepper } from "@/components/qty-stepper";
import { EmptyState } from "@/components/empty-state";
import { Checkbox } from "@/components/ui/checkbox";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartView() {
  const hydrated = useStore((s) => s.hydrated);
  const cart = useStore((s) => s.cart);
  const { setQty, remove, toggle, selectAll, removeSelected } = useStore.getState();
  const find = useProductLookup();
  const { lines, subtotal, shipping, total, hasFirearm } = totals(cart, find);
  const allOn = cart.length > 0 && cart.every((l) => l.selected);

  const trash = cart.length > 0 && (
    <button
      type="button"
      aria-label="Remove selected items"
      disabled={!lines.length}
      onClick={() => {
        removeSelected();
        toast("Removed selected items");
      }}
      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-ink/8 disabled:opacity-40"
    >
      <Trash2 className="size-5" strokeWidth={1.9} />
    </button>
  );

  return (
    <>
      <PageBar title="" actions={trash} />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle title="Cart" meta={hydrated && cart.length ? `${cart.length} line${cart.length === 1 ? "" : "s"}` : undefined} />

        {!hydrated ? (
          <div className="h-80" aria-busy="true" />
        ) : cart.length === 0 ? (
          <EmptyState figure="0" title="Your cart is empty" body="Find a handgun, a box of ammo or a trigger and it will show up here." />
        ) : (
          <div className="grid gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-7 lg:col-span-8">
              <label className="mb-2 flex cursor-pointer items-center gap-3 text-sm font-semibold">
                <Checkbox checked={allOn} onCheckedChange={(c) => selectAll(!!c)} />
                Select all
              </label>
              <ul className="divide-y divide-ink/12 border-y border-ink/12">
                {cart.map((l) => {
                  const p = find(l.slug);
                  if (!p) return null;
                  return (
                    <li key={l.key} className="flex gap-3 py-4 md:gap-5">
                      <Checkbox
                        checked={l.selected}
                        onCheckedChange={() => toggle(l.key)}
                        aria-label={`Include ${p.name} in checkout`}
                        className="mt-1"
                      />
                      <Link
                        href={`/product/${p.slug}`}
                        className="relative block size-24 shrink-0 overflow-hidden rounded-lg bg-panel md:size-32"
                      >
                        <ProductImage product={p} sizes="128px" pad="p-2" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/product/${p.slug}`} className="line-clamp-2 text-[0.9375rem] leading-tight font-bold hover:underline">
                            {p.name}
                          </Link>
                          <button
                            type="button"
                            aria-label={`Remove ${p.name}`}
                            onClick={() => remove(l.key)}
                            className="-mt-1 -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-2 hover:bg-ink/8 hover:text-ink"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                        <p className="mt-1 label-caps text-ink-2">
                          {l.rounds ? `${l.rounds} ${p.type === "shotgun" ? "shells" : "rounds"}` : p.strip.slice(0, 2).join(" • ")}
                          {p.ffl && " • Ships to FFL"}
                        </p>
                        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                          <p className="text-base font-extrabold tabular-nums">{money(linePrice(l, find) * l.qty)}</p>
                          <QtyStepper value={l.qty} onChange={(n) => setQty(l.key, n)} label={p.name} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {hasFirearm && (
                <div className="mt-5 flex gap-3 rounded-lg bg-surface p-4 text-sm leading-relaxed">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                  <p>Your cart includes a firearm. You’ll choose a licensed FFL dealer at checkout; the firearm ships there for transfer.</p>
                </div>
              )}
            </div>

            <aside className="md:col-span-5 lg:col-span-4">
              <div className="md:sticky md:top-24">
                <dl className="space-y-3 text-[0.9375rem]">
                  <div className="flex justify-between">
                    <dt className="text-ink-2">Subtotal</dt>
                    <dd className="font-semibold tabular-nums">{money(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-2">Standard shipping</dt>
                    <dd className="font-semibold tabular-nums">{shipping === 0 ? (subtotal ? "Free" : money(0)) : money(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-ink pt-3 text-lg">
                    <dt className="font-extrabold">Total</dt>
                    <dd className="font-extrabold tabular-nums">{money(total)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs text-ink-2">
                  Discreet packaging on every order. Fast-track delivery, taxes and any FFL transfer fee are shown at checkout.
                  {site.preview && " Preview totals: prices and the shipping rule are placeholders."}
                </p>
                <div className="fixed inset-x-0 bottom-0 z-30 bg-ground/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:static md:mt-6 md:bg-transparent md:p-0 md:backdrop-blur-none">
                  <Link
                    href="/checkout"
                    aria-disabled={!lines.length}
                    className={cn(
                      buttonVariants({ size: "xl", className: "group w-full" }),
                      !lines.length && "pointer-events-none opacity-45"
                    )}
                  >
                    Proceed to checkout
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
