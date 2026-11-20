import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { articlePath, getActivePillars, getArticles, getPillar } from "@/lib/data/articles";
import { getCategory } from "@/lib/data/catalog";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { GuideGrid } from "@/components/learn/guide-card";
import { ListingSkeleton } from "@/components/skeletons";
import { JsonLd } from "@/components/json-ld";
import { absolute, breadcrumbLd } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getActivePillars()).map((p) => ({ pillar: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[pillar]">): Promise<Metadata> {
  const { pillar } = await params;
  const p = getPillar(pillar);
  if (!p) return {};
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: { canonical: `/learn/${p.id}` },
    openGraph: { url: `/learn/${p.id}`, title: p.metaTitle, description: p.metaDescription },
  };
}

/** URL params resolve inside Suspense so navigations show the skeleton instantly. */
export default function PillarPage({ params }: PageProps<"/learn/[pillar]">) {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      {params.then(({ pillar }) => (
        <PillarContent id={pillar} />
      ))}
    </Suspense>
  );
}

async function PillarContent({ id }: { id: string }) {
  const p = getPillar(id);
  if (!p) notFound();
  const articles = await getArticles(p.id);
  if (!articles.length) notFound();
  const cat = p.category ? await getCategory(p.category) : undefined;

  return (
    <>
      <PageBar title={p.name} back="/learn" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <nav aria-label="Breadcrumb" className="hidden pt-10 text-xs font-semibold text-ink-2 md:block">
          <Link href="/learn" className="hover:underline">Guides</Link> <span aria-hidden="true">/</span> {p.name}
        </nav>
        <PageTitle title={p.name} meta={<span className="block max-w-xl">{p.intro}</span>} className="md:pt-4" />
        <GuideGrid articles={articles} showPillar={false} />
        {cat && (
          <Link
            href={`/shop/${cat.id}`}
            className="group mt-12 flex items-center justify-between gap-4 rounded-lg bg-ink px-5 py-5 text-primary-foreground md:mt-16 md:px-8 md:py-7"
          >
            <span>
              <span className="label-caps text-echo">Shop</span>
              <span className="mt-2 block text-[1.375rem] leading-none font-black tracking-[-0.02em] md:text-[2rem]">{cat.name}</span>
            </span>
            <ArrowRight className="size-6 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/learn" },
            { name: p.name, path: `/learn/${p.id}` },
          ]),
          {
            "@type": "CollectionPage",
            name: p.name,
            description: p.metaDescription,
            url: absolute(`/learn/${p.id}`),
            hasPart: articles.map((a) => ({ "@type": "Article", headline: a.title, url: absolute(articlePath(a)) })),
          },
        ]}
      />
    </>
  );
}
