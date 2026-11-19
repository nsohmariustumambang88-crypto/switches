"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { site } from "@/config/site";
import { money } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** Price, round-count selector (the kit's size row) and the add-to-cart actions. */
export function ProductBuy({ product: p }: { product: Product }) {
  const [rounds, setRounds] = useState<number | undefined>(p.packs?.[0]?.rounds);
  const pack = p.packs?.find((k) => k.rounds === rounds);
  const price = pack?.price ?? p.price;
  const perRound = pack ? pack.price / pack.rounds : undefined;

  return (
    <>
      <div className="mt-5 flex items-baseline gap-3">
        <p className="text-[2rem] leading-none font-extrabold tabular-nums">{money(price)}</p>
        {p.compareAt && <s className="text-base text-ink-2">{money(p.compareAt)}</s>}
        {perRound !== undefined && (
          <span className="text-sm text-ink-2 tabular-nums">{money(perRound)} / round</span>
        )}
      </div>
      {site.preview && (
        <p className="mt-2 text-xs text-ink-2">Preview price — placeholder until the catalog is connected.</p>
      )}

      {p.packs && p.packs.length > 0 && (
        <div className="mt-6">
          <p id="rounds-label" className="mb-2.5 text-sm font-bold">
            {p.type === "shotgun" ? "Shells" : "Rounds"}
          </p>
          <ToggleGroup
            aria-labelledby="rounds-label"
            value={rounds ? [String(rounds)] : []}
            onValueChange={(v) => {
              const next = (v as string[])[0];
              if (next) setRounds(Number(next));
            }}
            className="flex-wrap gap-2"
          >
            {p.packs.map((k) => (
              <ToggleGroupItem key={k.rounds} value={String(k.rounds)} size="lg" className="min-w-16 tabular-nums">
                {k.rounds}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}

      <div className="mt-6 hidden md:block">
        <AddToCart product={p} rounds={rounds} price={price} showPrice />
      </div>

      {/* Phone: sticky action bar (kit screen 6). */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-ground/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <AddToCart product={p} rounds={rounds} price={price} showPrice size="xl" />
      </div>
    </>
  );
}
