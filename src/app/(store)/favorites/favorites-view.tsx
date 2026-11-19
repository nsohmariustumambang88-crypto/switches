"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/catalog";
import { useProductLookup, useStore } from "@/lib/store";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { ProductGrid } from "@/components/product-lists";
import { EmptyState } from "@/components/empty-state";
import { CartButton } from "@/components/cart-button";

export function FavoritesView() {
  const hydrated = useStore((s) => s.hydrated);
  const slugs = useStore((s) => s.wishlist);
  const find = useProductLookup();
  const items = slugs.map(find).filter(Boolean) as Product[];
  const missing = slugs.filter((s) => !find(s));

  // Favorites synced from the account may name products this browser hasn't
  // seen yet: GET /api/products?slugs=… and remember them.
  const missingKey = missing.join(",");
  useEffect(() => {
    if (!missingKey) return;
    fetch(`/api/products?slugs=${encodeURIComponent(missingKey)}`)
      .then((r) => r.json())
      .then((d: { products: Product[] }) => d.products.forEach((p) => useStore.getState().remember(p)))
      .catch(() => {});
  }, [missingKey]);

  return (
    <>
      <PageBar title="" back={false} actions={<CartButton />} />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle title="Favorites" meta={hydrated ? `${items.length} saved` : undefined} />
        {!hydrated ? (
          <div className="h-80" aria-busy="true" />
        ) : items.length ? (
          <ProductGrid products={items} className="pt-2" />
        ) : (
          <EmptyState
            figure="0"
            title="No favorites yet"
            body="Tap the heart on any product to keep it here for later."
          />
        )}
      </div>
    </>
  );
}
