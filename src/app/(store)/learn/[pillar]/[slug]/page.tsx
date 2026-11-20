import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articlePath, getArticle, getArticles, getAuthor, getPillar, getRelatedArticles, readingMinutes } from "@/lib/data/articles";
import { getProduct } from "@/lib/data/catalog";
import { renderMarkdown } from "@/lib/markdown";
import { absolute, breadcrumbLd, imageUrl, ORG_ID } from "@/lib/seo";
import type { Article } from "@/lib/learn";
import type { Product } from "@/lib/catalog";
import { PageBar } from "@/components/page-bar";
import { GuideSkeleton } from "@/components/skeletons";
import { JsonLd } from "@/components/json-ld";
import { ProductRail, SectionHead } from "@/components/product-lists";
import { GuideGrid, formatDate } from "@/components/learn/guide-card";

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ pillar: a.pillar, slug: a.slug }));
}

async function coverFor(a: Article) {
  if (a.cover) return { image: a.cover, alt: a.coverAlt ?? a.title };
  const p = a.relatedProducts.length ? await getProduct(a.relatedProducts[0]) : undefined;
  return p ? { image: p.image, alt: p.name } : null;
}

export async function generateMetadata({ params }: PageProps<"/learn/[pillar]/[slug]">): Promise<Metadata> {
  const { pillar, slug } = await params;
  const a = await getArticle(pillar, slug);
  if (!a) return {};
  const path = articlePath(a);
  const cover = await coverFor(a);
  const author = await getAuthor(a.author);
  return {
    title: a.metaTitle || sentence(a.title),
    description: a.description,
    alternates: { canonical: path },
    authors: author ? [{ name: author.name, url: `/authors/${author.slug}` }] : undefined,
    openGraph: {
      type: "article",
      url: path,
      title: sentence(a.title),
      description: a.description,
      publishedTime: a.publishedAt,
      modifiedTime: a.updatedAt,
      section: getPillar(a.pillar)?.name,
      images: cover ? [{ url: imageUrl(cover.image, { og: true }), width: 1200, height: 630, alt: cover.alt }] : undefined,
    },
  };
}

/** URL params resolve inside Suspense so navigations show the skeleton instantly. */
export default function GuidePage({ params }: PageProps<"/learn/[pillar]/[slug]">) {
  return (
    <Suspense fallback={<GuideSkeleton />}>
      {params.then(({ pillar, slug }) => (
        <GuideContent pillar={pillar} slug={slug} />
      ))}
    </Suspense>
  );
}

async function GuideContent({ pillar: pillarId, slug }: { pillar: string; slug: string }) {
  const a = await getArticle(pillarId, slug);
  if (!a) notFound();
  const pillar = getPillar(a.pillar)!;
  const [author, related, cover, products] = await Promise.all([
    getAuthor(a.author),
    getRelatedArticles(a, 3),
    coverFor(a),
    Promise.all(a.relatedProducts.map((s) => getProduct(s))).then((l) => l.filter(Boolean) as Product[]),
  ]);
  const { html, headings } = renderMarkdown(a.body);
  const toc = headings.filter((h) => h.level === 2);
  const path = articlePath(a);
  const title = sentence(a.title);
  const authorHref = author ? `/authors/${author.slug}` : undefined;

  return (
    <>
      <PageBar title={pillar.name} back={`/learn/${pillar.id}`} />
      <article className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <header className="max-w-4xl pt-2 md:pt-10">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-ink-2">
            <Link href="/learn" className="hover:underline">Guides</Link> <span aria-hidden="true">/</span>{" "}
            <Link href={`/learn/${pillar.id}`} className="hover:underline">{pillar.name}</Link>
          </nav>
          <h1 className="mt-4 text-[2.125rem] leading-[0.98] font-black tracking-[-0.035em] text-balance md:text-[3.75rem]">{title}</h1>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-2 md:text-lg">{a.description}</p>
          <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-2">
            {author && (
              <span>
                By{" "}
                <Link href={authorHref!} className="font-bold text-ink hover:underline">
                  {author.name}
                </Link>
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span>
              Updated <time dateTime={a.updatedAt}>{formatDate(a.updatedAt)}</time>
            </span>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(a)} min read</span>
            {a.reviewer && a.reviewedAt && (
              <span className="basis-full font-semibold text-ink">
                Reviewed by {a.reviewer} on <time dateTime={a.reviewedAt}>{formatDate(a.reviewedAt)}</time>
              </span>
            )}
          </p>
        </header>

        <div className="mt-10 grid gap-x-16 md:mt-14 lg:grid-cols-12">
          {/* min-w-0: wide tables scroll inside .table-wrap instead of stretching the column. */}
          <div className="min-w-0 lg:col-span-8">
            {toc.length >= 3 && (
              <details className="mb-10 rounded-lg bg-surface p-4 lg:hidden" open>
                <summary className="cursor-pointer label-caps">On this page</summary>
                <ol className="mt-3 space-y-1.5 text-sm font-semibold">
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="hover:underline">{h.text}</a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div className="guide-prose" dangerouslySetInnerHTML={{ __html: html }} />

            {pillar.legalNote && !/not legal advice/i.test(a.body) && (
              <p className="mt-10 max-w-[42rem] rounded-lg bg-surface p-4 text-sm leading-relaxed text-ink-2">
                General information, not legal advice. Laws vary by state and change; confirm the rules where you live before you buy.
              </p>
            )}

            {a.sources.length > 0 && (
              <section aria-labelledby="sources" className="mt-14 max-w-[42rem] border-t-[3px] border-ink pt-4">
                <h2 id="sources" className="label-caps">Sources</h2>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed">
                  {a.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} rel="noopener nofollow" target="_blank" className="underline decoration-ink/30 underline-offset-2 hover:decoration-ink">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {a.changelog.length > 0 && (
              <section aria-labelledby="changes" className="mt-8 max-w-[42rem]">
                <h2 id="changes" className="label-caps">What changed</h2>
                <ul className="mt-3 space-y-1.5 text-sm text-ink-2">
                  {a.changelog.map((c, i) => (
                    <li key={i}>
                      <time dateTime={c.date} className="font-semibold text-ink">{formatDate(c.date)}</time> — {c.note}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {toc.length >= 3 && (
            <aside className="hidden lg:col-span-4 lg:block">
              <nav aria-label="On this page" className="sticky top-24 border-t-[3px] border-ink pt-4">
                <p className="label-caps">On this page</p>
                <ol className="mt-4 space-y-2.5 text-sm font-semibold text-ink-2">
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className="hover:text-ink hover:underline">{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>
      </article>

      {products.length > 0 && (
        <section aria-label="Shop this guide" className="mx-auto mt-20 max-w-[90rem] px-4 md:mt-28 md:px-6 lg:px-10">
          <SectionHead title="Shop this guide" href={pillar.category ? `/shop/${pillar.category}` : "/shop/all"} className="mb-4 md:mb-8" />
          <ProductRail products={products.slice(0, 4)} />
        </section>
      )}

      {related.length > 0 && (
        <section aria-label="More guides" className="mx-auto mt-16 max-w-[90rem] px-4 md:mt-24 md:px-6 lg:px-10">
          <SectionHead title="More guides" href="/learn" linkLabel="All guides" className="mb-4 md:mb-8" />
          <GuideGrid articles={related} />
        </section>
      )}

      <JsonLd
        data={[
          {
            "@type": "Article",
            "@id": `${absolute(path)}#article`,
            headline: title.slice(0, 110),
            description: a.description,
            ...(cover ? { image: [imageUrl(cover.image, { og: true })] } : {}),
            datePublished: a.publishedAt,
            dateModified: a.updatedAt,
            author: author
              ? { "@type": author.kind === "team" ? "Organization" : "Person", name: author.name, url: absolute(authorHref!) }
              : { "@id": ORG_ID },
            publisher: { "@id": ORG_ID },
            mainEntityOfPage: absolute(path),
            articleSection: pillar.name,
            inLanguage: "en-US",
            ...(a.sources.length ? { citation: a.sources.map((s) => s.url) } : {}),
          },
          ...(a.reviewer && a.reviewedAt
            ? [{ "@type": "WebPage", "@id": absolute(path), reviewedBy: { "@type": "Person", name: a.reviewer }, lastReviewed: a.reviewedAt }]
            : []),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/learn" },
            { name: pillar.name, path: `/learn/${pillar.id}` },
            { name: title, path },
          ]),
        ]}
      />
    </>
  );
}
