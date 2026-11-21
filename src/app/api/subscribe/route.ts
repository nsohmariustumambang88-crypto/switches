import { z } from "zod";
import { body, fail, isResponse, notConnected } from "@/lib/api";
import { hasSupabase } from "@/lib/supabase/config";
import { serviceClient } from "@/lib/supabase/clients";

const input = z.object({
  email: z.email().max(200),
  country: z.string().trim().max(60).optional(),
  source: z.string().trim().max(40).default("site"),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(0).optional(),
});

/**
 * POST /api/subscribe — add an email to the list (e.g. international visitors
 * asking to be told if shipping opens). Runs only when someone submits the form.
 */
export async function POST(req: Request) {
  const data = await body(req, input);
  if (isResponse(data)) return data;
  if (!hasSupabase) return notConnected();
  const { error } = await serviceClient()
    .from("subscribers")
    .upsert({ email: data.email.toLowerCase(), country: data.country || null, source: data.source }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return fail(500, "Could not save your email. Please try again.");
  return Response.json({ ok: true }, { status: 201 });
}
