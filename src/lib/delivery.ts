/**
 * Delivery options, shared by the browser (cart/checkout estimates) and the
 * server (authoritative price in createOrder). Prices and days are editable in
 * Admin → Settings; these defaults apply until a setting is saved.
 *
 * US-only: firearms always ship to the buyer's chosen FFL dealer (either speed);
 * ammunition, triggers, parts and accessories ship to the buyer's address where
 * state law allows. Nothing ships outside the United States.
 */

export type Delivery = "standard" | "express";

export type ShippingSettings = {
  /** Standard delivery is free at or above this subtotal. */
  freeOver: number;
  /** Standard delivery price below the free threshold. */
  flat: number;
  /** Standard delivery: arrives within this many days. */
  standardDays: number;
  /** Fast-track price (always charged; not covered by free shipping). */
  express: number;
  /** Fast-track: arrives within this many days. */
  expressDays: number;
};

export const DEFAULT_SHIPPING: ShippingSettings = { freeOver: 199, flat: 14.95, standardDays: 3, express: 29.95, expressDays: 2 };

export function shippingCost(subtotal: number, s: ShippingSettings, d: Delivery = "standard") {
  if (subtotal === 0) return 0;
  if (d === "express") return s.express;
  return subtotal >= s.freeOver ? 0 : s.flat;
}

const within = (days: number) => (days <= 1 ? "next day" : `within ${days} days`);

export function deliveryOptions(s: ShippingSettings) {
  return [
    {
      id: "standard" as const,
      name: "Standard — discreet",
      detail: `Arrives ${within(s.standardDays)} in a plain, unbranded box.`,
      price: (subtotal: number) => shippingCost(subtotal, s, "standard"),
      note: `Free over $${s.freeOver}`,
    },
    {
      id: "express" as const,
      name: "Fast-track",
      detail: `Express delivery, ${within(s.expressDays)}. Same plain packaging.`,
      price: (subtotal: number) => shippingCost(subtotal, s, "express"),
      note: undefined,
    },
  ];
}

export const deliveryName = (d?: Delivery | null) => (d === "express" ? "Fast-track" : "Standard — discreet");
