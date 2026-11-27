import { admin, isResponse } from "@/lib/api";

/** GET /api/admin/session — who is signed in to the back office (401/403 otherwise). */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  return Response.json({ email: gate.viewer.email, via: gate.via, demo: gate.demo });
}
