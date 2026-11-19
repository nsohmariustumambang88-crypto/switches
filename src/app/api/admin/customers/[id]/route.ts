import { adminWrite, body, fail, isResponse } from "@/lib/api";
import { roleInput, setRole } from "@/lib/data/admin";

/** PATCH /api/admin/customers/:id — { role: "customer" | "admin" }. */
export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/customers/[id]">) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const { id } = await ctx.params;
  const data = await body(req, roleInput);
  if (isResponse(data)) return data;
  if (id === gate.viewer.id && data.role !== "admin") return fail(400, "You can't remove your own admin role.");
  await setRole(id, data.role);
  return Response.json({ ok: true });
}
