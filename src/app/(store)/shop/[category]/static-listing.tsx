import type { Category, Product } from "@/lib/catalog";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { ProductGrid } from "@/components/product-lists";

/**
 * Server-rendered stand-in for the interactive listing. The listing reads
 * ?q= / ?type= in the browser, so its Suspense boundary renders on the client;
 * using this as the fallback puts the full product grid (names, prices, links)
 * in the static HTML for crawlers and first paint, instead of a skeleton.
 */
export function StaticListing({ title, products, category }: { title: string; products: Product[]; category?: Category }) {
  return (
    <>
      <PageBar title="" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle
          title={title}
          meta={
            <>
              {products.length} {products.length === 1 ? "product" : "products"}
              {category && <> · {category.blurb}</>}
            </>
          }
        />
        <ProductGrid products={products} />
      </div>
    </>
  );
}
