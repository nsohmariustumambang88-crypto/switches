"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Copy } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

/** /admin/products/:id — GET /api/admin/products/:id */
export function EditProduct({ id }: { id: string }) {
  const { data, error, loading } = useAdmin<{ demo: boolean; product: Product }>(`/api/admin/products/${encodeURIComponent(id)}`);
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> Products
      </Link>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading />}
      {data && (
        <>
          <AdminTitle
            title={data.product.name}
            actions={
              <>
                {!data.demo && (
                  <Link href={`/admin/products/new?from=${encodeURIComponent(data.product.id ?? "")}`} className="inline-flex items-center gap-1 text-sm font-bold hover:underline">
                    <Copy className="size-4" /> Duplicate
                  </Link>
                )}
                <Link href={`/product/${data.product.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold hover:underline">
                  View on store <ArrowUpRight className="size-4" />
                </Link>
              </>
            }
          />
          <ProductForm key={data.product.id} product={data.product} demo={data.demo} />
        </>
      )}
    </>
  );
}
