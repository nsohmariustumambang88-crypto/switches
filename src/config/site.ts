/**
 * Store identity. PLACEHOLDER — the client's real store name, tagline and
 * contact details have not been provided yet. Change them here only; every
 * page reads from this file.
 */
export const site = {
  name: "CALIBER",
  /** Wordmark split used by the stacked poster lockup (last line renders grey). */
  lockup: ["CALI", "BER"],
  tagline: "Licensed firearms, ammunition & parts",
  description:
    "Buy Glock and SIG Sauer handguns shipped to your local FFL, 9mm and rifle ammunition, Rare Breed forced reset triggers and parts from a licensed dealer.",
  /**
   * Public origin used for canonical URLs, the sitemap and structured data.
   * Set NEXT_PUBLIC_SITE_URL to the live domain (e.g. https://www.example.com).
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  supportEmail: "support@example.com", // PLACEHOLDER
  supportPhone: "(000) 000-0000", // PLACEHOLDER
  minimumAge: 21,
  /**
   * Preview build: prices, ratings, review counts and the shipping rule are
   * placeholders. Set to false once real catalog data is connected.
   */
  preview: true,
} as const;

/**
 * Image source for next/image. Catalog paths ("catalog/…") become "/catalog/…",
 * which the custom loader (src/lib/image-loader.ts) maps to Cloudinary
 * "storefront/catalog/…" when NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set, or serves
 * from /public otherwise. Anything else is a Cloudinary public id or a full URL.
 */
export function img(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith("catalog/") || path.startsWith("/catalog/")) return "/" + path.replace(/^\//, "");
  return path;
}
