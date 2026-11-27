import { cookies } from "next/headers";
import { z } from "zod";
import { body, fail, isResponse } from "@/lib/api";
import { OWNER_COOKIE, checkOwnerCredentials, createOwnerSession, ownerConfigured, ownerCookieOptions } from "@/lib/owner-auth";

const input = z.object({ email: z.string().trim().max(200), password: z.string().min(1).max(200) });

// Best-effort brute-force brake: 5 failed tries per IP per 15 minutes (per server
// instance). The real protection is the slow PBKDF2 hash plus a strong password.
const WINDOW = 15 * 60_000;
const MAX_FAILS = 5;
const fails = new Map<string, { n: number; until: number }>();

const clientIp = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
const secure = (req: Request) => new URL(req.url).protocol === "https:" || process.env.NODE_ENV === "production";

/** POST /api/auth/owner — owner sign-in for /admin. Sets a signed, HttpOnly session cookie. */
export async function POST(req: Request) {
  if (!ownerConfigured()) return fail(503, "Owner sign-in isn't configured. Set ADMIN_LOGIN_EMAIL, ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET.");
  const ip = clientIp(req);
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && rec.until > now && rec.n >= MAX_FAILS) return fail(429, "Too many attempts. Try again in 15 minutes.");

  const data = await body(req, input);
  if (isResponse(data)) return data;

  if (!(await checkOwnerCredentials(data.email, data.password))) {
    const next = rec && rec.until > now ? { n: rec.n + 1, until: rec.until } : { n: 1, until: now + WINDOW };
    fails.set(ip, next);
    await new Promise((r) => setTimeout(r, 600));
    return fail(401, "Wrong email or password.");
  }

  fails.delete(ip);
  (await cookies()).set(OWNER_COOKIE, await createOwnerSession(), ownerCookieOptions(secure(req)));
  return Response.json({ ok: true });
}

/** DELETE /api/auth/owner — sign out of the back office. */
export async function DELETE(req: Request) {
  (await cookies()).set(OWNER_COOKIE, "", { ...ownerCookieOptions(secure(req)), maxAge: 0 });
  return Response.json({ ok: true });
}
