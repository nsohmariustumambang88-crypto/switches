import { cookies } from "next/headers";
import { hasSupabase, serviceKey } from "@/lib/supabase/config";
import { serviceClient, sessionClient } from "@/lib/supabase/clients";
import { OWNER_COOKIE, readOwnerSession } from "@/lib/owner-auth";

export type Viewer = {
  id: string;
  email: string;
  fullName: string | null;
  role: "customer" | "admin";
};

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** The signed-in visitor, or null. Never throws. */
export async function getViewer(): Promise<Viewer | null> {
  if (!hasSupabase) return null;
  try {
    const db = await sessionClient();
    const { data } = await db.auth.getUser();
    const user = data.user;
    if (!user) return null;
    const { data: profile } = await db
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    const email = (user.email ?? "").toLowerCase();
    const role: Viewer["role"] =
      profile?.role === "admin" || adminEmails().includes(email) ? "admin" : "customer";
    return { id: user.id, email, fullName: profile?.full_name ?? null, role };
  } catch {
    return null;
  }
}

/** Promote ADMIN_EMAILS accounts on sign-up/sign-in (needs the service role key). */
export async function syncAdminRole(userId: string, email: string) {
  if (!serviceKey() || !adminEmails().includes(email.toLowerCase())) return;
  await serviceClient().from("profiles").update({ role: "admin" }).eq("id", userId);
}

export type AdminGate =
  | { ok: true; demo: false; viewer: Viewer; via: "owner" | "supabase" }
  | { ok: true; demo: true; viewer: Viewer; via: "owner" }
  | { ok: false; status: 401 | 403; message: string };

/** The owner, when the request carries a valid owner session cookie (see lib/owner-auth.ts). */
export async function getOwner(): Promise<Viewer | null> {
  const session = await readOwnerSession((await cookies()).get(OWNER_COOKIE)?.value);
  return session ? { id: "owner", email: session.email, fullName: "Store owner", role: "admin" } : null;
}

/**
 * Admin access check for every /api/admin/* handler (the proxy is the first lock;
 * this is the second). Access needs a valid owner session, or — once Supabase is
 * connected — a Supabase account with the admin role. Without Supabase, a signed-in
 * owner sees the read-only demo data; nobody else gets in.
 */
export async function adminGate(): Promise<AdminGate> {
  const owner = await getOwner();
  if (owner) return hasSupabase ? { ok: true, demo: false, viewer: owner, via: "owner" } : { ok: true, demo: true, viewer: owner, via: "owner" };
  if (!hasSupabase) return { ok: false, status: 401, message: "Sign in to the back office." };
  const viewer = await getViewer();
  if (!viewer) return { ok: false, status: 401, message: "Sign in with an admin account." };
  if (viewer.role !== "admin") return { ok: false, status: 403, message: "This account is not an admin." };
  return { ok: true, demo: false, viewer, via: "supabase" };
}
