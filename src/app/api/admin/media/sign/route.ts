import { adminWrite, fail, isResponse } from "@/lib/api";
import { hasCloudinary, signUpload } from "@/lib/cloudinary";

/**
 * POST /api/admin/media/sign — signed params for a direct browser upload to
 * Cloudinary (<folder>/uploads). Admin only; the API secret never leaves the server.
 */
export async function POST() {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  if (!hasCloudinary) return fail(503, "Cloudinary is not configured.");
  return Response.json(signUpload());
}
