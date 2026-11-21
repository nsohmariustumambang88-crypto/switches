import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data/catalog";
import { articlePath, getActivePillars, getArticles, getLearn } from "@/lib/data/articles";
import { absolute, imageUrl } from "@/lib/seo";

/**
 * /sitemap.xml — every indexable page, with product images. `lastModified` is
 * only set from real content edits (Supabase updated_at / a guide's updatedAt),
 * never "now", so search engines can trust it. Served statically and refreshed
 * with the catalog and guide cache tags.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products, pillars, articles, learn] = await Promise.all([
    getCategories(),
    getProducts(),
    getActivePillars(),
    getArticles(),
    getLearn(),
  ]);

  const latest = (dates: (string | undefined)[]) => dates.filter(Boolean).sort().at(-1);

  return [
    { url: absolute("/"), changeFrequency: "daily", priority: 1 },
    { url: absolute("/categories"), changeFrequency: "weekly", priority: 0.5 },
    { url: absolute("/shipping"), changeFrequency: "monthly", priority: 0.4 },
    { url: absolute("/shop/all"), changeFrequency: "daily", priority: 0.7 },
    ...categories.map((c) => ({
      url: absolute(`/shop/${c.id}`),
      changeFrequency: "daily" as const,
      priority: 0.9,
      lastModified: latest(products.filter((p) => p.category === c.id).map((p) => p.updatedAt)),
    })),
    ...products.map((p) => ({
      url: absolute(`/product/${p.slug}`),
      changeFrequency: "weekly" as const,
      priority: p.trending ? 0.8 : 0.7,
      lastModified: p.updatedAt,
      images: [imageUrl(p.image, { width: 1200 })],
    })),
    { url: absolute("/learn"), changeFrequency: "weekly", priority: 0.7, lastModified: latest(articles.map((a) => a.updatedAt)) },
    ...pillars.map((p) => ({
      url: absolute(`/learn/${p.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: latest(articles.filter((a) => a.pillar === p.id).map((a) => a.updatedAt)),
    })),
    ...articles.map((a) => ({
      url: absolute(articlePath(a)),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: a.updatedAt,
    })),
    ...learn.authors.map((a) => ({ url: absolute(`/authors/${a.slug}`), changeFrequency: "monthly" as const, priority: 0.3 })),
  ];
}
