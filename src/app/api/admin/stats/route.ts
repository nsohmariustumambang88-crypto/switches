import { admin, isResponse } from "@/lib/api";
import { getStats } from "@/lib/data/admin";
import { listOrdersAdmin } from "@/lib/data/orders";
import { demoAdminOrders, demoStats } from "@/lib/data/demo-admin";

/** GET /api/admin/stats — dashboard counts, 30-day revenue, low stock, recent orders. */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  if (gate.demo) return Response.json({ demo: true, stats: demoStats(), recent: demoAdminOrders() });
  const [stats, recent] = await Promise.all([getStats(), listOrdersAdmin({ limit: 8 })]);
  return Response.json({ demo: false, stats, recent });
}
