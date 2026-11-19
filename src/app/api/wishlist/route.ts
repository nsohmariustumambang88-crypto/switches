import { z } from "zod";
import { hasSupabase } from "@/lib/supabase/config";
import { sessionClient } from "@/lib/supabase/clients";
import { getViewer } from "@/lib/auth";
import { body, fail, isResponse, notConnected } from "@/lib/api";

const input = z.object({ slug: z.string().min(1) });

async function productId(db: Awaited<ReturnType<typeof sessionClient>>, slug: string) {
  const { data } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
  return data?.id as string | undefined;
}

/** GET /api/wishlist — saved product slugs for the signed-in customer. */
export async function GET() {
  if (!hasSupabase) return notConnected();
  const viewer = await getViewer();
  if (!viewer) return fail(401, "Sign in to sync favorites.");
  const db = await sessionClient();
  const { data, error } = await db.from("wishlists").select("products(slug)").eq("user_id", viewer.id);
  if (error) return fail(500, error.message);
  const slugs = (data ?? [])
    .map((r) => (r.products as unknown as { slug: string } | null)?.slug)
    .filter(Boolean);
  return Response.json({ slugs });
}

/** POST /api/wishlist — { slug } adds a favorite. */
export async function POST(req: Request) {
  if (!hasSupabase) return notConnected();
  const viewer = await getViewer();
  if (!viewer) return fail(401, "Sign in to sync favorites.");
  const data = await body(req, input);
  if (isResponse(data)) return data;
  const db = await sessionClient();
  const id = await productId(db, data.slug);
  if (!id) return fail(404, "Product not found.");
  const { error } = await db.from("wishlists").upsert({ user_id: viewer.id, product_id: id });
  if (error) return fail(500, error.message);
  return Response.json({ ok: true }, { status: 201 });
}

/** DELETE /api/wishlist — { slug } removes a favorite. */
export async function DELETE(req: Request) {
  if (!hasSupabase) return notConnected();
  const viewer = await getViewer();
  if (!viewer) return fail(401, "Sign in to sync favorites.");
  const data = await body(req, input);
  if (isResponse(data)) return data;
  const db = await sessionClient();
  const id = await productId(db, data.slug);
  if (id) await db.from("wishlists").delete().eq("user_id", viewer.id).eq("product_id", id);
  return Response.json({ ok: true });
}
