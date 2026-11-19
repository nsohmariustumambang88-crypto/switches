import { hasSupabase, serviceKey } from "@/lib/supabase/config";
import { serviceClient, sessionClient } from "@/lib/supabase/clients";

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
  | { ok: true; demo: false; viewer: Viewer }
  | { ok: true; demo: true; viewer: null }
  | { ok: false; status: 401 | 403; message: string };

/**
 * Admin access check for /api/admin/*.
 * Without Supabase the admin runs in read-only demo mode on the built-in data.
 */
export async function adminGate(): Promise<AdminGate> {
  if (!hasSupabase) return { ok: true, demo: true, viewer: null };
  const viewer = await getViewer();
  if (!viewer) return { ok: false, status: 401, message: "Sign in with an admin account." };
  if (viewer.role !== "admin") return { ok: false, status: 403, message: "This account is not an admin." };
  return { ok: true, demo: false, viewer };
}
