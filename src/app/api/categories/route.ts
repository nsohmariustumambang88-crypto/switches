import { getCatalog } from "@/lib/data/catalog";

/** GET /api/categories — departments with their types and product counts. */
export async function GET() {
  const { categories, products } = await getCatalog();
  return Response.json({
    categories: categories.map((c) => ({
      ...c,
      count: products.filter((p) => p.category === c.id).length,
    })),
  });
}
