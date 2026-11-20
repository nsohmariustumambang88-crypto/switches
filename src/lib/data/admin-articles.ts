import { z } from "zod";
import { revalidateTag } from "next/cache";
import { serviceClient } from "@/lib/supabase/clients";
import { ARTICLES_TAG, rowToArticle, type ArticleRow } from "@/lib/data/articles";
import { pillars } from "@/lib/learn";

const expireNow = { expire: 0 };
const pillarIds = pillars.map((p) => p.id) as [string, ...string[]];
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Use YYYY-MM-DD.");

export const articleInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  pillar: z.enum(pillarIds),
  title: z.string().trim().min(4),
  metaTitle: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().min(20, "Write a short description (it becomes the Google snippet).").max(220),
  body: z.string().default(""),
  cover: z.string().trim().nullable().optional(),
  coverAlt: z.string().trim().max(200).nullable().optional(),
  author: z.string().trim().min(1).default("editorial-team"),
  reviewer: z.string().trim().max(120).nullable().optional(),
  reviewedAt: isoDate.nullable().optional(),
  sources: z.array(z.object({ label: z.string().trim().min(1), url: z.url() })).default([]),
  changelog: z.array(z.object({ date: isoDate, note: z.string().trim().min(1) })).default([]),
  relatedProducts: z.array(z.string().trim().min(1)).max(12).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
});
export type ArticleInput = z.infer<typeof articleInput>;

function toRow(a: ArticleInput) {
  return {
    slug: a.slug,
    pillar: a.pillar,
    title: a.title,
    meta_title: a.metaTitle || null,
    description: a.description,
    body: a.body,
    cover: a.cover || null,
    cover_alt: a.coverAlt || null,
    author_slug: a.author || null,
    reviewer: a.reviewer || null,
    reviewed_at: a.reviewedAt || null,
    sources: a.sources,
    changelog: a.changelog,
    related_products: a.relatedProducts,
    status: a.status,
  };
}

/** Fields whose change counts as a content update (moves dateModified and sitemap lastmod). */
const CONTENT = ["title", "description", "body", "sources", "related_products", "cover"] as const;

export async function listArticlesAdmin() {
  const { data, error } = await serviceClient().from("articles").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as ArticleRow[]).map(rowToArticle);
}

export async function listAuthorsAdmin() {
  const { data, error } = await serviceClient().from("authors").select("slug, name").order("name");
  if (error) throw error;
  return data as { slug: string; name: string }[];
}

export async function getArticleAdmin(id: string) {
  const { data, error } = await serviceClient().from("articles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToArticle(data as ArticleRow) : null;
}

export async function createArticle(a: ArticleInput) {
  const now = new Date().toISOString();
  const { data, error } = await serviceClient()
    .from("articles")
    .insert({ ...toRow(a), updated_at: now, published_at: a.status === "published" ? now : null })
    .select("id")
    .single();
  if (error) throw error;
  revalidateTag(ARTICLES_TAG, expireNow);
  return getArticleAdmin(data.id);
}

export async function updateArticle(id: string, a: ArticleInput) {
  const db = serviceClient();
  const { data: old, error: readError } = await db.from("articles").select("*").eq("id", id).maybeSingle();
  if (readError) throw readError;
  if (!old) return null;
  const row = toRow(a);
  const changed = CONTENT.some((k) => JSON.stringify(row[k] ?? null) !== JSON.stringify((old as Record<string, unknown>)[k] ?? null));
  const now = new Date().toISOString();
  const { error } = await db
    .from("articles")
    .update({
      ...row,
      ...(changed ? { updated_at: now } : {}),
      ...(a.status === "published" && !old.published_at ? { published_at: now } : {}),
    })
    .eq("id", id);
  if (error) throw error;
  revalidateTag(ARTICLES_TAG, expireNow);
  return getArticleAdmin(id);
}

export async function deleteArticle(id: string) {
  const { error } = await serviceClient().from("articles").delete().eq("id", id);
  if (error) throw error;
  revalidateTag(ARTICLES_TAG, expireNow);
}
