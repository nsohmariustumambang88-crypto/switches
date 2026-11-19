export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/** True once the new Supabase project's URL + anon key are in .env.local. */
export const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

/** Server-only: service role (or new-style secret) key for trusted writes. */
export function serviceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";
}
