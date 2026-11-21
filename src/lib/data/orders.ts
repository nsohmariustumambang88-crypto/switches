import { z } from "zod";
import { serviceClient } from "@/lib/supabase/clients";
import { PRODUCT_SELECT, rowToProduct, type ProductRow } from "@/lib/data/catalog";
import { getSettings, shippingFor } from "@/lib/data/settings";
import { dealerAddress, type Order, type OrderStatus } from "@/lib/catalog";
import type { Viewer } from "@/lib/auth";

export const ORDER_STATUSES = ["placed", "shipped", "at-ffl", "complete", "cancelled"] as const;
const FLOW: OrderStatus[] = ["placed", "shipped", "at-ffl", "complete"];

export const orderInput = z.object({
  email: z.email(),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        qty: z.number().int().min(1).max(99),
        rounds: z.number().int().positive().optional(),
      })
    )
    .min(1)
    .max(50),
  billing: z.object({
    name: z.string().trim().min(1),
    line1: z.string().trim().min(1),
    city: z.string().trim().min(1),
    state: z.string().trim().min(2).max(2),
    zip: z.string().trim().min(5).max(10),
    phone: z.string().trim().max(30).optional(),
  }),
  fflDealerId: z.string().optional(),
  payment: z.enum(["card", "ach"]),
  delivery: z.enum(["standard", "express"]).default("standard"),
  attested: z.literal(true),
});
export type OrderInput = z.infer<typeof orderInput>;

export class OrderError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type OrderRow = {
  id: string;
  user_id: string | null;
  email: string;
  status: OrderStatus;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  billing: Order["billing"];
  ffl_snapshot: { name: string; address: string } | null;
  payment_method: "card" | "ach";
  delivery?: "standard" | "express" | null;
  carrier: string | null;
  tracking: string | null;
  created_at: string;
  order_items?: {
    slug: string;
    name: string;
    image: string;
    ffl: boolean;
    qty: number;
    rounds: number | null;
    unit_price: number | string;
  }[];
  order_events?: { status: OrderStatus; note: string | null; created_at: string }[];
};

const ORDER_SELECT = "*, order_items(slug, name, image, ffl, qty, rounds, unit_price), order_events(status, note, created_at)";

export function rowToOrder(r: OrderRow): Order {
  const events = [...(r.order_events ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const at = (s: OrderStatus) => [...events].reverse().find((e) => e.status === s)?.created_at ?? null;
  const flow = FLOW.map((s) => ({ status: s, at: at(s) }));
  return {
    id: r.id,
    date: r.created_at,
    status: r.status,
    email: r.email,
    items: (r.order_items ?? []).map((i) => ({
      slug: i.slug,
      qty: i.qty,
      rounds: i.rounds ?? undefined,
      name: i.name,
      image: i.image,
      unitPrice: Number(i.unit_price),
      ffl: i.ffl,
    })),
    ffl: r.ffl_snapshot ?? undefined,
    carrier: r.carrier ?? "Pending",
    tracking: r.tracking ?? "—",
    events: r.status === "cancelled" ? [...flow, { status: "cancelled", at: at("cancelled") }] : flow,
    subtotal: Number(r.subtotal),
    shipping: Number(r.shipping),
    total: Number(r.total),
    billing: r.billing,
    payment: r.payment_method,
    delivery: r.delivery ?? "standard",
  };
}

function newOrderId() {
  return "CB" + String(Math.floor(10000 + Math.random() * 89999));
}

/** Validates against live prices/stock, then writes the order. */
export async function createOrder(input: OrderInput, viewer: Viewer | null): Promise<Order> {
  const db = serviceClient();
  const slugs = [...new Set(input.items.map((i) => i.slug))];
  const { data: rows, error } = await db.from("products").select(PRODUCT_SELECT).in("slug", slugs).eq("active", true);
  if (error) throw error;
  const bySlug = new Map((rows as ProductRow[]).map((r) => [r.slug, r]));

  const lines = input.items.map((i) => {
    const row = bySlug.get(i.slug);
    if (!row) throw new OrderError(409, `“${i.slug}” is no longer available.`);
    const p = rowToProduct(row);
    let unit = p.price;
    if (p.packs?.length) {
      const pack = p.packs.find((k) => k.rounds === i.rounds);
      if (!pack) throw new OrderError(400, `Choose a valid round count for ${p.name}.`);
      unit = pack.price;
    }
    if (row.stock < i.qty) throw new OrderError(409, `Only ${row.stock} left of ${p.name}.`);
    return { row, p, qty: i.qty, rounds: i.rounds, unit };
  });

  const hasFirearm = lines.some((l) => l.p.ffl);
  let ffl: { id: string; name: string; address: string } | null = null;
  if (hasFirearm) {
    if (!input.fflDealerId) throw new OrderError(400, "Choose an FFL dealer to receive the firearm.");
    const { data: d } = await db.from("ffl_dealers").select("*").eq("id", input.fflDealerId).eq("active", true).maybeSingle();
    if (!d) throw new OrderError(400, "That FFL dealer is not available.");
    ffl = { id: d.id, name: d.name, address: dealerAddress(d) };
  }

  const settings = await getSettings();
  const subtotal = Math.round(lines.reduce((n, l) => n + l.unit * l.qty, 0) * 100) / 100;
  const shipping = shippingFor(subtotal, settings.shipping, input.delivery);
  const total = Math.round((subtotal + shipping) * 100) / 100;

  // Reserve stock first; roll back what was reserved if any line fails.
  const reserved: { id: string; qty: number }[] = [];
  for (const l of lines) {
    const { data: okStock } = await db.rpc("decrement_stock", { p_id: l.row.id, n: l.qty });
    if (!okStock) {
      for (const r of reserved) {
        const { data: cur } = await db.from("products").select("stock").eq("id", r.id).single();
        if (cur) await db.from("products").update({ stock: cur.stock + r.qty }).eq("id", r.id);
      }
      throw new OrderError(409, `${l.p.name} just sold out.`);
    }
    reserved.push({ id: l.row.id, qty: l.qty });
  }

  let id = newOrderId();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error: insErr } = await db.from("orders").insert({
      id,
      user_id: viewer?.id ?? null,
      email: input.email.toLowerCase(),
      status: "placed",
      subtotal,
      shipping,
      total,
      billing: input.billing,
      ffl_dealer_id: ffl?.id ?? null,
      ffl_snapshot: ffl ? { name: ffl.name, address: ffl.address } : null,
      payment_method: input.payment,
      delivery: input.delivery,
      attested_at: new Date().toISOString(),
    });
    if (!insErr) break;
    if (insErr.code !== "23505" || attempt === 4) throw insErr;
    id = newOrderId();
  }

  const { error: itemErr } = await db.from("order_items").insert(
    lines.map((l) => ({
      order_id: id,
      product_id: l.row.id,
      slug: l.p.slug,
      name: l.p.name,
      image: l.p.image,
      ffl: !!l.p.ffl,
      qty: l.qty,
      rounds: l.rounds ?? null,
      unit_price: l.unit,
    }))
  );
  if (itemErr) throw itemErr;
  await db.from("order_events").insert({ order_id: id, status: "placed" });

  const order = await getOrderById(id);
  if (!order) throw new Error("Order was written but could not be read back.");
  return order;
}

export async function getOrderById(id: string): Promise<(Order & { userId: string | null }) | null> {
  const { data, error } = await serviceClient().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...rowToOrder(data as OrderRow), userId: (data as OrderRow).user_id };
}

export async function listOrdersForUser(userId: string) {
  const { data, error } = await serviceClient()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as OrderRow[]).map(rowToOrder);
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function listOrdersAdmin(opts: { status?: OrderStatus; q?: string; limit?: number }) {
  let query = serviceClient()
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.status) query = query.eq("status", opts.status);
  // Strip PostgREST filter syntax before interpolating into .or().
  const q = opts.q?.replace(/[^a-zA-Z0-9@._-]/g, "");
  if (q) query = query.or(`id.ilike.%${q}%,email.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data as OrderRow[]).map(rowToOrder);
}

export const orderUpdate = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  carrier: z.string().trim().max(60).nullable().optional(),
  tracking: z.string().trim().max(80).nullable().optional(),
  note: z.string().trim().max(500).optional(),
});

export async function updateOrderAdmin(id: string, patch: z.infer<typeof orderUpdate>) {
  const db = serviceClient();
  const current = await getOrderById(id);
  if (!current) return null;
  const fields: Record<string, unknown> = {};
  if (patch.status) fields.status = patch.status;
  if (patch.carrier !== undefined) fields.carrier = patch.carrier;
  if (patch.tracking !== undefined) fields.tracking = patch.tracking;
  if (Object.keys(fields).length) {
    const { error } = await db.from("orders").update(fields).eq("id", id);
    if (error) throw error;
  }
  if (patch.status && patch.status !== current.status) {
    await db.from("order_events").insert({ order_id: id, status: patch.status, note: patch.note ?? null });
  }
  return getOrderById(id);
}
