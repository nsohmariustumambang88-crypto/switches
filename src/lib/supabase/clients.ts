import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabase, serviceKey, supabaseAnonKey, supabaseUrl } from "./config";

/** Anonymous, cookie-less client for public catalog reads (safe inside "use cache"). */
export function publicClient() {
  if (!hasSupabase) throw new Error("Supabase is not configured");
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cookie-aware client for the signed-in visitor (route handlers, server components). */
export async function sessionClient() {
  if (!hasSupabase) throw new Error("Supabase is not configured");
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component: cookies are read-only there; the proxy refreshes them.
        }
      },
    },
  });
}

/** Service-role client. Server only — call after verifying the caller. */
export function serviceClient() {
  const key = serviceKey();
  if (!hasSupabase || !key) throw new Error("Supabase service role key is not configured");
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
