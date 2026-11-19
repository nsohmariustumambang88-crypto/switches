import { admin, adminWrite, body, fail, isResponse } from "@/lib/api";
import { getOrderById, orderUpdate, updateOrderAdmin } from "@/lib/data/orders";
import { demoAdminOrders } from "@/lib/data/demo-admin";

type Ctx = RouteContext<"/api/admin/orders/[id]">;

/** GET /api/admin/orders/:id */
export async function GET(_req: Request, ctx: Ctx) {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const order = gate.demo ? demoAdminOrders().find((o) => o.id === id) : await getOrderById(id);
  if (!order) return fail(404, "Order not found.");
  return Response.json({ demo: gate.demo, order });
}

/** PATCH /api/admin/orders/:id — { status?, carrier?, tracking?, note? }; a status change logs an event. */
export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const data = await body(req, orderUpdate);
  if (isResponse(data)) return data;
  const order = await updateOrderAdmin(id, data);
  if (!order) return fail(404, "Order not found.");
  return Response.json({ order });
}
