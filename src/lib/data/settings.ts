import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/clients";
import { site } from "@/config/site";

export const SETTINGS_TAG = "settings";

export type StoreSettings = {
  store: { name: string; tagline: string; supportEmail: string; supportPhone: string };
  shipping: { freeOver: number; flat: number };
  preview: { enabled: boolean };
};

export const defaultSettings: StoreSettings = {
  store: {
    name: site.name,
    tagline: site.tagline,
    supportEmail: site.supportEmail,
    supportPhone: site.supportPhone,
  },
  shipping: { freeOver: 199, flat: 14.95 },
  preview: { enabled: site.preview },
};

export async function getSettings(): Promise<StoreSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max"); // invalidated on admin writes via revalidateTag
  if (!hasSupabase) return defaultSettings;
  try {
    const { data, error } = await publicClient().from("settings").select("key, value");
    if (error) throw error;
    const merged = { ...defaultSettings } as Record<string, unknown>;
    for (const row of data ?? []) {
      if (row.key in merged) {
        merged[row.key] = { ...(merged[row.key] as object), ...(row.value as object) };
      }
    }
    return merged as StoreSettings;
  } catch (e) {
    console.error("[settings] Supabase read failed; using defaults.", e);
    return defaultSettings;
  }
}

export function shippingFor(subtotal: number, s: StoreSettings["shipping"]) {
  return subtotal === 0 || subtotal >= s.freeOver ? 0 : s.flat;
}
