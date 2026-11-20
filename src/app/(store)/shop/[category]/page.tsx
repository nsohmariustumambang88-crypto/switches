import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getCategory, getProducts } from "@/lib/data/catalog";
import type { CategoryId } from "@/lib/catalog";
import { ListingSkeleton } from "@/components/skeletons";
import { JsonLd } from "@/components/json-ld";
import { RelatedGuides } from "@/components/learn/learn-teaser";
import { getGuidesForCategory, getPillar } from "@/lib/data/articles";
import { breadcrumbLd, itemListLd } from "@/lib/seo";
import { Listing } from "./listing";
import { StaticListing } from "./static-listing";

type Slug = CategoryId | "all";

const ALL = {
  title: "Shop All: Handguns, Ammunition, Triggers & Parts",
  description:
    "Every product in the store: Glock and SIG Sauer handguns shipped to your FFL, 9mm and rifle ammunition, Rare Breed forced reset triggers and parts.",
};

export async function generateStaticParams() {
  return [{ category: "all" }, ...(await getCategories()).map((c) => ({ category: c.id }))];
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const path = `/shop/${category}`;
  if (category === "all") {
    return { title: ALL.title, description: ALL.description, alternates: { canonical: path }, openGraph: { url: path } };
  }
  const c = await getCategory(category);
  if (!c) return { title: "Shop" };
  // ?type= and ?q= views canonicalize to the department page.
  return {
    title: c.metaTitle ?? c.name,
    description: c.metaDescription ?? c.blurb,
    alternates: { canonical: path },
    openGraph: { url: path, title: c.metaTitle ?? c.name, description: c.metaDescription ?? c.blurb },
  };
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
  const [products, categories, guides] = await Promise.all([
    getProducts(slug),
    getCategories(),
    cat ? getGuidesForCategory(cat.id, 3) : Promise.resolve([]),
  ]);
  const title = cat?.name ?? "All products";
  const pillar = cat ? ["handguns", "ammo", "triggers"].map(getPillar).find((p) => p?.category === cat.id) : undefined;

  // Listing reads ?q= / ?type= with useSearchParams, so it gets its own boundary.
  // Its fallback is the full server-rendered grid (crawlable), not a skeleton.
  return (
    <>
      <Suspense fallback={<StaticListing title={title} products={products} category={cat} />}>
        <Listing category={slug} title={title} products={products} categories={categories} />
      </Suspense>

      {cat?.intro && (
        <section aria-labelledby="about-dept" className="mx-auto mt-20 max-w-[90rem] px-4 md:mt-28 md:px-6 lg:px-10">
          <div className="grid gap-6 border-t-[3px] border-ink pt-5 md:grid-cols-12 md:gap-10">
            <h2 id="about-dept" className="text-[1.5rem] leading-none font-black tracking-[-0.03em] md:col-span-4 md:text-[2.25rem]">
              About {cat.name}
            </h2>
            <div className="space-y-4 text-[0.9375rem] leading-relaxed text-ink-2 md:col-span-7 md:col-start-6">
              <p>{cat.intro}</p>
              {pillar && (
                <p>
                  <Link href={`/learn/${pillar.id}`} className="font-bold text-ink underline underline-offset-2">
                    Read our {pillar.name.toLowerCase()} guides
                  </Link>
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      <RelatedGuides articles={guides} title="Buying guides" className="mt-16 md:mt-24" />

      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: title, path: `/shop/${category}` },
          ]),
          itemListLd(products, title),
        ]}
      />
    </>
  );
}
