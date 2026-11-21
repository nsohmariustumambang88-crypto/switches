/**
 * Search-engine helpers: absolute URLs, share images, titles and schema.org
 * JSON-LD builders. Server-only data shaping — nothing here runs in the browser.
 *
 * Ratings are deliberately never emitted: the catalog's ratings are
 * placeholders, and marking up invented reviews violates Google's policies.
 * Add AggregateRating only once reviews come from verified buyers.
 */
import { site } from "@/config/site";
import type { Category, Product } from "@/lib/catalog";
import { shippingCost, type ShippingSettings } from "@/lib/delivery";

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "storefront";

export const absolute = (path = "/") => (/^https?:\/\//.test(path) ? path : `${site.url}${path.startsWith("/") ? "" : "/"}${path}`);

/** Cloudinary public id for a catalog path or stored id (null for full URLs). */
function cloudId(image: string) {
  if (/^https?:\/\//.test(image)) return null;
  const p = image.replace(/^\//, "");
  return p.startsWith("catalog/") ? `${folder}/${p.replace(/\.[a-z0-9]+$/i, "")}` : p;
}

/**
 * Absolute image URL. `og` pads the shot onto the poster grey at 1200×630
 * (the size social cards and Google Discover prefer) as a JPEG.
 */
export function imageUrl(image: string, opts: { width?: number; og?: boolean } = {}) {
  if (/^https?:\/\//.test(image)) return image;
  const id = cloudId(image);
  if (!cloud || !id) return absolute(`/${image.replace(/^\//, "")}`);
  const t = opts.og ? "c_pad,b_rgb:cacac7,w_1200,h_630,f_jpg,q_auto" : `c_limit,w_${opts.width ?? 1200},f_jpg,q_auto`;
  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${id}`;
}

const TYPE_WORD: Record<string, string> = {
  handguns: "Pistol",
  ammunition: "Ammo",
  triggers: "Trigger",
  parts: "",
};

/** Search title (store name is appended by the root layout template). */
export function productTitle(p: Product) {
  if (p.metaTitle) return p.metaTitle;
  const cal = p.caliber && !p.name.toLowerCase().includes(p.caliber.toLowerCase()) ? ` ${p.caliber}` : "";
  const word = TYPE_WORD[p.category];
  const t = `${p.name}${cal}${word && !p.name.toLowerCase().includes(word.toLowerCase()) ? ` ${word}` : ""}`;
  // Budget 50 characters: the layout appends " — <store name>" (about 10 more).
  return t.length > 50 ? p.name : t;
}

export const clip = (s: string, n = 155) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).replace(/[\s,;:.–—-]+\S*$/, "") + "…" : t;
};

export const productDescription = (p: Product) => clip(p.summary || p.description);

export function productAlt(p: Product) {
  if (p.imageAlt) return p.imageAlt;
  const cal = p.caliber && !p.name.includes(p.caliber) ? ` ${p.caliber}` : "";
  const what =
    p.category === "handguns" ? "pistol" : p.category === "ammunition" ? "ammunition box" : p.category === "triggers" ? "AR-15 trigger" : "";
  return `${p.name}${cal}${what ? ` ${what}` : ""}`.trim();
}

/* ── JSON-LD ─────────────────────────────────────────────────────────── */

type Json = Record<string, unknown>;

export const ORG_ID = `${site.url}/#organization`;
export const SITE_ID = `${site.url}/#website`;

export function organizationLd(): Json {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: absolute("/"),
    description: site.description,
  };
}

export function websiteLd(): Json {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name: site.name,
    url: absolute("/"),
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  };
}

const money = (n: number) => n.toFixed(2);

/**
 * OfferShippingDetails for the two delivery options (US only). Firearms list
 * the same rates: they ship to the buyer's FFL dealer rather than a home address.
 */
function shippingDetailsLd(price: number, s: ShippingSettings): Json[] {
  const destination = { "@type": "DefinedRegion", addressCountry: "US" };
  const time = (max: number) => ({
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: Math.max(1, max - 1), unitCode: "DAY" },
  });
  return [
    {
      "@type": "OfferShippingDetails",
      name: "Standard — discreet",
      shippingDestination: destination,
      shippingRate: { "@type": "MonetaryAmount", value: money(shippingCost(price, s, "standard")), currency: "USD" },
      deliveryTime: time(s.standardDays),
    },
    {
      "@type": "OfferShippingDetails",
      name: "Fast-track",
      shippingDestination: destination,
      shippingRate: { "@type": "MonetaryAmount", value: money(shippingCost(price, s, "express")), currency: "USD" },
      deliveryTime: time(s.expressDays),
    },
  ];
}

export function productLd(p: Product, cat?: Category, shipping?: ShippingSettings): Json {
  const url = absolute(`/product/${p.slug}`);
  const inStock = p.stock === undefined || p.stock > 0;
  const availability = `https://schema.org/${inStock ? "InStock" : "OutOfStock"}`;
  const seller = { "@id": ORG_ID };
  const shippingDetails = shipping ? { shippingDetails: shippingDetailsLd(p.price, shipping) } : {};
  const offers: Json =
    p.packs && p.packs.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          lowPrice: money(Math.min(...p.packs.map((k) => k.price))),
          highPrice: money(Math.max(...p.packs.map((k) => k.price))),
          offerCount: p.packs.length,
          availability,
          url,
          seller,
          ...shippingDetails,
        }
      : {
          "@type": "Offer",
          priceCurrency: "USD",
          price: money(p.price),
          availability,
          itemCondition: "https://schema.org/NewCondition",
          url,
          seller,
          ...shippingDetails,
        };
  return {
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.summary || p.description,
    image: [imageUrl(p.image, { width: 1200 })],
    sku: p.mpn || p.slug,
    ...(p.mpn ? { mpn: p.mpn } : {}),
    ...(p.gtin ? { gtin: p.gtin } : {}),
    brand: { "@type": "Brand", name: p.brand },
    category: cat?.name,
    url,
    additionalProperty: p.specs
      .filter(([k]) => !/^transfer$/i.test(k))
      .slice(0, 12)
      .map(([name, value]) => ({ "@type": "PropertyValue", name, value })),
    offers,
  };
}

export function itemListLd(products: Product[], name: string): Json {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absolute(`/product/${p.slug}`),
      name: p.name,
    })),
  };
}

/** One <script type="application/ld+json"> with an @graph; `<` escaped per the Next.js guide. */
export function ldScript(nodes: Json[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
