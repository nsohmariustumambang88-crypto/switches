import { adminWrite, body, fail, isResponse } from "@/lib/api";
import { dealerInput, deleteDealer, updateDealer } from "@/lib/data/admin";

type Ctx = RouteContext<"/api/admin/dealers/[id]">;

/** PATCH /api/admin/dealers/:id — full dealer body. */
export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const data = await body(req, dealerInput);
  if (isResponse(data)) return data;
  const dealer = await updateDealer(id, data);
  if (!dealer) return fail(404, "Dealer not found.");
  return Response.json({ dealer });
}

/** DELETE /api/admin/dealers/:id — past orders keep their dealer snapshot. */
export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  await deleteDealer(id);
  return Response.json({ ok: true });
}
