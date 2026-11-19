"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { money } from "@/lib/format";
import { categories, type Product } from "@/lib/catalog";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice, Shot } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

/** /admin/products — GET /api/admin/products */
export default function ProductsAdmin() {
  const { data, error, loading } = useAdmin<{ demo: boolean; products: Product[] }>("/api/admin/products");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return (data?.products ?? []).filter(
      (p) =>
        (!cat || p.category === cat) &&
        words.every((w) => `${p.name} ${p.brand} ${p.slug} ${p.caliber ?? ""}`.toLowerCase().includes(w))
    );
  }, [data, cat, q]);

  return (
    <>
      <AdminTitle
        title="Products"
        meta={data ? `${list.length} of ${data.products.length}${data.demo ? " · built-in catalog (read-only)" : ""}` : undefined}
        actions={
          <Link href="/admin/products/new" className={cn(buttonVariants({ size: "lg" }), data?.demo && "pointer-events-none opacity-45")} aria-disabled={data?.demo}>
            <Plus /> New product
          </Link>
        }
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ToggleGroup
          aria-label="Filter by department"
          value={[cat]}
          onValueChange={(v) => setCat((v as string[])[0] ?? "")}
          className="no-scrollbar -mx-4 w-auto max-w-none gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
        >
          <ToggleGroupItem value="">All</ToggleGroupItem>
          {categories.map((c) => (
            <ToggleGroupItem key={c.id} value={c.id}>
              {c.short === "Ammo" ? "Ammunition" : c.short}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="relative md:w-72">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" />
          <label htmlFor="prod-q" className="sr-only">Search products</label>
          <input
            id="prod-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, brand, caliber…"
            className="h-10 w-full rounded-lg bg-surface pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading />}
      {data && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-2 pr-4 label-caps text-ink-2">Product</th>
                <th scope="col" className="py-2 pr-4 label-caps text-ink-2">Department</th>
                <th scope="col" className="py-2 pr-4 text-right label-caps text-ink-2">Price</th>
                <th scope="col" className="py-2 pr-4 text-right label-caps text-ink-2">Stock</th>
                <th scope="col" className="py-2 label-caps text-ink-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/12">
              {list.map((p) => (
                <tr key={p.id ?? p.slug} className="group hover:bg-ink/4">
                  <td className="py-2.5 pr-4">
                    <Link href={`/admin/products/${p.id ?? p.slug}`} className="flex items-center gap-3">
                      <Shot image={p.image} alt="" size={48} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold group-hover:underline">{p.name}</span>
                        <span className="text-xs text-ink-2">{p.brand} · {p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 text-ink-2">{categories.find((c) => c.id === p.category)?.short}</td>
                  <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                    {p.packs && <span className="mr-1 text-xs font-normal text-ink-2">from</span>}
                    {money(p.price)}
                  </td>
                  <td className={cn("py-2.5 pr-4 text-right tabular-nums", (p.stock ?? 0) < 5 && "font-extrabold")}>{p.stock ?? "—"}</td>
                  <td className="py-2.5">
                    <span className={cn("inline-flex h-6 items-center rounded-lg border px-2 text-xs font-bold", p.active === false ? "border-ink/30 text-ink-2" : "border-ink")}>
                      {p.active === false ? "Hidden" : "Live"}
                    </span>
                    {p.ffl && <span className="ml-1.5 inline-flex h-6 items-center rounded-lg bg-surface-2 px-2 text-xs font-bold">FFL</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <p className="rounded-lg bg-surface p-6 text-sm text-ink-2">No products match.</p>}
        </div>
      )}
    </>
  );
}
