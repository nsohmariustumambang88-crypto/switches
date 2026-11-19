import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategories, getCategory, getProducts } from "@/lib/data/catalog";
import type { CategoryId } from "@/lib/catalog";
import { ListingSkeleton } from "@/components/skeletons";
import { Listing } from "./listing";

type Slug = CategoryId | "all";

export async function generateStaticParams() {
  return [{ category: "all" }, ...(await getCategories()).map((c) => ({ category: c.id }))];
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  return { title: category === "all" ? "All products" : (await getCategory(category))?.name ?? "Shop" };
}

/** URL params resolve inside Suspense so navigations show the skeleton instantly. */
export default function ShopPage({ params }: PageProps<"/shop/[category]">) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      {params.then(({ category }) => (
        <ShopContent category={category} />
      ))}
    </Suspense>
  );
}

async function ShopContent({ category }: { category: string }) {
  const cat = category === "all" ? undefined : await getCategory(category);
  if (category !== "all" && !cat) notFound();
  const slug = category as Slug;
  const [products, categories] = await Promise.all([getProducts(slug), getCategories()]);
  const title = cat?.name ?? "All products";

  // Listing reads ?q= / ?type= with useSearchParams, so it gets its own boundary.
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <Listing category={slug} title={title} products={products} categories={categories} />
    </Suspense>
  );
}
