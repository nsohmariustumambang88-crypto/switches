import { getCatalog } from "@/lib/data/catalog";
import type { SearchEntry } from "@/lib/search";

/**
 * GET /api/search-index — compact catalog index for instant search
 * suggestions. Static and CDN-cached (prerendered from the cached catalog);
 * the browser downloads it once on first search focus and ranks locally, so
 * typing never calls a function or the database. Revalidated with "catalog".
 */
export async function GET() {
  const { products } = await getCatalog();
  const index: SearchEntry[] = products.map((p) => ({
    s: p.slug,
    n: p.name,
    b: p.brand,
    c: p.caliber ?? "",
    k: p.category,
    i: p.image,
    p: p.price,
    f: !!p.packs?.length,
    w: `${p.type} ${p.strip.join(" ")}`,
  }));
  return Response.json(index);
}
