"use client";

/**
 * next/image loader.
 * - "/catalog/…" paths map to Cloudinary public ids under NEXT_PUBLIC_CLOUDINARY_FOLDER
 *   (uploaded by `npm run cloudinary:upload`).
 * - Bare ids ("storefront/uploads/abc") are Cloudinary public ids from the admin media library.
 * - Full URLs pass through.
 * Without a cloud name configured, local files in /public are served as-is.
 */
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "storefront";

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (/^https?:\/\//.test(src)) return src;
  if (!cloud) return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  const id = src.startsWith("/") ? `${folder}${src.replace(/\.[a-z0-9]+$/i, "")}` : src;
  const q = quality ? String(quality) : "auto";
  return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_${q},c_limit,w_${width}/${id}`;
}
