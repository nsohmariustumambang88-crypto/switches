"use client";

import { createBrowserClient } from "@supabase/ssr";
import { hasSupabase, supabaseAnonKey, supabaseUrl } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Browser client (singleton). Null when Supabase isn't configured yet. */
export function browserClient() {
  if (!hasSupabase) return null;
  client ??= createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
