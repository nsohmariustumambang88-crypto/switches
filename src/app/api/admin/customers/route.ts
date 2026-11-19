import { admin, isResponse } from "@/lib/api";
import { listCustomers } from "@/lib/data/admin";

/** GET /api/admin/customers — accounts with order counts and lifetime spend. */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  if (gate.demo) return Response.json({ demo: true, customers: [] });
  return Response.json({ demo: false, customers: await listCustomers() });
}
