import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductSkeleton } from "@/components/skeletons";
import { RecentlyViewed, RecordView } from "@/components/recently-viewed";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { getCategory, getProduct, getProducts, getRelated } from "@/lib/data/catalog";
import { PageBar } from "@/components/page-bar";
import { Lockup, SpecStrip } from "@/components/brand";
import { Rating, WishButton } from "@/components/product-bits";
import { ProductImage } from "@/components/product-card";
import { ProductRail, SectionHead } from "@/components/product-lists";
import { ShareButton } from "./share-button";
import { ProductBuy } from "./product-buy";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { RelatedGuides } from "@/components/learn/learn-teaser";
import { getGuidesForProduct } from "@/lib/data/articles";
import { getSettings } from "@/lib/data/settings";
import { money } from "@/lib/format";
import { breadcrumbLd, imageUrl, productAlt, productDescription, productLd, productTitle } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  const path = `/product/${p.slug}`;
  const description = productDescription(p);
  return {
    title: productTitle(p),
    description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: p.name,
      description,
      images: [{ url: imageUrl(p.image, { og: true }), width: 1200, height: 630, alt: productAlt(p) }],
    },
    twitter: { card: "summary_large_image", title: p.name, description },
  };
}

/** URL params resolve inside Suspense so navigations show the skeleton instantly. */
export default function ProductPage({ params }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      {params.then(({ slug }) => (
        <ProductContent slug={slug} />
      ))}
    </Suspense>
  );
}

async function ProductContent({ slug }: { slug: string }) {
  const p = await getProduct(slug);
  if (!p) notFound();
  const cat = (await getCategory(p.category))!;
  const [related, guides, settings] = await Promise.all([getRelated(p), getGuidesForProduct(p, 3), getSettings()]);
  const ship = settings.shipping;
  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
  const Notice = p.ffl ? ShieldCheck : TriangleAlert;
  const len = p.figure.value.length;
  const figSize =
    len <= 2
      ? "text-[6.5rem] md:text-[8.5rem]"
      : len === 3
        ? "text-[5rem] md:text-[7rem]"
        : len <= 5
          ? "text-[3.5rem] md:text-[5rem]"
          : "text-[2.75rem] md:text-[3.75rem]";

  return (
    <>
      <PageBar
        title=""
        back={`/shop/${p.category}`}
        actions={
          <>
            <WishButton product={p} size="lg" className="bg-transparent hover:bg-ink/8" />
            <ShareButton name={p.name} />
          </>
        }
      />

      <div className="mx-auto grid max-w-[90rem] gap-x-12 md:grid-cols-12 md:px-6 md:pt-10 lg:px-10">
        {/* Poster block: product field, then the figure and lockup beneath it (the reference's "SERIES 13"). */}
        <div className="md:col-span-7">
          <div className="md:sticky md:top-24">
            <div
              className={`relative aspect-square overflow-hidden md:aspect-[5/4] md:rounded-lg ${
                p.category === "ammunition" ? "bg-panel" : "bg-panel-deep"
              }`}
            >
              <ProductImage product={p} priority sizes="(min-width: 768px) 55vw, 100vw" pad="p-[5%]" />
              {off > 0 && (
                <span className="absolute top-4 left-4 bg-ink px-2 py-1.5 label-caps text-primary-foreground">
                  −{off}%
                </span>
              )}
            </div>
            <div className="mt-3 flex items-end justify-between gap-4 px-4 md:mt-4 md:px-0">
              <span className="flex items-end gap-2">
                <span className="rotate-180 pb-1 label-caps text-[0.6875rem] text-ink-2 [writing-mode:vertical-rl]">
                  {p.figure.label}
                </span>
                <span className={`font-display leading-[0.78] whitespace-nowrap text-figure uppercase ${figSize}`}>
                  {p.figure.value}
                </span>
              </span>
              <Lockup
                lines={[p.brand, cat.short]}
                className={`min-w-0 ${p.brand.length > 9 ? "text-[1.25rem] md:text-[2rem]" : "text-[1.75rem] md:text-[3rem]"}`}
              />
            </div>
          </div>
        </div>

        <div className="px-4 pt-6 md:col-span-5 md:px-0 md:pt-0">
          <nav aria-label="Breadcrumb" className="mb-3 text-xs font-semibold text-ink-2">
            <Link href={`/shop/${cat.id}`} className="hover:underline">{cat.name}</Link>
            {p.category === "handguns" || p.category === "ammunition" ? (
              <>
                {" "}<span aria-hidden="true">/</span>{" "}
                <Link href={`/shop/${cat.id}?type=${p.type}`} className="hover:underline">
                  {cat.types.find((t) => t.id === p.type)?.name ?? p.type}
                </Link>
              </>
            ) : null}
          </nav>
          <h1 className="font-display text-[2.375rem] leading-[0.92] md:text-[3.25rem]">{p.name}</h1>
          <Rating value={p.rating} count={p.reviews} className="mt-4 text-sm" />

          <ProductBuy product={p} />

          <div className="mt-6 max-w-prose space-y-3 text-[0.9375rem] leading-relaxed text-ink-2">
            {p.description.split(/\n\s*\n/).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </div>
          <SpecStrip items={p.strip} className="mt-4" />

          {p.notice && (
            <div className="mt-6 flex gap-3 rounded-lg bg-surface p-4">
              <Notice className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
              <p className="text-sm leading-relaxed">{p.notice}</p>
            </div>
          )}

          <Accordion defaultValue={["specs"]} className="mt-6 border-t border-ink/15">
            <AccordionItem value="specs" className="border-ink/15">
              <AccordionTrigger className="py-4 text-[0.9375rem] font-bold hover:no-underline">
                Specifications
              </AccordionTrigger>
              <AccordionContent>
                <dl className="divide-y divide-ink/10">
                  {p.specs.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-2.5 text-sm">
                      <dt className="text-ink-2">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping" className="border-ink/15">
              <AccordionTrigger className="py-4 text-[0.9375rem] font-bold hover:no-underline">
                {p.ffl ? "Shipping & FFL transfer" : "Shipping"}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-ink-2">
                <div className="space-y-2">
                  {p.ffl ? (
                    <p>
                      Choose a licensed FFL dealer at checkout. We ship to them; you collect the firearm
                      after completing ATF Form 4473 and the background check. Dealers may charge a
                      transfer fee.
                    </p>
                  ) : (
                    <p>
                      Ships to your address in a plain box with no store branding
                      {p.category === "ammunition" ? ", with an adult signature on delivery" : ""}. Some
                      states restrict what can ship to them.
                    </p>
                  )}
                  <p>
                    <strong className="text-ink">Standard — discreet:</strong> arrives within {ship.standardDays} days, free over{" "}
                    {money(ship.freeOver)} ({money(ship.flat)} below).{" "}
                    <strong className="text-ink">Fast-track:</strong> arrives within {ship.expressDays} days, {money(ship.express)}.
                  </p>
                  <p>
                    United States only.{" "}
                    <Link href="/shipping" className="font-semibold text-ink underline underline-offset-2">
                      Shipping &amp; delivery
                    </Link>
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns" className="border-ink/15">
              <AccordionTrigger className="py-4 text-[0.9375rem] font-bold hover:no-underline">
                Returns
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-ink-2">
                <p>Return policy to be confirmed by the store. {/* PLACEHOLDER */}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <section aria-label="Related products" className="mx-auto mt-16 max-w-[90rem] px-4 md:mt-28 md:px-6 lg:px-10">
        <SectionHead title="You may also like" href={`/shop/${p.category}`} className="mb-4 md:mb-8" />
        <ProductRail products={related} />
      </section>

      <RelatedGuides articles={guides} className="mt-16 md:mt-24" />

      <RecentlyViewed exclude={p.slug} title="Recently viewed" />
      <RecordView product={p} />
      <JsonLd
        data={[
          productLd(p, cat, ship),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: cat.name, path: `/shop/${cat.id}` },
            { name: p.name, path: `/product/${p.slug}` },
          ]),
        ]}
      />
    </>
  );
}
