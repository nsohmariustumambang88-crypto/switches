import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getArticles, getAuthor, getLearn } from "@/lib/data/articles";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { GuideGrid } from "@/components/learn/guide-card";
import { GuideSkeleton } from "@/components/skeletons";
import { JsonLd } from "@/components/json-ld";
import { absolute, breadcrumbLd, clip } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getLearn()).authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/authors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAuthor(slug);
  if (!a) return {};
  return {
    title: `${a.name} — ${a.role}`,
    description: clip(a.bio),
    alternates: { canonical: `/authors/${a.slug}` },
    openGraph: { url: `/authors/${a.slug}`, type: "profile" },
  };
}

/** /authors/:slug — who writes and reviews the guides (Google's "who" test). */
export default function AuthorPage({ params }: PageProps<"/authors/[slug]">) {
  return (
    <Suspense fallback={<GuideSkeleton />}>
      {params.then(({ slug }) => (
        <AuthorContent slug={slug} />
      ))}
    </Suspense>
  );
}

async function AuthorContent({ slug }: { slug: string }) {
  const author = await getAuthor(slug);
  if (!author) notFound();
  const articles = (await getArticles()).filter((a) => a.author === author.slug);
  const url = absolute(`/authors/${author.slug}`);
  return (
    <>
      <PageBar title={author.name} back="/learn" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle title={author.name} meta={<span className="font-semibold text-ink">{author.role}</span>} />
        <div className="max-w-2xl space-y-3 text-[1.0625rem] leading-relaxed">
          <p>{author.bio}</p>
          {author.credentials && <p className="text-ink-2">{author.credentials}</p>}
        </div>
        {articles.length > 0 && (
          <section aria-label="Guides by this author" className="mt-14 md:mt-20">
            <h2 className="mb-5 border-t-[3px] border-ink pt-4 text-[1.5rem] leading-none font-black tracking-[-0.03em] md:mb-8 md:text-[2.25rem]">Guides</h2>
            <GuideGrid articles={articles} />
          </section>
        )}
      </div>
      <JsonLd
        data={[
          {
            "@type": "ProfilePage",
            url,
            mainEntity: {
              "@type": author.kind === "team" ? "Organization" : "Person",
              name: author.name,
              description: author.bio,
              ...(author.kind === "person" ? { jobTitle: author.role } : {}),
              ...(author.url ? { sameAs: [author.url] } : {}),
            },
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/learn" },
            { name: author.name, path: `/authors/${author.slug}` },
          ]),
        ]}
      />
    </>
  );
}
