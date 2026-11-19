import { getSettings } from "@/lib/data/settings";

/** GET /api/settings — public store settings (name, contacts, shipping rule, preview flag). */
export async function GET() {
  return Response.json(await getSettings());
}
