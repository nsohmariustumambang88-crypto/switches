import { getDealers } from "@/lib/data/dealers";
import { hasSupabase } from "@/lib/supabase/config";

/**
 * GET /api/ffl-dealers — every active FFL dealer as one static, CDN-cached
 * response (no per-request function or DB call). The browser sorts by ZIP
 * with sortDealersByZip(). Admin edits invalidate it via the "dealers" tag.
 */
export async function GET() {
  return Response.json({ sample: !hasSupabase, dealers: await getDealers() });
}
