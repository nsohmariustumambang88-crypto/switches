import type { z } from "zod";
import { connection } from "next/server";
import { adminGate, type AdminGate } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export function fail(status: number, error: string, extra?: Record<string, unknown>) {
  return Response.json({ error, ...extra }, { status });
}

export const notConnected = () =>
  fail(503, "Supabase is not connected yet. Add the new project's keys to .env.local, then run npm run db:migrate && npm run db:seed.", {
    code: "supabase_not_configured",
  });

/** Parse a JSON body with a zod schema; returns the data or a 400 response. */
export async function body<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S> | Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail(400, "Body must be JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return fail(400, "Invalid request.", { issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) });
  }
  return parsed.data;
}

/** Gate for admin handlers. Returns the gate, or a 401/403 response. */
export async function admin(): Promise<Exclude<AdminGate, { ok: false }> | Response> {
  await connection(); // always per-request: never prerender admin data
  const gate = await adminGate();
  if (!gate.ok) return fail(gate.status, gate.message);
  return gate;
}

/** Gate for admin writes: also refuses demo mode. */
export async function adminWrite(): Promise<Extract<AdminGate, { demo: false }> | Response> {
  const gate = await admin();
  if (gate instanceof Response) return gate;
  if (gate.demo) return notConnected();
  return gate;
}

export const isResponse = (v: unknown): v is Response => v instanceof Response;
