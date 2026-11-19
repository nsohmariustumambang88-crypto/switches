# Route map

How the storefront, the admin backend, the API and the database connect.

The API runs in two modes:

- **Demo mode** (Supabase not configured): reads come from the built-in catalog in `src/lib/catalog.ts`, and writes return `503 supabase_not_configured`.
- **Live mode:** everything reads from and writes to Supabase.

Images are served from Cloudinary (the account set in `.env.local`, folder `storefront/`) through the loader in `src/lib/image-loader.ts`.

---

## 1. Storefront pages — `src/app/(store)/`

| Route | File | Reads (server) | Calls (browser) |
| --- | --- | --- | --- |
| `/` | `page.tsx` + `components/home-sections.tsx` | `getProduct`, `getProducts`, `getCategories`, `getTrending` | — |
| `/welcome` | `welcome/welcome-view.tsx` | — | `POST /api/auth/sign-in`, `POST /api/auth/sign-up` (then `?next=`) |
| `/categories` | `categories/page.tsx` | built-in tile list | — |
| `/shop/[category]` (`all`, `handguns`, `ammunition`, `triggers`, `parts`) | `shop/[category]/page.tsx` → `listing.tsx` | `getCategories`, `getCategory`, `getProducts` | filtering/sorting runs client-side; search arrives as `?q=`, type chip as `?type=` |
| `/product/[slug]` | `product/[slug]/page.tsx`, `product-buy.tsx` | `getProduct`, `getCategory`, `getRelated` | `POST/DELETE /api/wishlist` (signed in, via the heart) |
| `/cart` | `cart/cart-view.tsx` | — | local store only |
| `/checkout` | `checkout/checkout-view.tsx` | — | `GET /api/ffl-dealers` (static, sorted locally), `POST /api/orders` (local fallback on 503); pre-fills from this device's last checkout |
| `/orders` | `orders/orders-view.tsx` | — | `GET /api/orders` (signed in) |
| `/orders/[id]` | `orders/[id]/track-view.tsx` | — | `GET /api/orders/:id` (signed in); "Buy again" may call `GET /api/products?slugs=` |
| `/favorites` | `favorites/favorites-view.tsx` | — | `GET /api/products?slugs=` for unseen favorites |
| `/profile` | `profile/profile-view.tsx` | — | `POST /api/auth/sign-out`; links to `/admin` for admins |

Every page runs `ViewerSync` (`components/boot.tsx`):

**Shared chrome:** `(store)/layout.tsx` contains the splash, the 21+ age gate, the desktop nav, the footer and the phone tab bar.

**Client store** (`src/lib/store.ts`, persisted to localStorage) holds the cart, wishlist, local orders, product snapshots (`known`) and the viewer.

## 2. Admin backend — `src/app/admin/`

The proxy (`src/proxy.ts`, matching `/admin/*` only, with no network calls) redirects visitors without a session cookie to `/welcome?next=/admin`. The shell (`components/admin/admin-shell.tsx`) shows a 403 page to non-admins. Every `/api/admin/*` handler re-checks the role server-side.

| Route | File | API |
| --- | --- | --- |
| `/admin` | `page.tsx` | `GET /api/admin/stats` |
| `/admin/orders` | `orders/orders-admin.tsx` | `GET /api/admin/orders?status=&q=` |
| `/admin/orders/[id]` | `orders/[id]/order-detail.tsx` | `GET`, `PATCH /api/admin/orders/:id` |
| `/admin/products` | `products/page.tsx` | `GET /api/admin/products` |
| `/admin/products/new` | `products/new/page.tsx` → `components/admin/product-form.tsx` | `POST /api/admin/products`, `POST /api/admin/media/sign` + Cloudinary upload |
| `/admin/products/[id]` | `products/[id]/edit-product.tsx` → `product-form.tsx` | `GET`, `PATCH`, `DELETE /api/admin/products/:id` |
| `/admin/customers` | `customers/page.tsx` | `GET /api/admin/customers`, `PATCH /api/admin/customers/:id` |
| `/admin/dealers` | `dealers/page.tsx` | `GET`, `POST /api/admin/dealers`, `PATCH`, `DELETE /api/admin/dealers/:id` |
| `/admin/media` | `media/page.tsx` | `GET`, `DELETE /api/admin/media`, `POST /api/admin/media/sign` |
| `/admin/settings` | `settings/page.tsx` | `GET`, `PUT /api/admin/settings` |

## 3. API — `src/app/api/`

### Public

| Method | Path | Auth | Input | Returns |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | — | — | `{ supabase, cloudinary, catalog: { source, products } }` |
| GET | `/api/categories` | — | — | `{ categories[] }` with types and counts |
| GET | `/api/products` | — | `category, type, q, brand=a,b, caliber=, min, max, sort, slugs=` | `{ count, products[] }` |
| GET | `/api/products/:slug` | — | — | `{ product, related[] }` · 404 |
| GET | `/api/ffl-dealers` | — | — | `{ sample, dealers[] }`. Static and CDN-cached; the browser sorts by ZIP with `sortDealersByZip` |
| GET | `/api/settings` | — | — | store name, contacts, shipping rule, preview flag |
| POST | `/api/orders` | optional session | `{ email, items[{slug,qty,rounds?}], billing{name,line1,city,state,zip}, fflDealerId?, payment:"card"\|"ach", attested:true }` | `201 { order }` · 400/409 with message · 503 demo |
| GET | `/api/orders` | session | — | `{ orders[] }` (own) |
| GET | `/api/orders/:id` | session (owner or admin) | — | `{ order }` · 404 |
| GET | `/api/auth/me` | — | — | `{ configured, viewer \| null }` |
| POST | `/api/auth/sign-in` | — | `{ email, password }` | `{ viewer }` · 401 |
| POST | `/api/auth/sign-up` | — | `{ fullName, email, password, ageConfirmed:true }` | `201 { needsConfirmation, viewer }` |
| POST | `/api/auth/sign-out` | — | — | `{ ok }` |
| GET | `/api/wishlist` | session | — | `{ slugs[] }` |
| POST / DELETE | `/api/wishlist` | session | `{ slug }` | `{ ok }` |

`POST /api/orders` re-checks everything on the server:

- prices and round-count packs from the database
- stock, reserved atomically with `decrement_stock`
- an active FFL dealer for any firearm
- the age attestation

No payment is captured yet.

### Admin

Admin routes need an admin session. In demo mode, GET returns sample data and writes return 503.

| Method | Path | Input | Returns |
| --- | --- | --- | --- |
| GET | `/api/admin/stats` | — | `{ stats{ordersToday, revenue30d, byStatus, products, lowStock, customers}, recent[] }` |
| GET / POST | `/api/admin/products` | POST: `productInput` (see `lib/data/admin.ts`) | `{ products[] }` / `201 { product }` |
| GET / PATCH / DELETE | `/api/admin/products/:id` | PATCH: `productInput` | `{ product }` / `{ ok }` |
| GET | `/api/admin/orders` | `status, q` | `{ orders[] }` |
| GET / PATCH | `/api/admin/orders/:id` | `{ status?, carrier?, tracking?, note? }` | `{ order }`; a status change logs an `order_events` row |
| GET | `/api/admin/customers` | — | `{ customers[] }` with orders and spend |
| PATCH | `/api/admin/customers/:id` | `{ role }` | `{ ok }` (you can't demote yourself) |
| GET / POST | `/api/admin/dealers` | POST: `dealerInput` | `{ dealers[] }` / `201 { dealer }` |
| PATCH / DELETE | `/api/admin/dealers/:id` | PATCH: `dealerInput` | `{ dealer }` / `{ ok }` |
| GET / PUT | `/api/admin/settings` | PUT: `{ store, shipping, preview }` | `{ settings }` |
| GET / DELETE | `/api/admin/media` | GET: `prefix, cursor` · DELETE: `publicId` | `{ assets[], nextCursor }` / `{ ok }` |
| POST | `/api/admin/media/sign` | — | signed params for a direct browser → Cloudinary upload into `storefront/uploads` |

Catalog, dealer and settings writes call `revalidateTag(…, { expire: 0 })`, so the storefront updates on the next request.

## 4. Server functions — `src/lib/`

| File | Functions | Used by |
| --- | --- | --- |
| `data/catalog.ts` | `getCatalog` (`"use cache"`, `cacheLife("max")`, tag `catalog`), `getCategories`, `getCategory`, `getProducts`, `getProduct`, `getTrending`, `getRelated`, `queryProducts`, `rowToProduct` | store pages, `/api/products*`, `/api/categories`, `/api/health` |
| `data/dealers.ts` | `getDealers` (cached, tag `dealers`), `findDealers(zip)`, `rowToDealer` | `/api/ffl-dealers` |
| `data/settings.ts` | `getSettings` (cached, tag `settings`), `shippingFor`, `defaultSettings` | `/api/settings`, `/api/admin/settings`, `createOrder` |
| `data/orders.ts` | `orderInput`, `createOrder`, `getOrderById`, `listOrdersForUser`, `listOrdersAdmin`, `orderUpdate`, `updateOrderAdmin`, `rowToOrder` | `/api/orders*`, `/api/admin/orders*`, `/api/admin/stats` |
| `data/admin.ts` | `productInput`, `listProductsAdmin`, `getProductAdmin`, `createProduct`, `updateProduct`, `deleteProduct`, `dealerInput`, `listDealersAdmin`, `createDealer`, `updateDealer`, `deleteDealer`, `listCustomers`, `setRole`, `getStats`, `settingsInput`, `saveSettings` | `/api/admin/*` |
| `data/demo-admin.ts` | `demoProducts`, `demoAdminOrders`, `demoAdminDealers`, `demoStats` | `/api/admin/*` in demo mode |
| `auth.ts` | `getViewer`, `syncAdminRole` (ADMIN_EMAILS), `adminGate` | auth and admin routes |
| `api.ts` | `ok`, `fail`, `notConnected`, `body(req, zod)`, `admin()`, `adminWrite()` | all route handlers |
| `cloudinary.ts` | `listMedia`, `signUpload`, `deleteMedia`, `hasCloudinary` | `/api/admin/media*`, `/api/health` |
| `supabase/clients.ts` | `publicClient` (cached reads), `sessionClient` (cookies), `serviceClient` (trusted writes) | data layer and auth |
| `supabase/browser.ts` | `browserClient` | (available for realtime/client features) |
| `image-loader.ts` | next/image loader that maps `/catalog/*` to Cloudinary `f_auto,q_auto` URLs | every `<Image>` |
| `store.ts` | `useStore` (cart, wishlist, orders, `known` snapshots, `recentViewed`, `recentSearches`, `savedCheckout`), `lookupProduct`, `useProductLookup`, `linePrice`, `totals`, `cartCount` | client components |

## 5. Database — `supabase/migrations/0001_init.sql`

| Table | Purpose | Row-level security |
| --- | --- | --- |
| `categories`, `category_types` | departments and types | public read · admin write |
| `products`, `product_packs` | catalog and ammo round-count pricing | active rows public · admin all |
| `ffl_dealers` | transfer dealers for checkout | active rows public · admin all |
| `profiles` | one per auth user, with `role` | own or admin read · admin update |
| `orders`, `order_items`, `order_events` | orders, item snapshots, status timeline | own or admin read · writes via service role |
| `wishlists` | saved products per user | own only |
| `settings` | store, shipping and preview settings | public read · admin write |

Functions:

- `is_admin()`
- `decrement_stock(id, n)` (service role only)
- `handle_new_user()`, which creates a profile on sign-up
- `touch_updated_at()`

## 6. Scripts — `package.json`

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:migrate` | applies `supabase/migrations/*.sql` using `SUPABASE_DB_URL` |
| `npm run db:seed` | upserts categories, products, packs, sample dealers and settings from `src/lib/catalog.ts` |
| `npm run db:make-admin -- you@example.com` | promotes an existing account to admin |
| `npm run cloudinary:upload` | uploads `public/catalog/**` to `storefront/catalog/` |
