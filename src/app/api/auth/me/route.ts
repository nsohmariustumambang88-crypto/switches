import { connection } from "next/server";
import { hasSupabase } from "@/lib/supabase/config";
import { getViewer } from "@/lib/auth";

/** GET /api/auth/me — { configured, viewer } where viewer is null when signed out. */
export async function GET() {
  await connection();
  return Response.json({ configured: hasSupabase, viewer: await getViewer() });
}
