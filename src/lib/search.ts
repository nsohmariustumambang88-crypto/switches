/**
 * Instant search: the browser fetches the static /api/search-index once and
 * ranks locally — typing never calls a function or the database.
 */

export type SearchEntry = {
  /** slug */ s: string;
  /** name */ n: string;
  /** brand */ b: string;
  /** caliber */ c: string;
  /** category id */ k: string;
  /** image path / Cloudinary id */ i: string;
  /** price (from-price for packs) */ p: number;
  /** price is a "from" price */ f: boolean;
  /** extra searchable words (spec strip, type) */ w: string;
};

let pending: Promise<SearchEntry[]> | null = null;

/** Loads the index once per page session (the response itself is CDN-cached). */
export function loadSearchIndex(): Promise<SearchEntry[]> {
  pending ??= fetch("/api/search-index")
    .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : []))
    .catch(() => {
      pending = null;
      return [];
    });
  return pending;
}

const norm = (s: string) => s.toLowerCase().replace(/[″"]/g, "").replace(/\s+/g, " ").trim();

/** All words must match; name-prefix and word-start matches rank first. */
export function rankSearch(index: SearchEntry[], query: string, limit = 6): SearchEntry[] {
  const q = norm(query);
  const words = q.split(" ").filter(Boolean);
  if (!words.length) return [];
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    const name = norm(e.n);
    const hay = `${name} ${norm(e.b)} ${norm(e.c)} ${norm(e.w)} ${e.k}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let score = 0;
    if (name.startsWith(q)) score += 6;
    if (name.includes(q)) score += 3;
    for (const w of words) {
      if (new RegExp(`(^|[\\s.-])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(name)) score += 2;
      if (norm(e.b).startsWith(w) || norm(e.c).includes(w)) score += 1;
    }
    scored.push({ e, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.e.n.length - b.e.n.length)
    .slice(0, limit)
    .map((x) => x.e);
}
