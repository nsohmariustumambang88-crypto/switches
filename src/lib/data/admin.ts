import { z } from "zod";
import { revalidateTag } from "next/cache";
import { serviceClient } from "@/lib/supabase/clients";
import { CATALOG_TAG, PRODUCT_SELECT, rowToProduct, type ProductRow } from "@/lib/data/catalog";
import { DEALERS_TAG, rowToDealer, type DealerRow } from "@/lib/data/dealers";
import { SETTINGS_TAG, type StoreSettings } from "@/lib/data/settings";
import { ORDER_STATUSES } from "@/lib/data/orders";

const expireNow = { expire: 0 };

// ── Products ────────────────────────────────────────────────────────────

export const productInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes."),
  name: z.string().trim().min(2),
  brand: z.string().trim().min(1),
  category: z.enum(["handguns", "ammunition", "triggers", "parts"]),
  type: z.string().trim().min(1),
  caliber: z.string().trim().nullable().optional(),
  price: z.number().nonnegative(),
  compareAt: z.number().nonnegative().nullable().optional(),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().int().min(0).default(0),
  image: z.string().trim().min(1),
  photo: z.enum(["light", "scene"]).nullable().optional(),
  figureLabel: z.string().trim().default(""),
  figureValue: z.string().trim().default(""),
  strip: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().default(""),
  specs: z.array(z.tuple([z.string(), z.string()])).default([]),
  ffl: z.boolean().default(false),
  notice: z.string().trim().nullable().optional(),
  trending: z.boolean().default(false),
  active: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),
  packs: z.array(z.object({ rounds: z.number().int().positive(), price: z.number().nonnegative() })).default([]),
});
export type ProductInput = z.infer<typeof productInput>;

function toRow(p: ProductInput) {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category_id: p.category,
    type: p.type,
    caliber: p.caliber || null,
    price: p.packs.length ? Math.min(...p.packs.map((k) => k.price)) : p.price,
    compare_at: p.compareAt ?? null,
    rating: p.rating,
    reviews: p.reviews,
    image: p.image,
    photo: p.photo ?? null,
    figure_label: p.figureLabel,
    figure_value: p.figureValue,
    strip: p.strip,
    description: p.description,
    specs: p.specs,
    ffl: p.ffl,
    notice: p.notice || null,
    trending: p.trending,
    active: p.active,
    stock: p.stock,
  };
}

async function writePacks(productId: string, packs: ProductInput["packs"]) {
  const db = serviceClient();
  await db.from("product_packs").delete().eq("product_id", productId);
  if (packs.length) {
    const { error } = await db.from("product_packs").insert(packs.map((k) => ({ product_id: productId, ...k })));
    if (error) throw error;
  }
}

export async function listProductsAdmin() {
  const { data, error } = await serviceClient().from("products").select(PRODUCT_SELECT).order("sort").order("created_at");
  if (error) throw error;
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductAdmin(id: string) {
  const { data, error } = await serviceClient().from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduct(data as ProductRow) : null;
}

export async function createProduct(p: ProductInput) {
  const { data, error } = await serviceClient().from("products").insert(toRow(p)).select("id").single();
  if (error) throw error;
  await writePacks(data.id, p.packs);
  revalidateTag(CATALOG_TAG, expireNow);
  return getProductAdmin(data.id);
}

export async function updateProduct(id: string, p: ProductInput) {
  const { error } = await serviceClient().from("products").update(toRow(p)).eq("id", id);
  if (error) throw error;
  await writePacks(id, p.packs);
  revalidateTag(CATALOG_TAG, expireNow);
  return getProductAdmin(id);
}

export async function deleteProduct(id: string) {
  const { error } = await serviceClient().from("products").delete().eq("id", id);
  if (error) throw error;
  revalidateTag(CATALOG_TAG, expireNow);
}

// ── FFL dealers ─────────────────────────────────────────────────────────

export const dealerInput = z.object({
  name: z.string().trim().min(2),
  licenseNo: z.string().trim().nullable().optional(),
  address: z.string().trim().min(2),
  city: z.string().trim().min(1),
  state: z.string().trim().length(2).transform((s) => s.toUpperCase()),
  zip: z.string().trim().min(5).max(10),
  phone: z.string().trim().nullable().optional(),
  email: z.union([z.email(), z.literal("")]).nullable().optional(),
  transferFee: z.number().nonnegative().nullable().optional(),
  active: z.boolean().default(true),
});

const dealerRow = (d: z.infer<typeof dealerInput>) => ({
  name: d.name,
  license_no: d.licenseNo || null,
  address: d.address,
  city: d.city,
  state: d.state,
  zip: d.zip,
  phone: d.phone || null,
  email: d.email || null,
  transfer_fee: d.transferFee ?? null,
  active: d.active,
});

export async function listDealersAdmin() {
  const { data, error } = await serviceClient().from("ffl_dealers").select("*").order("name");
  if (error) throw error;
  return (data as DealerRow[]).map(rowToDealer);
}

export async function createDealer(d: z.infer<typeof dealerInput>) {
  const { data, error } = await serviceClient().from("ffl_dealers").insert(dealerRow(d)).select("*").single();
  if (error) throw error;
  revalidateTag(DEALERS_TAG, expireNow);
  return rowToDealer(data as DealerRow);
}

export async function updateDealer(id: string, d: z.infer<typeof dealerInput>) {
  const { data, error } = await serviceClient().from("ffl_dealers").update(dealerRow(d)).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  revalidateTag(DEALERS_TAG, expireNow);
  return data ? rowToDealer(data as DealerRow) : null;
}

export async function deleteDealer(id: string) {
  const { error } = await serviceClient().from("ffl_dealers").delete().eq("id", id);
  if (error) throw error;
  revalidateTag(DEALERS_TAG, expireNow);
}

// ── Customers ───────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: "customer" | "admin";
  joined: string;
  orders: number;
  spent: number;
};

export async function listCustomers(): Promise<Customer[]> {
  const db = serviceClient();
  const [{ data: profiles, error }, { data: orders }] = await Promise.all([
    db.from("profiles").select("*").order("created_at", { ascending: false }),
    db.from("orders").select("user_id, total, status"),
  ]);
  if (error) throw error;
  return (profiles ?? []).map((p) => {
    const mine = (orders ?? []).filter((o) => o.user_id === p.id && o.status !== "cancelled");
    return {
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      role: p.role,
      joined: p.created_at,
      orders: mine.length,
      spent: mine.reduce((n, o) => n + Number(o.total), 0),
    };
  });
}

export const roleInput = z.object({ role: z.enum(["customer", "admin"]) });

export async function setRole(id: string, role: "customer" | "admin") {
  const { error } = await serviceClient().from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

// ── Dashboard ───────────────────────────────────────────────────────────

export type Stats = {
  ordersToday: number;
  revenue30d: number;
  byStatus: Record<(typeof ORDER_STATUSES)[number], number>;
  products: number;
  lowStock: { id?: string; slug: string; name: string; stock: number }[];
  customers: number;
};

export async function getStats(): Promise<Stats> {
  const db = serviceClient();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const [{ data: orders }, { data: prods }, { count: customers }] = await Promise.all([
    db.from("orders").select("status, total, created_at").gte("created_at", since),
    db.from("products").select("id, slug, name, stock, active"),
    db.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Stats["byStatus"];
  for (const o of orders ?? []) byStatus[o.status as keyof Stats["byStatus"]]++;
  return {
    ordersToday: (orders ?? []).filter((o) => o.created_at >= today.toISOString()).length,
    revenue30d: (orders ?? []).filter((o) => o.status !== "cancelled").reduce((n, o) => n + Number(o.total), 0),
    byStatus,
    products: (prods ?? []).filter((p) => p.active).length,
    lowStock: (prods ?? [])
      .filter((p) => p.active && p.stock < 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8)
      .map((p) => ({ id: p.id, slug: p.slug, name: p.name, stock: p.stock })),
    customers: customers ?? 0,
  };
}

// ── Settings ────────────────────────────────────────────────────────────

export const settingsInput = z.object({
  store: z.object({
    name: z.string().trim().min(1),
    tagline: z.string().trim(),
    supportEmail: z.string().trim(),
    supportPhone: z.string().trim(),
  }),
  shipping: z.object({ freeOver: z.number().nonnegative(), flat: z.number().nonnegative() }),
  preview: z.object({ enabled: z.boolean() }),
});

export async function saveSettings(s: StoreSettings) {
  const rows = Object.entries(s).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString() }));
  const { error } = await serviceClient().from("settings").upsert(rows);
  if (error) throw error;
  revalidateTag(SETTINGS_TAG, expireNow);
}
