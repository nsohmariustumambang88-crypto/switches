import type { NextRequest } from "next/server";
import { admin, adminWrite, fail, isResponse } from "@/lib/api";
import { deleteMedia, hasCloudinary, listMedia } from "@/lib/cloudinary";

/** GET /api/admin/media?prefix=catalog/&cursor= — Cloudinary images in the store folder. */
export async function GET(req: NextRequest) {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  if (!hasCloudinary) return fail(503, "Cloudinary is not configured.");
  const prefix = req.nextUrl.searchParams.get("prefix")?.replace(/[^a-z0-9/_-]/gi, "") ?? "";
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  try {
    return Response.json({ demo: gate.demo, ...(await listMedia({ prefix, cursor })) });
  } catch (e) {
    return fail(502, `Cloudinary: ${(e as Error).message}`);
  }
}

/** DELETE /api/admin/media?publicId=storefront/uploads/abc */
export async function DELETE(req: NextRequest) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const publicId = req.nextUrl.searchParams.get("publicId");
  if (!publicId) return fail(400, "publicId is required.");
  try {
    await deleteMedia(publicId);
    return Response.json({ ok: true });
  } catch (e) {
    return fail(400, (e as Error).message);
  }
}
