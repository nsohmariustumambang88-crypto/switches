"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

/**
 * /admin/products/new — POST /api/admin/products.
 * With ?from=<id>, the form is pre-filled from that product (GET /api/admin/products/:id)
 * as a hidden draft with a "-copy" slug — the fast way to add a variant.
 */
export function NewProduct() {
  const from = useSearchParams().get("from");
  const demo = useStore((s) => s.viewerChecked && !s.backend);
  const source = useAdmin<{ product: Product }>(from ? `/api/admin/products/${encodeURIComponent(from)}` : null);

  const base = source.data?.product;
  const draft: Product | undefined = base && {
    ...base,
    id: undefined,
    slug: `${base.slug}-copy`,
    name: `${base.name} (copy)`,
    active: false,
    trending: false,
    stock: 0,
    reviews: 0,
    rating: 0,
  };

  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <AdminTitle title={from ? "Duplicate product" : "New product"} meta={from && base ? `Copy of ${base.name} — saved hidden until you publish it.` : undefined} />
      {source.error && <Notice tone="error">{source.error}</Notice>}
      {from && source.loading ? <Loading rows={4} /> : <ProductForm key={draft?.slug ?? "new"} product={draft} demo={demo} />}
    </>
  );
}
