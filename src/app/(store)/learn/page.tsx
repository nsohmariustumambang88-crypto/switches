import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActivePillars, getArticles } from "@/lib/data/articles";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { GuideGrid } from "@/components/learn/guide-card";
import { JsonLd } from "@/components/json-ld";
import { absolute, breadcrumbLd } from "@/lib/seo";
import { articlePath } from "@/lib/data/articles";

export const metadata: Metadata = {
  title: "Gun Buying Guides: Glock, SIG P365, 9mm & FRTs",
  description:
    "Practical buying guides from a licensed dealer: Glock Gen6 vs V, SIG P365 sizes, HST vs Gold Dot 9mm, forced reset triggers, FFL transfers and a glossary.",
  alternates: { canonical: "/learn" },
  openGraph: { url: "/learn" },
};

/** /learn — the guides hub: topics (pillars), each with its guides. */
export default async function LearnHub() {
  const [pillars, articles] = await Promise.all([getActivePillars(), getArticles()]);
  return (
    <>
      <PageBar title="Guides" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle
          title="Guides"
          meta={<span className="block max-w-xl">Straight answers on buying online, choosing a pistol, picking ammunition and fitting a trigger, built from the makers&apos; own specs and dated when they change.</span>}
        />

        <nav aria-label="Guide topics" className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 md:mx-0 md:mb-14 md:px-0">
          {pillars.map((p) => (
            <Link key={p.id} href={`/learn/${p.id}`} className="shrink-0 rounded-lg border border-ink/20 px-4 py-2 text-sm font-semibold hover:bg-ink/8">
              {p.name}
            </Link>
          ))}
        </nav>

        <div className="space-y-16 md:space-y-24">
          {pillars.map((p) => {
            const list = articles.filter((a) => a.pillar === p.id);
            return (
              <section key={p.id} aria-labelledby={`pillar-${p.id}`}>
                <div className="mb-5 flex items-end justify-between gap-4 border-t-[3px] border-ink pt-4 md:mb-8">
                  <div>
                    <h2 id={`pillar-${p.id}`} className="text-[1.5rem] leading-none font-black tracking-[-0.03em] md:text-[2.25rem]">
                      {p.name}
                    </h2>
                    <p className="mt-2 text-sm text-ink-2">{p.blurb}</p>
                  </div>
                  <Link href={`/learn/${p.id}`} className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold hover:underline">
                    {list.length} {list.length === 1 ? "guide" : "guides"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <GuideGrid articles={list} showPillar={false} />
              </section>
            );
          })}
        </div>
      </div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/learn" },
          ]),
          {
            "@type": "CollectionPage",
            name: "Buying guides",
            url: absolute("/learn"),
            hasPart: articles.map((a) => ({ "@type": "Article", headline: a.title, url: absolute(articlePath(a)) })),
          },
        ]}
      />
    </>
  );
}
