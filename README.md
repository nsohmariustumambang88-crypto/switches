# Storefront and admin

Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · shadcn/ui (Base UI) · GSAP 3 · Zustand · Supabase (Postgres + Auth) · Cloudinary.

A mobile-first storefront and admin backend for a licensed firearms retailer. The catalog is legal products only: handguns (shipped to an FFL), ammunition, FRT triggers, and parts & accessories.

[ROUTES.md](ROUTES.md) maps every page, API route, server function and table.

## Run

```bash
npm install
cp .env.example .env.local   # then fill in the keys (see below)
npm run dev          # http://localhost:3000   (admin: /admin)
npm run build && npm start
```

### What git tracks

Only source code, config, migrations, scripts and docs are tracked. These are deliberately ignored:

- `.env.local`: secrets. `.env.example` is the template.
- `public/catalog/`: product images. They're served from Cloudinary.
- `.impeccable/`: design-review screenshots.
- `node_modules/` and `.next/`.

Images on a fresh clone load from Cloudinary once `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set. To re-upload, place the originals in `public/catalog/<department>/` and run `npm run cloudinary:upload`.

Without Supabase keys the app runs in **demo mode**:

- The storefront serves the built-in catalog.
- Checkout saves orders in the browser only.
- `/admin` is read-only and shows sample data.

## Connect Supabase (new project)

1. Create a new project at supabase.com for this store.
2. Fill in `.env.local` (copy it from `.env.example` first):
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Settings → API.
   - `SUPABASE_SERVICE_ROLE_KEY`: Settings → API. It's secret and used on the server only.
   - `SUPABASE_DB_URL`: Settings → Database → Connection string → URI (session pooler). Used only by the scripts.
   - `ADMIN_EMAILS`: your email. Matching accounts become admins when they sign up or sign in.
3. Create the schema and seed the catalog:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Restart `npm run dev`. Create an account at `/welcome` with an `ADMIN_EMAILS` address, then open `/admin`. To promote someone else, run `npm run db:make-admin -- them@example.com`.
5. Optional: in Supabase Auth settings, choose whether new accounts must confirm their email.

## Cloudinary

The account is whichever one `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env.local` names. Everything goes in the `storefront/` folder.

- The keys go in `.env.local`. They're never committed.
- The catalog images are already uploaded to `storefront/catalog/…`. Re-run `npm run cloudinary:upload` after changing files in `public/catalog` (a local-only folder).
- Admin uploads go to `storefront/uploads/` (Admin → Media, or the product editor).
- All images go through `src/lib/image-loader.ts`, which serves Cloudinary `f_auto,q_auto` at each requested width.

## Where things live

- `src/app/(store)/`: storefront pages. `src/app/admin/`: admin pages. `src/app/api/`: route handlers.
- `src/lib/data/`: server data layer for catalog, dealers, settings, orders and admin.
- `src/lib/catalog.ts`: built-in catalog and types. It's the seed source and the demo-mode fallback.
- `src/lib/store.ts`: client cart, wishlist, local orders and product snapshots.
- `src/proxy.ts`: refreshes the Supabase session and keeps signed-out visitors out of `/admin`.
- `src/app/globals.css`: the poster design system's tokens. The full design record (DESIGN.md) is kept with the project files outside this repo.

## Placeholders to replace before launch

- **Store name:** "CALIBER" is a placeholder. Change it in Admin → Settings, plus the static copy in `src/config/site.ts`.
- **Commercial data:** prices, ratings and review counts are placeholders. Edit them in Admin → Products after seeding.
- **Product facts:** names and specs come from the supplied image filenames. The client must verify them.
- **FFL dealers:** the three seeded dealers are samples. Manage the real list in Admin → FFL dealers.
- **Payments:** no processor is connected yet, so orders are recorded without charging. PayPal and Stripe don't allow firearm sales; use a firearms-friendly processor.
- **Returns policy:** the text on the product page is a placeholder.
- **Images:** they're client-supplied retailer shots, mostly low resolution. Confirm usage rights.
