import { admin, adminWrite, body, fail, isResponse } from "@/lib/api";
import { createDealer, dealerInput, listDealersAdmin } from "@/lib/data/admin";
import { demoAdminDealers } from "@/lib/data/demo-admin";

/** GET /api/admin/dealers — all FFL dealers, including inactive. */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  if (gate.demo) return Response.json({ demo: true, dealers: demoAdminDealers() });
  return Response.json({ demo: false, dealers: await listDealersAdmin() });
}

/** POST /api/admin/dealers — create an FFL dealer. */
export async function POST(req: Request) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const data = await body(req, dealerInput);
  if (isResponse(data)) return data;
  try {
    return Response.json({ dealer: await createDealer(data) }, { status: 201 });
  } catch (e) {
    return fail(400, (e as Error).message);
  }
}
