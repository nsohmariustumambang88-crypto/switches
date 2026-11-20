import { admin, adminWrite, body, fail, isResponse } from "@/lib/api";
import { articleInput, createArticle, listArticlesAdmin, listAuthorsAdmin } from "@/lib/data/admin-articles";
import { authors, builtinArticles } from "@/lib/learn";

/** GET /api/admin/articles — every guide (drafts included) and the author list. */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  if (gate.demo) {
    return Response.json({
      demo: true,
      articles: builtinArticles.map((a) => ({ ...a, id: `${a.pillar}--${a.slug}` })),
      authors: authors.map(({ slug, name }) => ({ slug, name })),
    });
  }
  const [articles, list] = await Promise.all([listArticlesAdmin(), listAuthorsAdmin()]);
  return Response.json({ demo: false, articles, authors: list });
}

/** POST /api/admin/articles — create a guide (see articleInput for the body). */
export async function POST(req: Request) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const data = await body(req, articleInput);
  if (isResponse(data)) return data;
  try {
    return Response.json({ article: await createArticle(data) }, { status: 201 });
  } catch (e) {
    const msg = (e as { code?: string; message?: string }).code === "23505" ? "That topic already has a guide with this slug." : (e as Error).message;
    return fail(400, msg);
  }
}
