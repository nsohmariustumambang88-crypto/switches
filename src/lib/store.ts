"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct as builtinProduct, type Order, type Product } from "@/lib/catalog";

export type CartLine = {
  key: string;
  slug: string;
  rounds?: number;
  qty: number;
  selected: boolean;
};

export type ClientViewer = {
  id: string;
  email: string;
  fullName: string | null;
  role: "customer" | "admin";
} | null;

type State = {
  hydrated: boolean;
  /** Supabase configured on the server (from /api/auth/me). */
  backend: boolean;
  viewer: ClientViewer;
  /** True once /api/auth/me has answered (or failed). */
  viewerChecked: boolean;
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  /** Snapshots of products seen in this browser, so cart/favorites resolve
   *  products that only exist in the database. */
  known: Record<string, Product>;
  remember: (p: Product) => void;
  setViewer: (v: ClientViewer, backend: boolean) => void;
  add: (product: Product, rounds?: number, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  toggle: (key: string) => void;
  selectAll: (on: boolean) => void;
  removeSelected: () => void;
  toggleWish: (product: Product) => boolean;
  setWishlist: (slugs: string[]) => void;
  placeOrder: (order: Order) => void;
};

const keyOf = (slug: string, rounds?: number) => (rounds ? `${slug}::${rounds}` : slug);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      backend: false,
      viewer: null,
      viewerChecked: false,
      cart: [],
      wishlist: [],
      orders: [],
      known: {},
      remember: (p) => set((s) => ({ known: { ...s.known, [p.slug]: p } })),
      setViewer: (viewer, backend) => set({ viewer, backend, viewerChecked: true }),
      add: (product, rounds, qty = 1) =>
        set((s) => {
          const key = keyOf(product.slug, rounds);
          const found = s.cart.find((l) => l.key === key);
          return {
            known: { ...s.known, [product.slug]: product },
            cart: found
              ? s.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, 99) } : l))
              : [...s.cart, { key, slug: product.slug, rounds, qty, selected: true }],
          };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          cart: s.cart.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(qty, 99)) } : l)),
        })),
      remove: (key) => set((s) => ({ cart: s.cart.filter((l) => l.key !== key) })),
      toggle: (key) =>
        set((s) => ({ cart: s.cart.map((l) => (l.key === key ? { ...l, selected: !l.selected } : l)) })),
      selectAll: (on) => set((s) => ({ cart: s.cart.map((l) => ({ ...l, selected: on })) })),
      removeSelected: () => set((s) => ({ cart: s.cart.filter((l) => !l.selected) })),
      toggleWish: (product) => {
        const on = !get().wishlist.includes(product.slug);
        set((s) => ({
          known: { ...s.known, [product.slug]: product },
          wishlist: on ? [product.slug, ...s.wishlist] : s.wishlist.filter((x) => x !== product.slug),
        }));
        return on;
      },
      setWishlist: (slugs) => set({ wishlist: slugs }),
      placeOrder: (order) => set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] })),
    }),
    {
      name: "storefront",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist, orders: s.orders, known: s.known }),
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true });
      },
    }
  )
);

/* ── Lookups & derived values ───────────────────────────────────────── */

/** Product by slug: snapshot from this browser first, then the built-in catalog. */
export function lookupProduct(slug: string): Product | undefined {
  return useStore.getState().known[slug] ?? builtinProduct(slug);
}

/** Hook form of lookupProduct (re-renders when snapshots change). */
export function useProductLookup() {
  const known = useStore((s) => s.known);
  return (slug: string) => known[slug] ?? builtinProduct(slug);
}

export function linePrice(line: Pick<CartLine, "slug" | "rounds">, find: (slug: string) => Product | undefined = lookupProduct) {
  const p = find(line.slug);
  if (!p) return 0;
  if (line.rounds && p.packs) return p.packs.find((k) => k.rounds === line.rounds)?.price ?? p.price;
  return p.price;
}

export function cartCount(cart: CartLine[]) {
  return cart.reduce((n, l) => n + l.qty, 0);
}

export const SHIPPING = { freeOver: 199, flat: 14.95 }; // mirrors the default server setting

export function totals(cart: CartLine[], find: (slug: string) => Product | undefined = lookupProduct) {
  const lines = cart.filter((l) => l.selected);
  const subtotal = lines.reduce((n, l) => n + linePrice(l, find) * l.qty, 0);
  const hasFirearm = lines.some((l) => find(l.slug)?.ffl);
  const shipping = subtotal === 0 || subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.flat;
  return { lines, subtotal, shipping, total: subtotal + shipping, hasFirearm };
}
