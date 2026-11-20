import { getArticles } from "@/lib/data/articles";
import type { Article } from "@/lib/learn";
import { SectionHead } from "@/components/product-lists";
import { GuideGrid } from "@/components/learn/guide-card";
import { Reveal } from "@/components/reveal";

/** "Guides" rail for the home page; links the /learn hub into the store. */
export async function LearnTeaser({ className }: { className?: string }) {
  const articles = (await getArticles()).slice(0, 3);
  if (!articles.length) return null;
  return (
    <section aria-label="Buying guides" className={`mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10 ${className ?? ""}`}>
      <SectionHead title="Buying guides" href="/learn" linkLabel="All guides" className="mb-4 md:mb-8" />
      <Reveal>
        <GuideGrid articles={articles} />
      </Reveal>
    </section>
  );
}

/** Guides block for product and category pages. */
export function RelatedGuides({ articles, title = "Guides for this product", className }: { articles: Article[]; title?: string; className?: string }) {
  if (!articles.length) return null;
  return (
    <section aria-label={title} className={`mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10 ${className ?? ""}`}>
      <SectionHead title={title} href="/learn" linkLabel="All guides" className="mb-4 md:mb-8" />
      <GuideGrid articles={articles} />
    </section>
  );
}
