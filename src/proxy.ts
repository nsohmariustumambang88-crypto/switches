import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/supabase/config";
import { OWNER_COOKIE, readOwnerSession } from "@/lib/owner-auth";

/**
 * Locks the back office. Runs on /admin/* and /api/admin/* only and makes no
 * network calls. A visitor gets through with either:
 *  - a valid owner session (signed cookie from /admin-login), or
 *  - a Supabase session cookie, when Supabase is connected; the admin role is
 *    then verified in every /api/admin/* handler.
 * Everyone else is sent to /admin-login (pages) or gets a 401 (API).
 */
export async function proxy(request: NextRequest) {
  if (await readOwnerSession(request.cookies.get(OWNER_COOKIE)?.value)) return NextResponse.next();
  if (hasSupabase && request.cookies.getAll().some((c) => /^sb-.+-auth-token/.test(c.name))) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sign in to the back office." }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin-login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
