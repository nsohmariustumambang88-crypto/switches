import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/clients";
import * as builtin from "@/lib/catalog";
import type { Category, CategoryId, Product } from "@/lib/catalog";

/** Cache tag for every catalog read; admin writes call revalidateTag(CATALOG_TAG, …). */
export const CATALOG_TAG = "catalog";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category_id: CategoryId;
  type: string;
  caliber: string | null;
  price: number | string;
  compare_at: number | string | null;
  rating: number | string;
  reviews: number;
  image: string;
  photo: "light" | "scene" | null;
  figure_label: string;
  figure_value: string;
  strip: string[];
  description: string;
  summary?: string | null;
  meta_title?: string | null;
  image_alt?: string | null;
  mpn?: string | null;
  gtin?: string | null;
  specs: [string, string][];
  ffl: boolean;
  notice: string | null;
  trending: boolean;
  active: boolean;
  stock: number;
  sort: number;
  updated_at?: string | null;
  product_packs?: { rounds: number; price: number | string }[];
};

const num = (v: number | string | null | undefined) => (v === null || v === undefined ? undefined : Number(v));

export function rowToProduct(r: ProductRow): Product {
  const packs = (r.product_packs ?? [])
    .map((k) => ({ rounds: k.rounds, price: Number(k.price) }))
    .sort((a, b) => a.rounds - b.rounds);
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    category: r.category_id,
    type: r.type,
    caliber: r.caliber ?? undefined,
    price: packs[0]?.price ?? Number(r.price),
    compareAt: num(r.compare_at),
    rating: Number(r.rating),
    reviews: r.reviews,
    image: r.image,
    photo: r.photo ?? undefined,
    figure: { label: r.figure_label, value: r.figure_value },
    strip: r.strip ?? [],
    description: r.description,
    summary: r.summary || undefined,
    metaTitle: r.meta_title || undefined,
    imageAlt: r.image_alt || undefined,
    mpn: r.mpn || undefined,
    gtin: r.gtin || undefined,
    specs: r.specs ?? [],
    packs: packs.length ? packs : undefined,
    ffl: r.ffl,
    notice: r.notice ?? undefined,
    trending: r.trending,
    active: r.active,
    stock: r.stock,
    updatedAt: r.updated_at ?? undefined,
  };
}

export const PRODUCT_SELECT = "*, product_packs(rounds, price)";

type Catalog = { categories: Category[]; products: Product[]; source: "supabase" | "builtin" };

/** Whole public catalog, cached and tagged. Falls back to the built-in catalog. */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("max"); // invalidated on admin writes via revalidateTag

  if (!hasSupabase) {
    return { categories: builtin.categories, products: builtin.products, source: "builtin" };
  }
  try {
    const db = publicClient();
    const [cats, types, prods] = await Promise.all([
      db.from("categories").select("*").order("sort"),
      db.from("category_types").select("*").order("sort"),
      db.from("products").select(PRODUCT_SELECT).eq("active", true).order("sort").order("created_at"),
    ]);
    if (cats.error || types.error || prods.error) throw cats.error ?? types.error ?? prods.error;
    const categories: Category[] = (cats.data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      short: c.short,
      blurb: c.blurb,
      metaTitle: c.meta_title || undefined,
      metaDescription: c.meta_description || undefined,
      intro: c.intro || undefined,
      types: (types.data ?? [])
        .filter((t) => t.category_id === c.id)
        .map((t) => ({ id: t.id, name: t.name })),
    }));
    const products = (prods.data as ProductRow[]).map(rowToProduct);
    if (!categories.length) throw new Error("catalog tables are empty — run npm run db:seed");
    return { categories, products, source: "supabase" };
  } catch (e) {
    console.error("[catalog] Supabase read failed; serving the built-in catalog.", e);
    return { categories: builtin.categories, products: builtin.products, source: "builtin" };
  }
}

export async function getCategories() {
  return (await getCatalog()).categories;
}

export async function getCategory(id: string) {
  return (await getCatalog()).categories.find((c) => c.id === id);
}

export async function getProducts(category: CategoryId | "all" = "all") {
  const { products } = await getCatalog();
  return category === "all" ? products : products.filter((p) => p.category === category);
}

export async function getProduct(slug: string) {
  return (await getCatalog()).products.find((p) => p.slug === slug);
}

export async function getTrending(n = 8) {
  return (await getCatalog()).products.filter((p) => p.trending).slice(0, n);
}

export async function getRelated(p: Product, n = 4) {
  const { products } = await getCatalog();
  return products
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .sort((a, b) =>
      a.type === p.type && b.type !== p.type ? -1 : b.type === p.type && a.type !== p.type ? 1 : 0
    )
    .slice(0, n);
}

export type ProductQuery = {
  category?: CategoryId | "all";
  type?: string;
  q?: string;
  brand?: string[];
  caliber?: string[];
  min?: number;
  max?: number;
  sort?: "featured" | "price-asc" | "price-desc" | "rating";
  slugs?: string[];
};

/** Filtered list used by GET /api/products. */
export async function queryProducts(q: ProductQuery) {
  let list = await getProducts(q.category ?? "all");
  if (q.slugs?.length) list = list.filter((p) => q.slugs!.includes(p.slug));
  if (q.type && q.type !== "all") {
    list = list.filter((p) => (q.category === "all" || !q.category ? p.category === q.type || p.type === q.type : p.type === q.type));
  }
  if (q.brand?.length) list = list.filter((p) => q.brand!.includes(p.brand));
  if (q.caliber?.length) list = list.filter((p) => p.caliber && q.caliber!.includes(p.caliber));
  if (q.min !== undefined) list = list.filter((p) => p.price >= q.min!);
  if (q.max !== undefined) list = list.filter((p) => p.price < q.max!);
  if (q.q) {
    const words = q.q.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const hay = `${p.name} ${p.brand} ${p.caliber ?? ""} ${p.strip.join(" ")} ${p.category}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }
  const sorted = [...list];
  if (q.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (q.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (q.sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
  return sorted;
}
