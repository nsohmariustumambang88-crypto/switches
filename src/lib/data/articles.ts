import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/clients";
import { authors as builtinAuthors, builtinArticles, pillars, type Article, type Author, type Pillar, type PillarId } from "@/lib/learn";
import type { Product } from "@/lib/catalog";
import { markdownText } from "@/lib/markdown";

/** Cache tag for every guide read; admin writes call revalidateTag(ARTICLES_TAG, …). */
export const ARTICLES_TAG = "articles";

export type ArticleRow = {
  id: string;
  slug: string;
  pillar: PillarId;
  title: string;
  meta_title: string | null;
  description: string;
  body: string;
  cover: string | null;
  cover_alt: string | null;
  author_slug: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  sources: Article["sources"] | null;
  changelog: Article["changelog"] | null;
  related_products: string[] | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
  created_at: string;
};

export function rowToArticle(r: ArticleRow): Article {
  return {
    id: r.id,
    slug: r.slug,
    pillar: r.pillar,
    title: r.title,
    metaTitle: r.meta_title || undefined,
    description: r.description,
    body: r.body,
    cover: r.cover || undefined,
    coverAlt: r.cover_alt || undefined,
    author: r.author_slug || "editorial-team",
    reviewer: r.reviewer || undefined,
    reviewedAt: r.reviewed_at || undefined,
    sources: r.sources ?? [],
    changelog: r.changelog ?? [],
    relatedProducts: r.related_products ?? [],
    status: r.status,
    publishedAt: r.published_at ?? r.created_at,
    updatedAt: r.updated_at,
  };
}

type AuthorRow = { slug: string; name: string; kind: "person" | "team"; role: string | null; bio: string | null; credentials: string | null; url: string | null };
const rowToAuthor = (r: AuthorRow): Author => ({
  slug: r.slug,
  name: r.name,
  kind: r.kind,
  role: r.role ?? "",
  bio: r.bio ?? "",
  credentials: r.credentials || undefined,
  url: r.url || undefined,
});

const newestFirst = (a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt);

type Learn = { articles: Article[]; authors: Author[]; source: "supabase" | "builtin" };

function builtin(): Learn {
  return {
    articles: builtinArticles.filter((a) => a.status === "published").sort(newestFirst),
    authors: builtinAuthors,
    source: "builtin",
  };
}

/** Every published guide and author, cached and tagged. Falls back to the built-in guides. */
export async function getLearn(): Promise<Learn> {
  "use cache";
  cacheTag(ARTICLES_TAG);
  cacheLife("max"); // invalidated on admin writes via revalidateTag

  if (!hasSupabase) return builtin();
  try {
    const db = publicClient();
    const [arts, auths] = await Promise.all([
      db.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false }),
      db.from("authors").select("*"),
    ]);
    if (arts.error || auths.error) throw arts.error ?? auths.error;
    const articles = (arts.data as ArticleRow[]).map(rowToArticle);
    if (!articles.length) return builtin(); // not seeded yet
    const authors = (auths.data as AuthorRow[]).map(rowToAuthor);
    return { articles, authors: authors.length ? authors : builtinAuthors, source: "supabase" };
  } catch (e) {
    console.error("[learn] Supabase read failed; serving the built-in guides.", e);
    return builtin();
  }
}

export const getPillar = (id: string): Pillar | undefined => pillars.find((p) => p.id === id);

/** Pillars that have at least one published guide (empty pillars are not linked or indexed). */
export async function getActivePillars() {
  const { articles } = await getLearn();
  return pillars.filter((p) => articles.some((a) => a.pillar === p.id));
}

export async function getArticles(pillar?: string) {
  const { articles } = await getLearn();
  return pillar ? articles.filter((a) => a.pillar === pillar) : articles;
}

export async function getArticle(pillar: string, slug: string) {
  return (await getArticles(pillar)).find((a) => a.slug === slug);
}

export async function getAuthor(slug: string) {
  return (await getLearn()).authors.find((a) => a.slug === slug);
}

/** Same-pillar guides first, then the newest others. */
export async function getRelatedArticles(a: Article, n = 3) {
  const all = (await getArticles()).filter((x) => x.slug !== a.slug);
  return [...all.filter((x) => x.pillar === a.pillar), ...all.filter((x) => x.pillar !== a.pillar)].slice(0, n);
}

/** Guides for a product page: ones that feature the product, then its department's pillar. */
export async function getGuidesForProduct(p: Product, n = 3) {
  const all = await getArticles();
  const featured = all.filter((a) => a.relatedProducts.includes(p.slug));
  const pillar = pillars.filter((x) => x.category === p.category).map((x) => x.id);
  const topical = all.filter((a) => !featured.includes(a) && pillar.includes(a.pillar));
  return [...featured, ...topical].slice(0, n);
}

/** Guides for a category page. */
export async function getGuidesForCategory(category: string, n = 4) {
  const ids = pillars.filter((x) => x.category === category).map((x) => x.id);
  return (await getArticles()).filter((a) => ids.includes(a.pillar)).slice(0, n);
}

export const articlePath = (a: Pick<Article, "pillar" | "slug">) => `/learn/${a.pillar}/${a.slug}`;

export function readingMinutes(a: Pick<Article, "body">) {
  return Math.max(1, Math.round(markdownText(a.body).split(" ").length / 230));
}
