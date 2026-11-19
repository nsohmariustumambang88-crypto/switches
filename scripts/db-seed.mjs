// Seeds categories, products, packs, sample FFL dealers and settings from
// src/lib/catalog.ts (Node strips the TypeScript types). Idempotent (upserts).
// Usage: npm run db:seed
import postgres from "postgres";
import { categories, products } from "../src/lib/catalog.ts";

process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL is empty in .env.local.");
  process.exit(1);
}
const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });

// PLACEHOLDER dealers — replace from the admin (Admin → FFL dealers).
const dealers = [
  { name: "Demo Dealer — Range & Supply", address: "100 Sample Ave", city: "Austin", state: "TX", zip: "78701" },
  { name: "Demo Dealer — Gunsmith Co.", address: "220 Example St", city: "Round Rock", state: "TX", zip: "78664" },
  { name: "Demo Dealer — Outdoor Outfitters", address: "48 Placeholder Rd", city: "Cedar Park", state: "TX", zip: "78613" },
];

const settings = {
  store: { name: "CALIBER", tagline: "Licensed firearms, ammunition & parts", supportEmail: "support@example.com", supportPhone: "(000) 000-0000" },
  shipping: { freeOver: 199, flat: 14.95 },
  preview: { enabled: true },
};

try {
  await sql.begin(async (tx) => {
    for (const [i, c] of categories.entries()) {
      await tx`insert into public.categories (id, name, short, blurb, sort)
               values (${c.id}, ${c.name}, ${c.short}, ${c.blurb}, ${i})
               on conflict (id) do update set name = excluded.name, short = excluded.short, blurb = excluded.blurb, sort = excluded.sort`;
      for (const [j, t] of c.types.entries()) {
        await tx`insert into public.category_types (category_id, id, name, sort)
                 values (${c.id}, ${t.id}, ${t.name}, ${j})
                 on conflict (category_id, id) do update set name = excluded.name, sort = excluded.sort`;
      }
    }

    for (const [i, p] of products.entries()) {
      const [row] = await tx`
        insert into public.products
          (slug, name, brand, category_id, type, caliber, price, compare_at, rating, reviews, image, photo,
           figure_label, figure_value, strip, description, specs, ffl, notice, trending, active, stock, sort)
        values
          (${p.slug}, ${p.name}, ${p.brand}, ${p.category}, ${p.type}, ${p.caliber ?? null}, ${p.price},
           ${p.compareAt ?? null}, ${p.rating}, ${p.reviews}, ${p.image}, ${p.photo ?? null},
           ${p.figure.label}, ${p.figure.value}, ${p.strip}, ${p.description}, ${tx.json(p.specs)},
           ${!!p.ffl}, ${p.notice ?? null}, ${!!p.trending}, true, 25, ${i})
        on conflict (slug) do update set
          name = excluded.name, brand = excluded.brand, category_id = excluded.category_id, type = excluded.type,
          caliber = excluded.caliber, image = excluded.image, photo = excluded.photo,
          figure_label = excluded.figure_label, figure_value = excluded.figure_value, strip = excluded.strip,
          description = excluded.description, specs = excluded.specs, ffl = excluded.ffl, notice = excluded.notice
        returning id`;
      await tx`delete from public.product_packs where product_id = ${row.id}`;
      for (const k of p.packs ?? []) {
        await tx`insert into public.product_packs (product_id, rounds, price) values (${row.id}, ${k.rounds}, ${k.price})`;
      }
    }

    const [{ count }] = await tx`select count(*)::int as count from public.ffl_dealers`;
    if (count === 0) {
      for (const d of dealers) {
        await tx`insert into public.ffl_dealers (name, address, city, state, zip) values (${d.name}, ${d.address}, ${d.city}, ${d.state}, ${d.zip})`;
      }
    }

    for (const [key, value] of Object.entries(settings)) {
      await tx`insert into public.settings (key, value) values (${key}, ${tx.json(value)}) on conflict (key) do nothing`;
    }
  });
  console.log(`seeded ${categories.length} categories, ${products.length} products, dealers and settings`);
} catch (e) {
  console.error("seed failed:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
