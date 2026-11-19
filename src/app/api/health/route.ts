import { connection } from "next/server";
import { hasSupabase, serviceKey } from "@/lib/supabase/config";
import { hasCloudinary, mediaFolder } from "@/lib/cloudinary";
import { getCatalog } from "@/lib/data/catalog";

/** GET /api/health — which backends are connected and where the catalog comes from. */
export async function GET() {
  await connection();
  const catalog = await getCatalog();
  return Response.json({
    ok: true,
    supabase: { configured: hasSupabase, serviceRole: Boolean(serviceKey()) },
    cloudinary: { configured: hasCloudinary, folder: mediaFolder },
    catalog: { source: catalog.source, products: catalog.products.length },
  });
}
