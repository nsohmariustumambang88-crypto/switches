import { hasSupabase, serviceKey } from "@/lib/supabase/config";
import { getViewer } from "@/lib/auth";
import { body, fail, isResponse, notConnected } from "@/lib/api";
import { createOrder, listOrdersForUser, orderInput, OrderError } from "@/lib/data/orders";

/** GET /api/orders — the signed-in customer's orders. */
export async function GET() {
  if (!hasSupabase) return notConnected();
  const viewer = await getViewer();
  if (!viewer) return fail(401, "Sign in to see your orders.");
  return Response.json({ orders: await listOrdersForUser(viewer.id) });
}

/**
 * POST /api/orders — place an order.
 * Body: { email, items:[{slug, qty, rounds?}], billing:{name,line1,city,state,zip},
 *         fflDealerId?, payment:"card"|"ach", attested:true }
 * Prices, packs, stock and the FFL requirement are re-checked server-side.
 * No payment is captured yet (no processor connected).
 */
export async function POST(req: Request) {
  if (!hasSupabase || !serviceKey()) return notConnected();
  const input = await body(req, orderInput);
  if (isResponse(input)) return input;
  try {
    const viewer = await getViewer();
    const order = await createOrder(input, viewer);
    return Response.json({ order }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return fail(e.status, e.message);
    console.error("[orders] create failed", e);
    return fail(500, "Could not place the order. Try again.");
  }
}
