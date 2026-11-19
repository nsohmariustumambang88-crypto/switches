import { NextResponse, type NextRequest } from "next/server";
import { hasSupabase } from "@/lib/supabase/config";

/**
 * Runs on /admin only and makes no network calls: visitors without a Supabase
 * session cookie are sent to sign in. The real check (valid session + admin
 * role) happens in every /api/admin/* handler, and route handlers refresh the
 * session cookie themselves — so nothing else needs middleware.
 */
export function proxy(request: NextRequest) {
  if (!hasSupabase) return NextResponse.next(); // demo mode: read-only admin
  const hasSession = request.cookies.getAll().some((c) => /^sb-.+-auth-token/.test(c.name));
  if (hasSession) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/welcome";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
