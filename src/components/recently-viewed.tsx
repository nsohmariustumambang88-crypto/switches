"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ProductRail, SectionHead } from "@/components/product-lists";

/** Records a product view on this device (no server call). */
export function RecordView({ product }: { product: Product }) {
  useEffect(() => {
    useStore.getState().markViewed(product);
  }, [product]);
  return null;
}

/** "Continue browsing" rail for returning shoppers — rendered from local snapshots. */
export function RecentlyViewed({ exclude, title = "Continue browsing" }: { exclude?: string; title?: string }) {
  const hydrated = useStore((s) => s.hydrated);
  const slugs = useStore((s) => s.recentViewed);
  const known = useStore((s) => s.known);
  const items = slugs
    .filter((s) => s !== exclude)
    .map((s) => known[s])
    .filter(Boolean)
    .slice(0, 8) as Product[];

  if (!hydrated || items.length === 0) return null;
  return (
    <section aria-label={title} className="mx-auto mt-12 max-w-[90rem] px-4 md:mt-24 md:px-6 lg:px-10">
      <SectionHead title={title} className="mb-4 md:mb-8" />
      <ProductRail products={items} />
    </section>
  );
}
