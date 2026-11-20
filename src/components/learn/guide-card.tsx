import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/learn";
import { pillars } from "@/lib/learn";
import { articlePath, readingMinutes } from "@/lib/data/articles";

export const formatDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** A guide as a grey poster card: pillar label, heavy title, summary, read time. */
export function GuideCard({ article, className, showPillar = true }: { article: Article; className?: string; showPillar?: boolean }) {
  const pillar = pillars.find((p) => p.id === article.pillar);
  return (
    <article data-reveal className={cn("group relative flex flex-col rounded-lg bg-panel p-5 md:p-6", className)}>
      {showPillar && pillar && <p className="label-caps text-ink-2">{pillar.name}</p>}
      <h3 className="mt-3 text-[1.1875rem] leading-[1.15] font-extrabold tracking-[-0.015em] md:text-[1.375rem]">
        <Link href={articlePath(article)} className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none group-focus-within:underline">
          {article.title.charAt(0).toUpperCase() + article.title.slice(1)}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{article.description}</p>
      <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs font-semibold text-ink-2">
        <span>
          {readingMinutes(article)} min read · <time dateTime={article.updatedAt}>Updated {formatDate(article.updatedAt)}</time>
        </span>
        <ArrowRight aria-hidden="true" className="size-4 text-ink transition-transform group-hover:translate-x-0.5" />
      </p>
    </article>
  );
}

export function GuideGrid({ articles, className, showPillar }: { articles: Article[]; className?: string; showPillar?: boolean }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-3", className)}>
      {articles.map((a) => (
        <GuideCard key={`${a.pillar}/${a.slug}`} article={a} showPillar={showPillar} />
      ))}
    </div>
  );
}
