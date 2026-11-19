import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/clients";
import { demoDealers, type Dealer } from "@/lib/catalog";

export const DEALERS_TAG = "dealers";

export type DealerRow = {
  id: string;
  name: string;
  license_no: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  email: string | null;
  transfer_fee: number | string | null;
  active: boolean;
};

export function rowToDealer(r: DealerRow): Dealer {
  return {
    id: r.id,
    name: r.name,
    licenseNo: r.license_no,
    address: r.address,
    city: r.city,
    state: r.state,
    zip: r.zip,
    phone: r.phone,
    email: r.email,
    transferFee: r.transfer_fee === null ? null : Number(r.transfer_fee),
    active: r.active,
  };
}

/** Active dealers, cached. Falls back to the sample dealers. */
export async function getDealers(): Promise<Dealer[]> {
  "use cache";
  cacheTag(DEALERS_TAG);
  cacheLife("minutes");
  if (!hasSupabase) return demoDealers;
  try {
    const { data, error } = await publicClient().from("ffl_dealers").select("*").eq("active", true).order("name");
    if (error) throw error;
    return (data as DealerRow[]).map(rowToDealer);
  } catch (e) {
    console.error("[dealers] Supabase read failed; serving sample dealers.", e);
    return demoDealers;
  }
}

/** Dealers ordered by ZIP proximity (shared leading digits) — replace with a geo lookup later. */
export async function findDealers(zip?: string) {
  const list = await getDealers();
  if (!zip) return list;
  const score = (z: string) => {
    let i = 0;
    while (i < Math.min(z.length, zip.length) && z[i] === zip[i]) i++;
    return i;
  };
  return [...list].sort((a, b) => score(b.zip) - score(a.zip));
}
