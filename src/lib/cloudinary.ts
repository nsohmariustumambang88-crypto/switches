import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
export const mediaFolder = process.env.CLOUDINARY_FOLDER || "storefront";

export const hasCloudinary = Boolean(cloudName && apiKey && apiSecret);

function client() {
  if (!hasCloudinary) throw new Error("Cloudinary is not configured");
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return cloudinary;
}

export type MediaAsset = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: string;
};

/** Lists images under the store folder (newest first). */
export async function listMedia(opts: { prefix?: string; cursor?: string } = {}) {
  const res = await client().api.resources({
    type: "upload",
    resource_type: "image",
    prefix: `${mediaFolder}/${opts.prefix ?? ""}`,
    max_results: 100,
    next_cursor: opts.cursor,
  });
  const assets: MediaAsset[] = res.resources.map((r: Record<string, unknown>) => ({
    publicId: r.public_id as string,
    url: r.secure_url as string,
    width: r.width as number,
    height: r.height as number,
    bytes: r.bytes as number,
    format: r.format as string,
    createdAt: r.created_at as string,
  }));
  return { assets, nextCursor: (res.next_cursor as string | undefined) ?? null };
}

/** Signed params for a direct browser → Cloudinary upload into <folder>/uploads. */
export function signUpload() {
  const c = client();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: `${mediaFolder}/uploads`, tags: "storefront,admin" };
  const signature = c.utils.api_sign_request(params, apiSecret);
  return {
    ...params,
    signature,
    apiKey,
    cloudName,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

export async function deleteMedia(publicId: string) {
  if (!publicId.startsWith(`${mediaFolder}/`)) throw new Error("Outside the store folder");
  return client().uploader.destroy(publicId, { invalidate: true });
}
