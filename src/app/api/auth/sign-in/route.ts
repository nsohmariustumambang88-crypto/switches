import { z } from "zod";
import { hasSupabase } from "@/lib/supabase/config";
import { sessionClient } from "@/lib/supabase/clients";
import { getViewer, syncAdminRole } from "@/lib/auth";
import { body, fail, isResponse, notConnected } from "@/lib/api";

const input = z.object({ email: z.email(), password: z.string().min(8) });

/** POST /api/auth/sign-in — { email, password }; sets the session cookies. */
export async function POST(req: Request) {
  if (!hasSupabase) return notConnected();
  const data = await body(req, input);
  if (isResponse(data)) return data;
  const db = await sessionClient();
  const { data: res, error } = await db.auth.signInWithPassword(data);
  if (error || !res.user) return fail(401, "Email or password is incorrect.");
  await syncAdminRole(res.user.id, res.user.email ?? "");
  return Response.json({ viewer: await getViewer() });
}
