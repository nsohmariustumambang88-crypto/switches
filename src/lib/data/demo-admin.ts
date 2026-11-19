import { demoDealers, demoOrders, getProduct, products } from "@/lib/catalog";
import type { Stats } from "@/lib/data/admin";
import { ORDER_STATUSES } from "@/lib/data/orders";

/** Read-only admin data used before Supabase is connected. */
export const demoProducts = () => products.map((p) => ({ ...p, id: p.slug, active: true, stock: 25 }));

export const demoAdminOrders = () =>
  demoOrders.map((o) => {
    const items = o.items.map((i) => {
      const p = getProduct(i.slug)!;
      const unit = i.rounds ? (p.packs?.find((k) => k.rounds === i.rounds)?.price ?? p.price) : p.price;
      return { ...i, name: p.name, image: p.image, unitPrice: unit, ffl: !!p.ffl };
    });
    const subtotal = items.reduce((n, i) => n + i.unitPrice * i.qty, 0);
    return { ...o, items, email: "customer@example.com", subtotal, shipping: 0, total: subtotal, payment: "card" as const };
  });

export const demoAdminDealers = () => demoDealers.map((d) => ({ ...d, active: true }));

export function demoStats(): Stats {
  const orders = demoAdminOrders();
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Stats["byStatus"];
  for (const o of orders) byStatus[o.status]++;
  return {
    ordersToday: 0,
    revenue30d: orders.reduce((n, o) => n + o.total, 0),
    byStatus,
    products: products.length,
    lowStock: [],
    customers: 0,
  };
}
