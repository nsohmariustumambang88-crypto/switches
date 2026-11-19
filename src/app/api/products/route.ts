import type { NextRequest } from "next/server";
import { queryProducts, type ProductQuery } from "@/lib/data/catalog";
import type { CategoryId } from "@/lib/catalog";

const CATS = ["all", "handguns", "ammunition", "triggers", "parts"];
const SORTS = ["featured", "price-asc", "price-desc", "rating"];
const list = (v: string | null) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined);
const num = (v: string | null) => (v !== null && v !== "" && !Number.isNaN(Number(v)) ? Number(v) : undefined);

/**
 * GET /api/products
 * ?category=handguns|ammunition|triggers|parts|all &type= &q= &brand=a,b &caliber=9mm
 * &min= &max= &sort=featured|price-asc|price-desc|rating &slugs=a,b
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") ?? "all";
  const sort = sp.get("sort") ?? "featured";
  if (!CATS.includes(category)) return Response.json({ error: "Unknown category." }, { status: 400 });
  if (!SORTS.includes(sort)) return Response.json({ error: "Unknown sort." }, { status: 400 });

  const query: ProductQuery = {
    category: category as CategoryId | "all",
    type: sp.get("type") ?? undefined,
    q: sp.get("q")?.slice(0, 80) ?? undefined,
    brand: list(sp.get("brand")),
    caliber: list(sp.get("caliber")),
    min: num(sp.get("min")),
    max: num(sp.get("max")),
    sort: sort as ProductQuery["sort"],
    slugs: list(sp.get("slugs")),
  };
  const products = await queryProducts(query);
  return Response.json({ count: products.length, products });
}
