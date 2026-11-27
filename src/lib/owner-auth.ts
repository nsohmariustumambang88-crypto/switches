/**
 * Owner login for the back office — works with or without Supabase.
 *
 * Credentials live only in environment variables (never in the repo):
 *   ADMIN_LOGIN_EMAIL     the owner's email
 *   ADMIN_PASSWORD_HASH   pbkdf2-sha256:<iterations>:<salt>:<hash>  (npm run admin:hash)
 *                         (":" separators: .env files expand "$", which would mangle it)
 *   ADMIN_SESSION_SECRET  32+ random characters used to sign the session cookie
 *
 * The session is a signed, HttpOnly cookie (HMAC-SHA256) that expires after
 * SESSION_HOURS. Web Crypto only, so the proxy and route handlers share it.
 */

export const OWNER_COOKIE = "owner_session";
export const SESSION_HOURS = 12;

const enc = new TextEncoder();

const b64u = (bytes: Uint8Array) => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64u = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** Length-independent comparison of two byte arrays. */
function sameBytes(a: Uint8Array, b: Uint8Array) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

const ownerEmail = () => (process.env.ADMIN_LOGIN_EMAIL ?? "").trim().toLowerCase();
const sessionSecret = () => process.env.ADMIN_SESSION_SECRET ?? "";

export function ownerConfigured() {
  return Boolean(ownerEmail() && process.env.ADMIN_PASSWORD_HASH && sessionSecret().length >= 32);
}

async function hmacKey() {
  return crypto.subtle.importKey("raw", enc.encode(sessionSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, key, 256);
  return new Uint8Array(bits);
}

/** Builds the ADMIN_PASSWORD_HASH value for a password (used by scripts/admin-hash.mjs). */
export async function hashPassword(password: string, iterations = 310_000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2-sha256:${iterations}:${b64u(salt)}:${b64u(await pbkdf2(password, salt, iterations))}`;
}

/** True only for the configured owner email + password. Always runs the hash, so timing doesn't leak which part failed. */
export async function checkOwnerCredentials(email: string, password: string) {
  if (!ownerConfigured()) return false;
  const [scheme, iter, salt, hash] = (process.env.ADMIN_PASSWORD_HASH ?? "").split(":");
  const iterations = Number(iter);
  if (scheme !== "pbkdf2-sha256" || !Number.isInteger(iterations) || iterations < 100_000 || !salt || !hash) return false;
  const derived = await pbkdf2(password, fromB64u(salt), iterations);
  const passwordOk = sameBytes(derived, fromB64u(hash));
  const emailOk = sameBytes(enc.encode(email.trim().toLowerCase()), enc.encode(ownerEmail()));
  return passwordOk && emailOk;
}

/** Signed session token: base64url(payload).base64url(hmac). */
export async function createOwnerSession() {
  const payload = b64u(enc.encode(JSON.stringify({ e: ownerEmail(), exp: Date.now() + SESSION_HOURS * 3600_000 })));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(payload)));
  return `${payload}.${b64u(sig)}`;
}

/** The owner's email if the token is genuine, unexpired and for the current owner; otherwise null. */
export async function readOwnerSession(token?: string | null): Promise<{ email: string } | null> {
  if (!token || !ownerConfigured()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await hmacKey(), fromB64u(sig) as BufferSource, enc.encode(payload));
    if (!valid) return null;
    const { e, exp } = JSON.parse(new TextDecoder().decode(fromB64u(payload))) as { e: string; exp: number };
    if (typeof exp !== "number" || exp < Date.now() || e !== ownerEmail()) return null;
    return { email: e };
  } catch {
    return null;
  }
}

export const ownerCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_HOURS * 3600,
});
