import { z } from "zod";
import { hasSupabase } from "@/lib/supabase/config";
import { sessionClient } from "@/lib/supabase/clients";
import { getViewer, syncAdminRole } from "@/lib/auth";
import { body, fail, isResponse, notConnected } from "@/lib/api";

const input = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(72),
  ageConfirmed: z.literal(true),
});

/**
 * POST /api/auth/sign-up — { fullName, email, password, ageConfirmed:true }.
 * If the Supabase project requires email confirmation, `needsConfirmation` is true
 * and no session is set until the link is clicked.
 */
export async function POST(req: Request) {
  if (!hasSupabase) return notConnected();
  const data = await body(req, input);
  if (isResponse(data)) return data;
  const db = await sessionClient();
  const { data: res, error } = await db.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.fullName } },
  });
  if (error) return fail(400, error.message);
  if (res.user) await syncAdminRole(res.user.id, data.email);
  return Response.json({ needsConfirmation: !res.session, viewer: res.session ? await getViewer() : null }, { status: 201 });
}
