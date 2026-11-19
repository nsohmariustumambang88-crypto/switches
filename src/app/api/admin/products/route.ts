import { admin, adminWrite, body, fail, isResponse } from "@/lib/api";
import { createProduct, listProductsAdmin, productInput } from "@/lib/data/admin";
import { demoProducts } from "@/lib/data/demo-admin";

/** GET /api/admin/products — every product, including inactive ones. */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  if (gate.demo) return Response.json({ demo: true, products: demoProducts() });
  return Response.json({ demo: false, products: await listProductsAdmin() });
}

/** POST /api/admin/products — create a product (see productInput for the body). */
export async function POST(req: Request) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const data = await body(req, productInput);
  if (isResponse(data)) return data;
  try {
    return Response.json({ product: await createProduct(data) }, { status: 201 });
  } catch (e) {
    const msg = (e as { code?: string; message?: string }).code === "23505" ? "That slug is already used." : (e as Error).message;
    return fail(400, msg);
  }
}
