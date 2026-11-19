import { hasSupabase } from "@/lib/supabase/config";
import { getViewer } from "@/lib/auth";
import { fail, notConnected } from "@/lib/api";
import { getOrderById } from "@/lib/data/orders";

/** GET /api/orders/:id — visible to the customer who placed it and to admins. */
export async function GET(_req: Request, ctx: RouteContext<"/api/orders/[id]">) {
  if (!hasSupabase) return notConnected();
  const { id } = await ctx.params;
  const viewer = await getViewer();
  if (!viewer) return fail(401, "Sign in to see this order.");
  const found = await getOrderById(id.toUpperCase());
  if (!found) return fail(404, "Order not found.");
  const { userId, ...order } = found;
  if (userId !== viewer.id && viewer.role !== "admin") return fail(404, "Order not found.");
  return Response.json({ order });
}
