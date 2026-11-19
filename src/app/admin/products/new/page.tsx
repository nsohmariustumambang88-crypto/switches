"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { AdminTitle } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";

/** /admin/products/new — POST /api/admin/products */
export default function NewProduct() {
  const demo = useStore((s) => s.viewerChecked && !s.backend);
  return (
    <>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <AdminTitle title="New product" />
      <ProductForm demo={demo} />
    </>
  );
}
