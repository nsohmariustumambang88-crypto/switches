import { admin, adminWrite, body, fail, isResponse } from "@/lib/api";
import { articleInput, deleteArticle, getArticleAdmin, listAuthorsAdmin, updateArticle } from "@/lib/data/admin-articles";
import { authors, builtinArticles } from "@/lib/learn";

type Ctx = RouteContext<"/api/admin/articles/[id]">;

/** GET /api/admin/articles/:id — one guide plus the author list. */
export async function GET(_req: Request, ctx: Ctx) {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  if (gate.demo) {
    const article = builtinArticles.find((a) => `${a.pillar}--${a.slug}` === id);
    if (!article) return fail(404, "Guide not found.");
    return Response.json({ demo: true, article: { ...article, id }, authors: authors.map(({ slug, name }) => ({ slug, name })) });
  }
  const [article, list] = await Promise.all([getArticleAdmin(id), listAuthorsAdmin()]);
  if (!article) return fail(404, "Guide not found.");
  return Response.json({ demo: false, article, authors: list });
}

/** PATCH /api/admin/articles/:id — full guide body (articleInput). */
export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const data = await body(req, articleInput);
  if (isResponse(data)) return data;
  try {
    const article = await updateArticle(id, data);
    if (!article) return fail(404, "Guide not found.");
    return Response.json({ article });
  } catch (e) {
    const msg = (e as { code?: string; message?: string }).code === "23505" ? "That topic already has a guide with this slug." : (e as Error).message;
    return fail(400, msg);
  }
}

/** DELETE /api/admin/articles/:id */
export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  await deleteArticle(id);
  return Response.json({ ok: true });
}
