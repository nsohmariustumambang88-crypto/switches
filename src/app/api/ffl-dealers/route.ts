import type { NextRequest } from "next/server";
import { findDealers } from "@/lib/data/dealers";
import { hasSupabase } from "@/lib/supabase/config";

/** GET /api/ffl-dealers?zip=78701 — active FFL dealers, nearest ZIP first. */
export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip")?.replace(/\D/g, "").slice(0, 5) || undefined;
  const dealers = await findDealers(zip);
  return Response.json({ sample: !hasSupabase, dealers });
}
