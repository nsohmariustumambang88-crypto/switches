import { admin, adminWrite, body, fail, isResponse } from "@/lib/api";
import { deleteProduct, getProductAdmin, productInput, updateProduct } from "@/lib/data/admin";
import { demoProducts } from "@/lib/data/demo-admin";

type Ctx = RouteContext<"/api/admin/products/[id]">;

/** GET /api/admin/products/:id */
export async function GET(_req: Request, ctx: Ctx) {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const product = gate.demo ? demoProducts().find((p) => p.id === id) : await getProductAdmin(id);
  if (!product) return fail(404, "Product not found.");
  return Response.json({ demo: gate.demo, product });
}

/** PATCH /api/admin/products/:id — full product body (productInput). */
export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const data = await body(req, productInput);
  if (isResponse(data)) return data;
  try {
    const product = await updateProduct(id, data);
    if (!product) return fail(404, "Product not found.");
    return Response.json({ product });
  } catch (e) {
    const msg = (e as { code?: string; message?: string }).code === "23505" ? "That slug is already used." : (e as Error).message;
    return fail(400, msg);
  }
}

/** DELETE /api/admin/products/:id — past orders keep their item snapshots. */
export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  await deleteProduct(id);
  return Response.json({ ok: true });
}
