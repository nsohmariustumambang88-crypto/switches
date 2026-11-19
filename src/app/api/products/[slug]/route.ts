import { getProduct, getRelated } from "@/lib/data/catalog";

/** GET /api/products/:slug — one product plus related products. */
export async function GET(_req: Request, ctx: RouteContext<"/api/products/[slug]">) {
  const { slug } = await ctx.params;
  const product = await getProduct(slug);
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  return Response.json({ product, related: await getRelated(product) });
}
