import { hasSupabase } from "@/lib/supabase/config";
import { sessionClient } from "@/lib/supabase/clients";

/** POST /api/auth/sign-out — clears the session cookies. */
export async function POST() {
  if (hasSupabase) {
    const db = await sessionClient();
    await db.auth.signOut();
  }
  return Response.json({ ok: true });
}
