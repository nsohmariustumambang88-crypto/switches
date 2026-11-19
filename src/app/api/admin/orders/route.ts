import type { NextRequest } from "next/server";
import { admin, fail, isResponse } from "@/lib/api";
import { listOrdersAdmin, ORDER_STATUSES } from "@/lib/data/orders";
import { demoAdminOrders } from "@/lib/data/demo-admin";
import type { OrderStatus } from "@/lib/catalog";

/** GET /api/admin/orders?status=placed|shipped|at-ffl|complete|cancelled&q=CB1 */
export async function GET(req: NextRequest) {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const q = req.nextUrl.searchParams.get("q") || undefined;
  if (status && !ORDER_STATUSES.includes(status as OrderStatus)) return fail(400, "Unknown status.");
  if (gate.demo) {
    const orders = demoAdminOrders().filter(
      (o) => (!status || o.status === status) && (!q || o.id.toLowerCase().includes(q.toLowerCase()))
    );
    return Response.json({ demo: true, orders });
  }
  return Response.json({ demo: false, orders: await listOrdersAdmin({ status: status as OrderStatus | undefined, q }) });
}
