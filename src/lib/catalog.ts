/**
 * Catalog data.
 *
 * PLACEHOLDER DATA — prices, compare-at prices, ratings and review counts are
 * demonstration values, not the client's. Product names and specs were taken
 * from the supplied image filenames and manufacturer naming; the client must
 * verify every spec before launch. Replace this module with a Supabase query
 * when the backend is wired; the exported helpers keep the same shape.
 *
 * Scope: legal products only. No machine-gun conversion devices.
 */

export type CategoryId = "handguns" | "ammunition" | "triggers" | "parts";

export type Category = {
  id: CategoryId;
  name: string;
  short: string;
  blurb: string;
  types: { id: string; name: string }[];
  /** Search title (≤ 50 chars; the layout appends the store name). */
  metaTitle?: string;
  /** Search snippet (≤ 155 chars). */
  metaDescription?: string;
  /** Visible buying-guide intro under the listing (crawlable copy). */
  intro?: string;
};

export type Pack = { rounds: number; price: number };

export type Product = {
  /** Database id (present when loaded from Supabase). */
  id?: string;
  /** Admin-only fields (present when loaded from Supabase). */
  active?: boolean;
  stock?: number;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  type: string;
  caliber?: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  image: string;
  /**
   * Non-cut-out source shots. "light": near-white/grey studio ground, brightened so
   * multiply drops it into the panel. "scene": lifestyle photo (dirt, wood),
   * rendered as a grey monochrome print filling the panel.
   */
  photo?: "light" | "scene";
  /** Poster figure on the product page: vertical label + big value. */
  figure: { label: string; value: string };
  /** Spec strip shown under the name, poster-chip style. */
  strip: string[];
  /** Product copy; blank lines separate paragraphs. */
  description: string;
  /** Short description: the search snippet and share text (≤ 155 chars). */
  summary?: string;
  /** Search title override (≤ 55 chars; the layout appends the store name). */
  metaTitle?: string;
  /** Alt text for the main image. Defaults to a name-based description. */
  imageAlt?: string;
  /** Manufacturer part number / UPC — only when verified from the maker. */
  mpn?: string;
  gtin?: string;
  specs: [string, string][];
  packs?: Pack[];
  /** Firearm: ships to an FFL dealer for transfer. */
  ffl?: boolean;
  /** Compliance notice shown on the product page and in the cart. */
  notice?: string;
  trending?: boolean;
  /** Last content edit (Supabase rows only) — drives sitemap lastmod. */
  updatedAt?: string;
};

export const categories: Category[] = [
  {
    id: "handguns",
    name: "Handguns",
    short: "Handguns",
    blurb: "Ships to your local FFL for transfer",
    types: [
      { id: "full-size", name: "Full-size" },
      { id: "compact", name: "Compact" },
      { id: "carry", name: "Subcompact & carry" },
      { id: "pcc", name: "PCC & AR pistols" },
    ],
    metaTitle: "Handguns for Sale: Glock & SIG Sauer Pistols",
    metaDescription:
      "Shop Glock Gen6, V and Gen5 pistols and the SIG Sauer P365 family — full-size, compact and carry 9mm handguns shipped to your local FFL dealer.",
    intro:
      "Every handgun here ships to a federally licensed dealer (FFL) you pick at checkout. You complete ATF Form 4473 and the background check there, then take your pistol home. The range covers Glock's newest Gen6 and V models alongside the Gen5 and Gen4 pistols still in stock, plus the SIG Sauer P365, P365-XL and P365-XMACRO for concealed carry. Not sure which size fits you? Full-size pistols such as the Glock 17 are easiest to shoot well, compacts such as the Glock 19 split the difference, and slimline carry guns such as the Glock 43X and SIG P365 are the easiest to conceal.",
  },
  {
    id: "ammunition",
    name: "Ammunition",
    short: "Ammo",
    blurb: "Handgun, rifle, shotgun and rimfire",
    types: [
      { id: "handgun", name: "Handgun" },
      { id: "rifle", name: "Rifle" },
      { id: "shotgun", name: "Shotgun" },
      { id: "rimfire", name: "Rimfire" },
    ],
    metaTitle: "Ammo for Sale: 9mm, Rifle, Shotgun & Rimfire",
    metaDescription:
      "Buy 9mm range and self-defense ammo — Federal HST, Speer Gold Dot, Hornady Critical Defense — plus rifle, shotgun and .22 LR, priced per round.",
    intro:
      "Ammunition is sold by the round count you choose, and every listing shows the price per round so bulk packs are easy to compare. For practice, full metal jacket (FMJ) loads such as Winchester Target & Practice keep costs down. For carry and home defense, jacketed hollow points such as Federal HST, Speer Gold Dot and Hornady Critical Defense are the loads most defensive shooters choose. Orders ship to your address with an adult signature on delivery; you must be 21 or older for handgun ammunition and 18 or older for rifle and shotgun ammunition, and some states add their own checks.",
  },
  {
    id: "triggers",
    name: "FRT Triggers",
    short: "Triggers",
    blurb: "Forced-reset triggers for AR-15 lowers",
    types: [{ id: "frt", name: "Forced reset" }],
    metaTitle: "Forced Reset Triggers (FRT) for AR-15",
    metaDescription:
      "Rare Breed FRT-15L3 and FRT-15C3 forced reset triggers for Mil-Spec AR-15 lowers. Drop-in, 3-position selector, made in the USA. Check your state first.",
    intro:
      "A forced reset trigger (FRT) mechanically pushes the trigger forward after every shot, so it resets faster than a standard trigger while still firing one round per pull. Rare Breed's FRT-15L3 and FRT-15C3 drop into Mil-Spec AR-15 lower receivers and come with a 3-position ambidextrous selector (safe, semi and forced reset) and anti-walk pins. They need a full-auto-profile (M16) bolt carrier group to run correctly, and some lowers with a sear block will not accept them. Forced reset triggers are restricted in several states, so confirm they are legal where you live before you order; we cannot ship to restricted addresses.",
  },
  {
    id: "parts",
    name: "Parts & Accessories",
    short: "Parts",
    blurb: "Chassis kits, stocks and rebuild parts",
    types: [
      { id: "kits", name: "Kits & chassis" },
      { id: "stocks", name: "Stocks" },
    ],
    metaTitle: "Gun Parts & Accessories: Kits, Stocks, Rebuilds",
    metaDescription:
      "Pistol chassis kits, AR-15 stocks and trigger rebuild parts. Check fit for your model and read the NFA and state notices on each product.",
    intro:
      "Parts and accessories that change how a firearm is configured come with their own rules. A pistol chassis with a shoulder stock can create a short-barreled rifle, which needs an approved ATF Form 1 before you assemble it, and some stocks are restricted in certain states. Each product page lists what it fits and any notice that applies, so read both before you order.",
  },
];

const FFL_NOTICE =
  "Firearm purchase. Ships only to a federally licensed dealer (FFL) you choose at checkout. You complete the transfer and background check there. Buyer must be 21 or older for handguns.";
const STATE_NOTICE =
  "Restricted in some states and localities. Confirm it is legal where you live before ordering — we cannot ship to restricted addresses.";
const AMMO_NOTICE =
  "Adult signature required on delivery. Buyer must be 21+ for handgun ammunition and 18+ for rifle and shotgun ammunition. Some states require additional checks.";

const H = "catalog/handguns/";
const A = "catalog/ammunition/";
const T = "catalog/triggers/";
const P = "catalog/parts/";

/** Ammo packs from a price-per-round (placeholder pricing, small bulk discount). */
function packs(ppr: number, counts: number[]): Pack[] {
  return counts.map((rounds, i) => ({
    rounds,
    price: Math.round(rounds * ppr * (1 - i * 0.04) * 100) / 100,
  }));
}

type GlockInput = {
  slug: string;
  name: string;
  model: string;
  type: string;
  caliber: string;
  capacity: number;
  barrel: string;
  price: number;
  compareAt?: number;
  image: string;
  extra?: [string, string][];
  trending?: boolean;
  rating?: number;
  reviews?: number;
};

function glock(g: GlockInput): Product {
  return {
    slug: g.slug,
    name: g.name,
    brand: "Glock",
    category: "handguns",
    type: g.type,
    caliber: g.caliber,
    price: g.price,
    compareAt: g.compareAt,
    rating: g.rating ?? 4.8,
    reviews: g.reviews ?? 120,
    image: H + g.image,
    figure: { label: "Model", value: g.model },
    strip: [g.caliber, `${g.capacity} rd`, `${g.barrel} bbl`],
    description: `The ${g.name} in ${g.caliber}: ${g.capacity}-round capacity and a ${g.barrel} barrel. Striker-fired, polymer frame. Ships to your chosen FFL dealer.`,
    specs: [
      ["Caliber", g.caliber],
      ["Capacity", `${g.capacity} + 1`],
      ["Barrel length", g.barrel],
      ["Action", "Striker-fired"],
      ...(g.extra ?? []),
      ["Transfer", "Ships to FFL"],
    ],
    ffl: true,
    notice: FFL_NOTICE,
    trending: g.trending,
  };
}

type AmmoInput = {
  slug: string;
  name: string;
  brand: string;
  type: string;
  caliber: string;
  grain: number;
  bullet: string;
  ppr: number;
  counts: number[];
  image: string;
  trending?: boolean;
  rating?: number;
  reviews?: number;
  /** Extra spec rows (velocity, case, primer…), from the maker's data. */
  extra?: [string, string][];
  mpn?: string;
};

function ammo(a: AmmoInput): Product {
  const p = packs(a.ppr, a.counts);
  const shot = a.type === "shotgun";
  return {
    slug: a.slug,
    name: a.name,
    brand: a.brand,
    category: "ammunition",
    type: a.type,
    caliber: a.caliber,
    price: p[0].price,
    rating: a.rating ?? 4.7,
    reviews: a.reviews ?? 80,
    image: A + a.image,
    figure: shot
      ? { label: "Gauge", value: a.caliber.split(" ")[0] }
      : { label: "Grain", value: String(a.grain) },
    strip: shot ? [a.caliber, a.bullet] : [a.caliber, `${a.grain} gr`, a.bullet],
    description: shot
      ? `${a.brand} ${a.caliber}, ${a.bullet.toLowerCase()}. Sold by the shell count you choose below.`
      : `${a.brand} ${a.caliber}, ${a.grain}-grain ${a.bullet}. Sold by the round count you choose below.`,
    specs: [
      ["Caliber", a.caliber],
      ...(shot ? [] : ([["Bullet weight", `${a.grain} gr`]] as [string, string][])),
      [shot ? "Load" : "Bullet type", a.bullet],
      ...(a.extra ?? ([["Casing", shot ? "Hull" : "Brass"]] as [string, string][])),
    ],
    packs: p,
    notice: AMMO_NOTICE,
    trending: a.trending,
    mpn: a.mpn,
  };
}

type SigInput = {
  slug: string;
  name: string;
  model: string;
  type: string;
  capacity: number;
  barrel: string;
  price: number;
  image: string;
  mpn: string;
  extra: [string, string][];
  trending?: boolean;
};

/** SIG Sauer P365 family — specs from sigsauer.com model tables (Nov 2026). */
function sig(s: SigInput): Product {
  return {
    slug: s.slug,
    name: s.name,
    brand: "SIG Sauer",
    category: "handguns",
    type: s.type,
    caliber: "9mm",
    price: s.price,
    rating: 0,
    reviews: 0,
    image: H + s.image,
    figure: { label: "Model", value: s.model },
    strip: ["9mm", `${s.capacity} rd`, `${s.barrel} bbl`],
    description: `The ${s.name} in 9mm with ${s.capacity}-round magazines and a ${s.barrel} barrel. Ships to your chosen FFL dealer.`,
    specs: [
      ["Caliber", "9mm Luger"],
      ["Capacity", `${s.capacity} + 1`],
      ["Barrel length", s.barrel],
      ["Action", "Striker-fired"],
      ...s.extra,
      ["Manufacturer SKU", s.mpn],
      ["Transfer", "Ships to FFL"],
    ],
    mpn: s.mpn,
    ffl: true,
    notice: FFL_NOTICE,
    trending: s.trending,
  };
}

const FRT_CONTENTS =
  "Trigger, 2 anti-walk pins, 4 pin screws, selector drum, long and short selector levers, 2 T10 screws, 2 T10 wrenches";

/** Rare Breed FRT line — specs and contents from rarebreedtriggers.com (Nov 2026). */
function rareBreed(r: {
  slug: string;
  name: string;
  price: number;
  image: string;
  stage: string;
  shoe: string;
  extra?: [string, string][];
  trending?: boolean;
}): Product {
  return {
    slug: r.slug,
    name: r.name,
    brand: "Rare Breed",
    category: "triggers",
    type: "frt",
    price: r.price,
    rating: 0,
    reviews: 0,
    image: T + r.image,
    // Rare Breed's studio shots sit on an off-white sweep; "light" lifts it to white for the multiply blend.
    photo: "light",
    figure: { label: "Platform", value: "AR-15" },
    strip: ["AR-15", r.stage, `${r.shoe} shoe`],
    description: `${r.name} forced reset trigger for Mil-Spec AR-15 lowers.`,
    specs: [
      ["Platform", "Mil-Spec AR-15 lower"],
      ["Type", "Forced reset trigger"],
      ["Modes", "Safe / Semi / FRT (3-position ambidextrous selector)"],
      ["Trigger feel", r.stage],
      ["Trigger shoe", r.shoe],
      ...(r.extra ?? []),
      ["Bolt carrier", "Full-auto-profile (M16) BCG required"],
      ["Buffer", "H2 or H3 recommended (or A5 system)"],
      ["In the box", FRT_CONTENTS],
      ["Weight", "5 oz"],
      ["Made in", "USA"],
    ],
    notice: STATE_NOTICE,
    trending: r.trending,
  };
}

const baseProducts: Product[] = [
  // ── Handguns ───────────────────────────────────────────────────────────
  // Gen6 and V specs: us.glock.com technical data (Nov 2026). Weights unloaded, without magazine.
  glock({ slug: "glock-19-gen6", name: "Glock 19 Gen6", model: "19", type: "compact", caliber: "9mm", capacity: 15, barrel: "4.02″", price: 649, image: "glock-19-gen6.png", trending: true, rating: 0, reviews: 0,
    extra: [["Generation", "Gen6"], ["Optic ready", "Gen6 optic-ready system"], ["Trigger", "Flat-faced, 26 N pull"], ["Weight (no magazine)", "20.11 oz"], ["Overall length", "7.28″"], ["Height incl. magazine", "5.04″"], ["Width", "1.35″"]] }),
  glock({ slug: "glock-17-gen6", name: "Glock 17 Gen6", model: "17", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 649, image: "glock-17-gen6.png", trending: true, rating: 0, reviews: 0,
    extra: [["Generation", "Gen6"], ["Optic ready", "Gen6 optic-ready system"], ["Trigger", "Flat-faced, 26 N pull"], ["Weight (no magazine)", "21.16 oz"], ["Overall length", "7.95″"], ["Height incl. magazine", "5.47″"], ["Width", "1.34″"]] }),
  glock({ slug: "glock-19-v", name: "Glock 19 V", model: "19", type: "compact", caliber: "9mm", capacity: 15, barrel: "4.02″", price: 599, image: "glock-19-v.png", trending: true, rating: 0, reviews: 0,
    extra: [["Series", "V"], ["Optional magazines", "17, 24, 31, 33 rd"], ["Barrel", "GLOCK Marksman Barrel (GMB)"], ["Finish", "nDLC"], ["Controls", "Ambidextrous slide stop, reversible magazine catch"], ["Weight (no magazine)", "21.52 oz"], ["Overall length", "7.28″"], ["Height incl. magazine", "5.04″"]] }),
  glock({ slug: "glock-17-v", name: "Glock 17 V", model: "17", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 599, image: "glock-17-v.png", rating: 0, reviews: 0,
    extra: [["Series", "V"], ["Optional magazines", "19, 24, 31, 33 rd"], ["Barrel", "GLOCK Marksman Barrel (GMB)"], ["Finish", "nDLC"], ["Controls", "Ambidextrous slide stop, reversible magazine catch, flared magwell"], ["Weight (no magazine)", "20.81 oz"], ["Overall length", "7.95″"], ["Height incl. magazine", "5.47″"]] }),
  glock({ slug: "glock-43x-mos", name: "Glock 43X MOS", model: "43X", type: "carry", caliber: "9mm", capacity: 10, barrel: "3.41″", price: 579, image: "glock-43x-mos.png", trending: true, rating: 0, reviews: 0,
    extra: [["Optic ready", "MOS slide cut for micro optics (no adapter plates included)"], ["Rail", "GLOCK Slim Mounting Rail"], ["Barrel", "GLOCK Marksman Barrel (GMB)"], ["Trigger", "24 N pull"], ["Weight (no magazine)", "16.26 oz"], ["Overall length", "6.50″"], ["Width", "1.10″"]] }),
  sig({ slug: "sig-p365", name: "SIG Sauer P365", model: "365", type: "carry", capacity: 10, barrel: "3.1″", price: 549, image: "sig-p365.jpg", mpn: "365-9-BXR3P", trending: true,
    extra: [["Magazines", "(2) 10 rd — flush and extended; 12 rd optional"], ["Sights", "XRAY3 Day/Night"], ["Optic ready", "Cut for ROMEO-X COMPACT"], ["+P rated", "Yes"], ["Finish", "Nitron"]] }),
  sig({ slug: "sig-p365-xl", name: "SIG Sauer P365-XL", model: "XL", type: "carry", capacity: 12, barrel: "3.7″", price: 599, image: "sig-p365-xl.jpg", mpn: "365XL-9-BXR3", trending: true,
    extra: [["Magazines", "(2) 12 rd steel"], ["Sights", "XRAY3 Day/Night"], ["Optic ready", "Shield RMSc footprint (ROMEO-X COMPACT)"], ["Trigger", "Flat X trigger, 90° break"], ["Overall length", "6.6″"], ["Height", "4.8″"], ["Width", "1.1″"], ["Weight", "20.7 oz"]] }),
  sig({ slug: "sig-p365-xmacro", name: "SIG Sauer P365-XMACRO", model: "XM", type: "compact", capacity: 17, barrel: "3.7″", price: 649, image: "sig-p365-xmacro.jpg", mpn: "365XCA-9-BXR3",
    extra: [["Magazines", "(2) 17 rd steel"], ["Sights", "XRAY3 Day/Night"], ["Optic ready", "Shield RMSc footprint (ROMEO-X COMPACT)"], ["Rail", "M1913"], ["Backstraps", "Small, medium and large included"], ["Overall length", "6.6″"], ["Height", "5.2″"], ["Width", "1.1″"], ["Weight", "22 oz with magazine"]] }),
  glock({ slug: "glock-17-gen5",name: "Glock 17 Gen5", model: "17", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 599, image: "glock-17-gen5.jpg", trending: true, rating: 4.9, reviews: 412 }),
  glock({ slug: "glock-19-gen5-fde", name: "Glock 19 Gen5 FDE", model: "19", type: "compact", caliber: "9mm", capacity: 15, barrel: "4.02″", price: 629, image: "glock-19-gen5-fde.jpg", trending: true, rating: 4.9, reviews: 288 }),
  glock({ slug: "glock-19-gen5-mos", name: "Glock 19 Gen5 MOS", model: "19", type: "compact", caliber: "9mm", capacity: 15, barrel: "4.02″", price: 679, image: "glock-19-gen5-mos.jpg", extra: [["Optic ready", "MOS"]] }),
  glock({ slug: "glock-43x-pvd", name: "Glock 43X Black/Silver PVD", model: "43X", type: "carry", caliber: "9mm", capacity: 10, barrel: "3.41″", price: 529, image: "glock-43x-pvd.jpg", trending: true, rating: 4.8, reviews: 196 }),
  glock({ slug: "glock-34-gen5-mos", name: "Glock 34 Gen5 MOS", model: "34", type: "full-size", caliber: "9mm", capacity: 17, barrel: "5.31″", price: 749, image: "glock-34-gen5-mos.jpg", extra: [["Optic ready", "MOS"]], trending: true }),
  glock({ slug: "glock-48", name: "Glock 48", model: "48", type: "carry", caliber: "9mm", capacity: 10, barrel: "4.17″", price: 499, image: "glock-48.jpg" }),
  glock({ slug: "glock-45-gen5", name: "Glock 45 Gen5", model: "45", type: "compact", caliber: "9mm", capacity: 17, barrel: "4.02″", price: 599, image: "glock-45-gen5.jpg" }),
  glock({ slug: "glock-17-gen4", name: "Glock 17 Gen4", model: "17", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 549, image: "glock-17-gen4.jpg" }),
  glock({ slug: "glock-17-gen3", name: "Glock 17 Gen3", model: "17", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 499, image: "glock-17-gen3.jpg" }),
  glock({ slug: "glock-p80", name: "Glock P80 Gen1", model: "P80", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 499, image: "glock-p80.jpg" }),
  glock({ slug: "glock-19-gen4", name: "Glock 19 Gen4", model: "19", type: "compact", caliber: "9mm", capacity: 15, barrel: "4.02″", price: 549, image: "glock-19-gen4.jpg" }),
  glock({ slug: "glock-26-gen4", name: "Glock 26 Gen4", model: "26", type: "carry", caliber: "9mm", capacity: 10, barrel: "3.43″", price: 549, image: "glock-26-gen4.jpg" }),
  glock({ slug: "glock-22-gen4", name: "Glock 22 Gen4", model: "22", type: "full-size", caliber: ".40 S&W", capacity: 15, barrel: "4.49″", price: 549, image: "glock-22-gen4.jpg" }),
  glock({ slug: "glock-27-gen4", name: "Glock 27 Gen4", model: "27", type: "carry", caliber: ".40 S&W", capacity: 9, barrel: "3.43″", price: 549, image: "glock-27-gen4.jpg" }),
  glock({ slug: "glock-20sf", name: "Glock 20SF", model: "20", type: "full-size", caliber: "10mm", capacity: 15, barrel: "4.61″", price: 629, image: "glock-20sf.jpg" }),
  glock({ slug: "glock-29-gen4", name: "Glock 29 Gen4", model: "29", type: "carry", caliber: "10mm", capacity: 10, barrel: "3.78″", price: 629, image: "glock-29-gen4.jpg" }),
  glock({ slug: "glock-40-gen4-mos", name: "Glock 40 Gen4 MOS", model: "40", type: "full-size", caliber: "10mm", capacity: 15, barrel: "6.02″", price: 749, image: "glock-40-gen4-mos.png", extra: [["Optic ready", "MOS"]] }),
  glock({ slug: "glock-41-gen4", name: "Glock 41 Gen4", model: "41", type: "full-size", caliber: ".45 ACP", capacity: 13, barrel: "5.31″", price: 649, image: "glock-41-gen4.jpg" }),
  glock({ slug: "glock-30s", name: "Glock 30S", model: "30S", type: "carry", caliber: ".45 ACP", capacity: 10, barrel: "3.78″", price: 579, image: "glock-30s.jpg" }),
  glock({ slug: "glock-42", name: "Glock 42", model: "42", type: "carry", caliber: ".380 ACP", capacity: 6, barrel: "3.25″", price: 449, image: "glock-42.jpg" }),
  {
    slug: "ati-milsport-9mm-pistol",
    name: "ATI Milsport 9mm AR Pistol",
    brand: "ATI",
    category: "handguns",
    type: "pcc",
    caliber: "9mm",
    price: 599,
    rating: 4.6,
    reviews: 54,
    image: H + "ati-milsport-9mm.jpg",
    figure: { label: "Barrel", value: "5.5″" },
    strip: ["9mm", "5.5″ bbl", "M-LOK"],
    description:
      "9mm AR-pattern pistol with a 5.5″ barrel, flash can, M-LOK forend and blade brace. Ships to your chosen FFL dealer.",
    specs: [
      ["Caliber", "9mm"],
      ["Barrel length", "5.5″"],
      ["Handguard", "M-LOK"],
      ["Brace", "Blade pistol brace"],
      ["Transfer", "Ships to FFL"],
    ],
    ffl: true,
    notice: FFL_NOTICE,
  },

  // ── Ammunition ─────────────────────────────────────────────────────────
  // HST and Gold Dot data: federalpremium.com / speer.com (Nov 2026).
  ammo({ slug: "federal-hst-9mm-124", name: "Federal Personal Defense HST 9mm 124gr JHP", brand: "Federal", type: "handgun", caliber: "9mm", grain: 124, bullet: "HST JHP", ppr: 1.5, counts: [20, 200], image: "federal-hst-9mm-124.jpg", trending: true, rating: 0, reviews: 0, mpn: "P9HST1S",
    extra: [["Muzzle velocity", "1,150 fps (4″ test barrel)"], ["Velocity at 50 yd", "1,049 fps"], ["Case", "Nickel-plated brass"], ["Box", "20 rounds"], ["Use", "Self-defense"]] }),
  ammo({ slug: "speer-gold-dot-9mm-124", name: "Speer Gold Dot 9mm 124gr GDHP", brand: "Speer", type: "handgun", caliber: "9mm", grain: 124, bullet: "Gold Dot hollow point", ppr: 1.45, counts: [20, 200], image: "speer-gold-dot-9mm-124.jpg", trending: true, rating: 0, reviews: 0, mpn: "23618GD",
    extra: [["Muzzle velocity", "1,150 fps (4″ test barrel)"], ["Velocity at 50 yd", "1,044 fps"], ["Construction", "Bonded (Uni-Cor) core and jacket"], ["Case", "Nickel-plated brass, sealed primer"], ["Box", "20 rounds"], ["Use", "Self-defense"]] }),
  ammo({ slug: "hornady-critical-defense-9mm", name: "Hornady Critical Defense 9mm 115gr FTX", brand: "Hornady", type: "handgun", caliber: "9mm", grain: 115, bullet: "FTX", ppr: 1.1, counts: [25, 200], image: "hornady-critical-defense-9mm.webp", trending: true, rating: 4.9, reviews: 530 }),
  ammo({ slug: "winchester-target-9mm-115-fmj", name: "Winchester Target & Practice 9mm 115gr FMJ", brand: "Winchester", type: "handgun", caliber: "9mm", grain: 115, bullet: "FMJ", ppr: 0.32, counts: [50, 500, 1000], image: "winchester-target-9mm.jpg", trending: true, rating: 4.8, reviews: 344 }),
  ammo({ slug: "winchester-defender-9mm-pdx1", name: "Winchester Defender 9mm +P 124gr PDX1", brand: "Winchester", type: "handgun", caliber: "9mm", grain: 124, bullet: "Bonded JHP", ppr: 0.96, counts: [20, 200], image: "winchester-defender-9mm.jpg" }),
  ammo({ slug: "hornady-american-gunner-9mm", name: "Hornady American Gunner 9mm +P 124gr XTP", brand: "Hornady", type: "handgun", caliber: "9mm", grain: 124, bullet: "XTP JHP", ppr: 0.74, counts: [25, 250, 500], image: "hornady-american-gunner-9mm.webp" }),
  ammo({ slug: "g2-research-rip-9mm", name: "G2 Research R.I.P. 9mm 92gr", brand: "G2 Research", type: "handgun", caliber: "9mm", grain: 92, bullet: "Fragmenting HP", ppr: 1.8, counts: [20, 100], image: "g2-research-rip-9mm.webp" }),
  ammo({ slug: "imi-9mm-115-jhp", name: "IMI 9mm 115gr JHP", brand: "IMI", type: "handgun", caliber: "9mm", grain: 115, bullet: "JHP", ppr: 0.6, counts: [50, 500], image: "imi-9mm-jhp.webp" }),
  ammo({ slug: "hornady-american-gunner-357", name: "Hornady American Gunner .357 Mag 125gr XTP", brand: "Hornady", type: "handgun", caliber: ".357 Magnum", grain: 125, bullet: "XTP JHP", ppr: 1.05, counts: [25, 500], image: "hornady-american-gunner-357.webp" }),
  ammo({ slug: "norma-357-158-fmj", name: "Norma Range & Training .357 Mag 158gr FMJ", brand: "Norma", type: "handgun", caliber: ".357 Magnum", grain: 158, bullet: "FMJ", ppr: 0.82, counts: [50, 500], image: "norma-357-fmj.jpg" }),
  ammo({ slug: "federal-punch-38-special", name: "Federal Punch .38 Special +P 120gr JHP", brand: "Federal", type: "handgun", caliber: ".38 Special", grain: 120, bullet: "JHP", ppr: 0.9, counts: [20, 200], image: "federal-punch-38-special.webp" }),
  ammo({ slug: "cci-big4-38-special", name: "CCI Big 4 Shotshell .38 Special 84gr", brand: "CCI", type: "handgun", caliber: ".38 Special", grain: 84, bullet: "Lead shot", ppr: 1.6, counts: [10, 200], image: "cci-big4-38-special.jpg" }),
  ammo({ slug: "cci-shotshell-45-acp", name: "CCI Shotshell .45 ACP 120gr", brand: "CCI", type: "handgun", caliber: ".45 ACP", grain: 120, bullet: "Lead shot", ppr: 1.7, counts: [10, 200], image: "cci-shotshell-45-acp.webp" }),
  ammo({ slug: "hornady-whitetail-350-legend", name: "Hornady American Whitetail 350 Legend 170gr", brand: "Hornady", type: "rifle", caliber: "350 Legend", grain: 170, bullet: "InterLock SP", ppr: 1.3, counts: [20, 300], image: "hornady-whitetail-350-legend.jpg", trending: true }),
  ammo({ slug: "hornady-whitetail-450-bushmaster", name: "Hornady American Whitetail 450 Bushmaster 245gr", brand: "Hornady", type: "rifle", caliber: "450 Bushmaster", grain: 245, bullet: "InterLock SP", ppr: 1.75, counts: [20, 500], image: "hornady-whitetail-450-bushmaster.jpg" }),
  ammo({ slug: "winchester-deer-season-30-30", name: "Winchester Deer Season XP 30-30 150gr", brand: "Winchester", type: "rifle", caliber: "30-30 Win", grain: 150, bullet: "Extreme Point", ppr: 1.55, counts: [20, 200], image: "winchester-deer-season-30-30.webp" }),
  ammo({ slug: "winchester-power-point-270", name: "Winchester Power-Point .270 Win 150gr", brand: "Winchester", type: "rifle", caliber: ".270 Win", grain: 150, bullet: "JSP", ppr: 1.6, counts: [20, 200], image: "winchester-power-point-270.jpg" }),
  ammo({ slug: "atomic-308-subsonic", name: "Atomic Match Subsonic .308 Win 175gr SMK", brand: "Atomic", type: "rifle", caliber: ".308 Win", grain: 175, bullet: "Sierra MatchKing HP", ppr: 2.4, counts: [50, 100], image: "atomic-308-subsonic.webp" }),
  ammo({ slug: "hornady-superformance-204", name: "Hornady Superformance Varmint .204 Ruger 40gr", brand: "Hornady", type: "rifle", caliber: ".204 Ruger", grain: 40, bullet: "V-MAX", ppr: 1.35, counts: [20, 500], image: "hornady-superformance-204.webp" }),
  ammo({ slug: "fiocchi-shooting-dynamics-12ga", name: "Fiocchi Shooting Dynamics 12 Gauge", brand: "Fiocchi", type: "shotgun", caliber: "12 Gauge", grain: 1, bullet: "Target load", ppr: 0.42, counts: [25, 250], image: "fiocchi-shooting-dynamics-12ga.webp", trending: true }),
  ammo({ slug: "fiocchi-speed-steel-12ga", name: "Fiocchi Flyway Steel 12 Gauge", brand: "Fiocchi", type: "shotgun", caliber: "12 Gauge", grain: 1, bullet: "Steel shot", ppr: 0.7, counts: [25, 250], image: "fiocchi-speed-steel-12ga.webp" }),
  ammo({ slug: "hornady-critical-defense-12ga", name: "Hornady Critical Defense 12 Gauge 00 Buck", brand: "Hornady", type: "shotgun", caliber: "12 Gauge", grain: 1, bullet: "00 Buckshot", ppr: 1.5, counts: [10, 100], image: "hornady-critical-defense-12ga.webp" }),
  ammo({ slug: "winchester-super-x-22lr", name: "Winchester Super-X .22 LR Shot", brand: "Winchester", type: "rimfire", caliber: ".22 LR", grain: 25, bullet: "Lead shot", ppr: 0.55, counts: [50, 500], image: "winchester-super-x-22lr.jpg" }),
  ammo({ slug: "eley-benchrest-22lr", name: "Eley Semi-Auto Benchrest .22 LR 40gr", brand: "Eley", type: "rimfire", caliber: ".22 LR", grain: 40, bullet: "Round nose", ppr: 0.32, counts: [50, 500], image: "eley-benchrest-22lr.jpg" }),
  ammo({ slug: "norma-tac-22", name: "Norma TAC-22 .22 LR 40gr", brand: "Norma", type: "rimfire", caliber: ".22 LR", grain: 40, bullet: "Lead RN", ppr: 0.11, counts: [50, 500], image: "norma-tac-22.jpg", trending: true }),
  ammo({ slug: "cci-shotshell-22lr", name: "CCI Shotshell .22 LR 31gr", brand: "CCI", type: "rimfire", caliber: ".22 LR", grain: 31, bullet: "Lead shot", ppr: 0.6, counts: [20, 200], image: "cci-shotshell-22lr.webp" }),
  ammo({ slug: "hornady-critical-defense-22wmr", name: "Hornady Critical Defense .22 WMR 45gr FTX", brand: "Hornady", type: "rimfire", caliber: ".22 WMR", grain: 45, bullet: "FTX", ppr: 0.85, counts: [25, 250], image: "hornady-critical-defense-22wmr.webp" }),
  ammo({ slug: "aguila-super-extra-22lr", name: "Aguila Super Extra High Velocity .22 LR", brand: "Aguila", type: "rimfire", caliber: ".22 LR", grain: 40, bullet: "Lead RN", ppr: 0.09, counts: [50, 500], image: "aguila-super-extra-22lr.webp" }),
  ammo({ slug: "winchester-super-x-22-hornet", name: "Winchester Super-X .22 Hornet 46gr JHP", brand: "Winchester", type: "rifle", caliber: ".22 Hornet", grain: 46, bullet: "JHP", ppr: 1.45, counts: [50, 200], image: "winchester-super-x-22-hornet.jpg" }),

  // ── FRT triggers ───────────────────────────────────────────────────────
  // The current Rare Breed line (official MSRP $450). The slug "frt-15l3" is kept for existing links.
  rareBreed({ slug: "frt-15l3", name: "Rare Breed FRT-15L3", price: 450, image: "rare-breed-frt-15l3.jpg", stage: "Single-stage", shoe: "Curved", trending: true,
    extra: [["Pull weight", "Semi 4–4.5 lb · FRT 5.5–6 lb"], ["Materials", "7075 anodized aluminum, heat-treated 4140 steel"]] }),
  rareBreed({ slug: "rare-breed-frt-15l3-flat", name: "Rare Breed FRT-15L3 (Flat)", price: 450, image: "rare-breed-frt-15l3-flat.jpg", stage: "Single-stage", shoe: "Flat", trending: true,
    extra: [["Pull weight", "Semi 4–4.5 lb · FRT 5.5–6 lb"], ["Materials", "7075 anodized aluminum, heat-treated 4140 steel"]] }),
  rareBreed({ slug: "rare-breed-frt-15c3", name: "Rare Breed FRT-15C3", price: 450, image: "rare-breed-frt-15c3.jpg", stage: "Two-stage in semi, single-stage in FRT", shoe: "Curved" }),
  ...(
    [
      ["rare-breed-frt-15", "Rare Breed FRT-15", "Rare Breed", 380, "rare-breed-frt-15.webp", false, 4.8, 210],
      ["rare-breed-frt-15-e3", "Rare Breed FRT-15 E3", "Rare Breed", 399, "rare-breed-frt-15-e3.jpeg", false, 4.8, 96],
      ["frt-15l2", "FRT-15L2 Forced Reset Trigger", "FRT", 349, "frt-15l2.webp", false, 4.6, 31],
      ["wot-trigger", "WOT Wide Open Trigger", "WOT", 349, "wot-trigger.webp", false, 4.6, 58],
      ["pbg-alamo-15", "PBG Alamo-15 Trigger", "PBG", 365, "alamo-15.jpeg", false, 4.7, 42],
      ["para-15", "Para-15 Trigger", "Para-15", 359, "para-15.webp", false, 4.5, 19],
    ] as const
  ).map(
    ([slug, name, brand, price, image, trending, rating, reviews]): Product => ({
      slug,
      name,
      brand,
      category: "triggers",
      type: "frt",
      price,
      rating,
      reviews,
      image: T + image,
      photo: slug === "para-15" ? "scene" : slug === "rare-breed-frt-15-e3" ? "light" : undefined,
      figure: { label: "Platform", value: "AR-15" },
      strip: ["AR-15", "Forced reset", "Mil-spec lower"],
      description: `${name} for AR-15 pattern lowers. Semi-automatic: one shot per trigger function, with a forced reset. Read the install guide and confirm your state allows it before ordering.`,
      specs: [
        ["Platform", "AR-15 / mil-spec lower"],
        ["Type", "Forced reset trigger"],
        ["Fire control", "Semi-automatic"],
        ["Installation", "Gunsmith recommended"],
      ],
      notice: STATE_NOTICE,
      trending,
    })
  ),

  // ── Parts & accessories ────────────────────────────────────────────────
  {
    slug: "recover-tactical-p-ix",
    name: "Recover Tactical P-IX Conversion Kit for Glock",
    brand: "Recover Tactical",
    category: "parts",
    type: "kits",
    price: 249,
    rating: 4.6,
    reviews: 88,
    image: P + "recover-pix-kit.jpg",
    figure: { label: "Fits", value: "Glock" },
    strip: ["Glock 17/19", "Chassis", "Picatinny"],
    description:
      "Chassis kit that accepts a Glock pistol, adding top and side rails and ambidextrous controls. No gunsmithing — the pistol drops in.",
    specs: [
      ["Compatibility", "Glock 17, 19 and others (check list)"],
      ["Material", "Polymer"],
      ["Rails", "Picatinny"],
    ],
    notice:
      "NFA notice: installing a pistol with a barrel under 16″ in a chassis fitted with a shoulder stock makes a short-barreled rifle. You need an approved ATF Form 1 before you assemble it.",
  },
  {
    slug: "slide-fire-ssar-15",
    name: "Slide Fire SSAR-15 OGR Stock",
    brand: "Slide Fire",
    category: "parts",
    type: "stocks",
    price: 199,
    rating: 4.4,
    reviews: 37,
    image: P + "slide-fire-ssar-15.webp",
    photo: "light",
    figure: { label: "Platform", value: "AR-15" },
    strip: ["AR-15", "Stock", "Bump fire"],
    description: "Bump-fire stock for AR-15 pattern rifles.",
    specs: [
      ["Platform", "AR-15"],
      ["Type", "Bump-fire stock"],
    ],
    notice: STATE_NOTICE,
  },
  {
    slug: "ssar-15-mod",
    name: "SSAR-15 MOD Stock",
    brand: "Slide Fire",
    category: "parts",
    type: "stocks",
    price: 219,
    rating: 4.4,
    reviews: 22,
    image: P + "ssar-15-mod.webp",
    photo: "scene",
    figure: { label: "Platform", value: "AR-15" },
    strip: ["AR-15", "Stock", "MOD"],
    description: "Bump-fire stock for AR-15 pattern rifles, MOD profile.",
    specs: [
      ["Platform", "AR-15"],
      ["Type", "Bump-fire stock"],
    ],
    notice: STATE_NOTICE,
  },
  {
    slug: "wot-rebuild-kit",
    name: "WOT Rebuild Parts — Complete Upgrade Kit",
    brand: "WOT",
    category: "parts",
    type: "kits",
    price: 89,
    rating: 4.5,
    reviews: 14,
    image: P + "wot-rebuild-kit.jpeg",
    figure: { label: "Fits", value: "WOT" },
    strip: ["WOT", "Springs & pins", "Rebuild"],
    description: "Replacement springs, pins and wear parts for WOT triggers.",
    specs: [
      ["Fits", "WOT triggers"],
      ["Contents", "Springs, pins, wear parts"],
    ],
  },
];

/* ── Search copy ──────────────────────────────────────────────────────────
 * s = short description (meta description / share text, ≤ 155 chars)
 * d = product description shown on the page (blank line = new paragraph)
 * t = optional search-title override (≤ 50 chars before the store name)
 * Facts come from the catalog specs above or the maker's published data.
 */
type Copy = { s: string; d: string; t?: string };
const SHIPS_FFL = "Ships to the FFL dealer you choose at checkout, where you complete Form 4473 and the background check.";

const COPY: Record<string, Copy> = {
  // Handguns — new
  "glock-19-gen6": {
    t: "Glock 19 Gen6 9mm Compact Pistol",
    s: "Glock 19 Gen6 9mm compact: 15+1 rounds, 4.02″ barrel, optic-ready slide, flat-faced trigger and new Gen6 grip with palm swell. Ships to your FFL.",
    d: `The Glock 19 Gen6 keeps the size that made the G19 the default carry-and-duty 9mm — a 4.02″ barrel and 15-round magazine — and rebuilds the grip around your hand. A palm swell, thumb rest and the new Gen6 texture lock your grip in, and every Gen6 slide comes optic-ready from the factory.

A flat-faced trigger puts your finger in the same place on every press, and the Safe Action system's three passive safeties disengage as you pull and reset when you let go. It weighs 20.11 oz without a magazine and is 7.28″ long, the same length as earlier G19s, but confirm your holster lists Gen6 before you carry it. ${SHIPS_FFL}`,
  },
  "glock-17-gen6": {
    t: "Glock 17 Gen6 9mm Full-Size Pistol",
    s: "Glock 17 Gen6 9mm full-size: 17+1 rounds, 4.49″ barrel, Gen6 optic-ready slide, flat-faced trigger and palm-swell grip. Ships to your FFL dealer.",
    d: `The full-size Glock 17 in its Gen6 form: a 4.49″ barrel, 17-round magazine and a longer sight radius for easy accuracy at the range or on duty. Gen6 adds a palm swell, thumb rest and new grip texture, a factory optic-ready system and a flat-faced trigger for consistent finger placement.

It weighs 21.16 oz without a magazine and measures 7.95″ long and 5.47″ tall. If you want one pistol to learn on, compete with and keep at home, the G17 is the benchmark. ${SHIPS_FFL}`,
  },
  "glock-19-v": {
    t: "Glock 19 V 9mm Compact Pistol",
    s: "Glock 19 V 9mm: 15+1 rounds, 4.02″ Marksman Barrel, nDLC finish, front serrations, ambidextrous slide stop and interchangeable backstraps.",
    d: `The Glock 19 V is the compact G19 in Glock's V series: a grip without finger grooves, interchangeable backstraps to tune the width for your hand, a reversible magazine catch and an ambidextrous slide stop for left- or right-handed shooters. It runs the accurate GLOCK Marksman Barrel (GMB) under an nDLC-finished slide with front serrations.

Glock lists 17, 24, 31 and 33-round magazines as optional for the G19 V on top of the standard 15. It weighs 21.52 oz without a magazine. ${SHIPS_FFL}`,
  },
  "glock-17-v": {
    t: "Glock 17 V 9mm Full-Size Pistol",
    s: "Glock 17 V 9mm full-size: 17+1, 4.49″ Marksman Barrel, flared magwell, nDLC finish, ambidextrous slide stop and reversible magazine catch.",
    d: `The Glock 17 V is built for capacity and fast reloads: a full-length slide and frame, a flared magwell and a cutout at the front of the frame for quicker magazine changes. The magazine catch is reversible and the slide stop ambidextrous, and the GLOCK Marksman Barrel sits under an nDLC-finished slide with front serrations.

Standard capacity is 17 rounds; Glock lists 19, 24, 31 and 33-round magazines as options. It weighs 20.81 oz without a magazine. ${SHIPS_FFL}`,
  },
  "glock-43x-mos": {
    t: "Glock 43X MOS 9mm Slimline Carry Pistol",
    s: "Glock 43X MOS 9mm slimline: 10+1 rounds, 3.41″ Marksman Barrel, slide cut for micro red dots and a Slim Mounting Rail. Built for concealed carry.",
    d: `The Glock 43X MOS pairs a short 3.41″ barrel with a full, comfortable grip in Glock's thin Slimline profile, so it hides easily but still shoots like a bigger pistol. The slide is cut for micro optics and the frame carries the GLOCK Slim Mounting Rail for a compact light.

It has the GLOCK Marksman Barrel, front serrations, a built-in beavertail, a reversible magazine catch and an orange-follower 10-round magazine. It weighs 16.26 oz without a magazine and is 1.10″ wide. Note: the MOS cut fits specific micro optics directly and does not ship with adapter plates. ${SHIPS_FFL}`,
  },
  "sig-p365": {
    t: "SIG Sauer P365 9mm Micro-Compact Pistol",
    s: "SIG Sauer P365 9mm micro-compact: optic-ready Nitron slide, XRAY3 day/night sights, two 10-round magazines, +P rated. Ships to your FFL.",
    d: `The P365 changed concealed carry by packing double-digit capacity into a pistol the size of a single-stack. This optic-ready version is cut for a direct-mount SIG ROMEO-X COMPACT and comes with XRAY3 day/night sights and two 10-round magazines — one flush, one extended. An optional 12-round magazine takes it to 13 rounds total.

It is striker-fired with SIG's crisp P365 trigger, rated for +P ammunition, and built on a modular polymer grip module. Available with or without a manual safety from SIG (SKU 365-9-BXR3P listed here). ${SHIPS_FFL}`,
  },
  "sig-p365-xl": {
    t: "SIG Sauer P365-XL 9mm Carry Pistol",
    s: "SIG P365-XL 9mm: 12+1 rounds, 3.7″ barrel, flat trigger with a 90° break, XRAY3 sights, optic ready for RMSc footprint dots. 20.7 oz.",
    d: `The P365-XL stretches the P365 just enough to shoot like a full-size pistol: a 3.7″ barrel, a longer optic-ready slide and the X grip module with an extended beavertail and integrated magwell — adding only about half an inch of length and height over the original.

It holds 12+1 rounds, comes with two steel 12-round magazines and XRAY3 day/night sights, and the flat X trigger breaks at 90 degrees. The slide takes Shield RMSc-footprint optics such as the SIG ROMEO-X COMPACT. 6.6″ long, 4.8″ tall, 1.1″ wide, 20.7 oz. ${SHIPS_FFL}`,
  },
  "sig-p365-xmacro": {
    t: "SIG Sauer P365-XMACRO 9mm 17-Round Pistol",
    s: "SIG P365-XMACRO 9mm: 17+1 rounds in a 1.1″-wide carry pistol, 3.7″ barrel, M1913 rail, optic-ready slide and three backstraps. 22 oz.",
    d: `The P365-XMACRO fits full-size capacity — 17+1 rounds of 9mm — into the slim P365 profile. Its Macro-Compact grip module has a standard M1913 rail for a weapon light and interchangeable small, medium and large backstraps, and the non-ported X slide is optic-ready for the SIG ROMEO-X COMPACT.

It ships with two 17-round steel magazines, XRAY3 day/night sights and a 3.7″ barrel. 6.6″ long, 5.2″ tall, 1.1″ wide and 22 oz with a magazine. ${SHIPS_FFL}`,
  },

  // Handguns — Gen5 and earlier
  "glock-17-gen5": {
    s: "Glock 17 Gen5 9mm full-size: 17+1 rounds, 4.49″ Marksman Barrel, ambidextrous slide stop and finger-groove-free grip. Ships to your FFL.",
    d: `The Glock 17 Gen5 is the full-size 9mm that set the standard for duty pistols. Gen5 brought the accurate GLOCK Marksman Barrel, an nDLC finish, an ambidextrous slide stop lever, a flared magwell and a grip without finger grooves.

With a 4.49″ barrel and 17-round magazines, it is easy to shoot well and simple to maintain. Glock has moved to Gen6 and V models, so remaining Gen5 stock is a good way to get the proven design. ${SHIPS_FFL}`,
  },
  "glock-19-gen5-fde": {
    s: "Glock 19 Gen5 9mm compact in Flat Dark Earth: 15+1 rounds, 4.02″ Marksman Barrel, ambidextrous slide stop. Ships to your local FFL.",
    d: `The Glock 19 Gen5 in Flat Dark Earth: the same compact 9mm carried by police and civilians worldwide, with a 4.02″ GLOCK Marksman Barrel, 15-round magazine, ambidextrous slide stop and a grip without finger grooves.

The G19 is small enough to carry and big enough to shoot comfortably, and it takes longer G17 magazines too. ${SHIPS_FFL}`,
  },
  "glock-19-gen5-mos": {
    s: "Glock 19 Gen5 MOS 9mm: 15+1 rounds and a Modular Optic System slide for mounting a red dot with adapter plates. Ships to your FFL dealer.",
    d: `The Glock 19 Gen5 MOS adds the Modular Optic System to the compact G19: a slide cut that accepts common pistol red dots through adapter plates. Underneath it is a standard Gen5 G19 — 4.02″ GLOCK Marksman Barrel, 15-round magazine, ambidextrous slide stop and no finger grooves.

Choose MOS if you plan to run a red dot now or later. ${SHIPS_FFL}`,
  },
  "glock-43x-pvd": {
    s: "Glock 43X 9mm slimline with a two-tone silver PVD slide: 10+1 rounds, 3.41″ barrel, full-length grip for easy concealed carry.",
    d: `The Glock 43X combines the short 3.41″ barrel of the G43 with a longer grip that fits your whole hand, all in Glock's thin Slimline frame. This version has a silver PVD-finished slide over a black frame.

It holds 10+1 rounds of 9mm and is one of the most popular concealed-carry pistols in the country. ${SHIPS_FFL}`,
  },
  "glock-34-gen5-mos": {
    s: "Glock 34 Gen5 MOS 9mm competition pistol: 5.31″ barrel, 17+1 rounds, long sight radius and an optic-ready MOS slide. Ships to your FFL.",
    d: `The Glock 34 is Glock's 9mm competition pistol: a 5.31″ barrel and long slide for a longer sight radius and softer recoil, on a full-size frame with 17-round magazines. The Gen5 MOS version is optic-ready through the Modular Optic System.

A favorite for USPSA, IDPA and anyone who wants the easiest-shooting Glock at the range. ${SHIPS_FFL}`,
  },
  "glock-48": {
    s: "Glock 48 9mm slimline: 10+1 rounds with a 4.17″ barrel on a thin frame — G19-length slide in a carry-friendly width. Ships to your FFL.",
    d: `The Glock 48 puts a 4.17″ barrel and G19-length slide on Glock's thin Slimline frame. You get a longer sight radius than the G43X with the same slim, 10-round grip, which makes it a good choice if you want a carry pistol that shoots like a compact.

${SHIPS_FFL}`,
  },
  "glock-45-gen5": {
    s: "Glock 45 Gen5 9mm crossover: G19-length 4.02″ barrel on a full-size G17 grip, 17+1 rounds, front serrations. Ships to your FFL dealer.",
    d: `The Glock 45 is a crossover: the compact G19-length slide and 4.02″ barrel on a full-size G17 frame. The longer grip holds 17 rounds and gives your little finger room, while the shorter slide is quicker to draw. Gen5 features include the GLOCK Marksman Barrel, front serrations and an ambidextrous slide stop.

${SHIPS_FFL}`,
  },
  "glock-17-gen4": {
    s: "Glock 17 Gen4 9mm full-size: 17+1 rounds, 4.49″ barrel, interchangeable backstraps, dual recoil spring. Ships to your local FFL dealer.",
    d: `The Glock 17 Gen4 brought interchangeable backstraps, a reversible enlarged magazine catch, the Rough Textured Frame and a dual recoil spring assembly to the full-size 9mm. It keeps the finger-groove grip that many Glock owners still prefer.

${SHIPS_FFL}`,
  },
  "glock-17-gen3": {
    s: "Glock 17 Gen3 9mm full-size: the classic finger-groove Glock with 17+1 rounds, 4.49″ barrel and accessory rail. Ships to your FFL dealer.",
    d: `The Gen3 Glock 17 is the classic: finger grooves, thumb rests, an accessory rail and a single recoil spring, with a 4.49″ barrel and 17-round magazines. Many holsters and parts were designed around it, so it is easy to outfit.

${SHIPS_FFL}`,
  },
  "glock-p80": {
    s: "Glock P80 Gen1 9mm: a reissue of the original Austrian Army P80 — no finger grooves, no rail, 17+1 rounds, 4.49″ barrel. Ships to your FFL.",
    d: `The P80 recreates the pistol Glock first built for the Austrian Army in the early 1980s: a smooth, grooveless Gen1-style grip with no accessory rail, a 4.49″ barrel and 17-round magazines. A piece of handgun history that still shoots like a modern G17.

${SHIPS_FFL}`,
  },
  "glock-19-gen4": {
    s: "Glock 19 Gen4 9mm compact: 15+1 rounds, 4.02″ barrel, interchangeable backstraps and finger-groove grip. Ships to your local FFL dealer.",
    d: `The Gen4 Glock 19 is the compact 9mm with interchangeable backstraps, a reversible enlarged magazine catch and a dual recoil spring, plus the finger-groove grip many shooters like. 15-round magazines, 4.02″ barrel.

${SHIPS_FFL}`,
  },
  "glock-26-gen4": {
    s: "Glock 26 Gen4 9mm subcompact: 10+1 rounds, 3.43″ barrel, accepts G19 and G17 magazines as backups. Ships to your FFL dealer.",
    d: `The Glock 26 is the subcompact 9mm often called the "Baby Glock": a 3.43″ barrel and short grip that conceal easily, with 10-round magazines. It also accepts longer G19 and G17 magazines, which makes a good reload.

${SHIPS_FFL}`,
  },
  "glock-22-gen4": {
    s: "Glock 22 Gen4 .40 S&W full-size: 15+1 rounds, 4.49″ barrel, interchangeable backstraps. A long-time duty pistol. Ships to your FFL.",
    d: `The Glock 22 is the full-size .40 S&W Glock, carried by law-enforcement agencies for decades. Gen4 adds interchangeable backstraps, a reversible magazine catch and a dual recoil spring. 15-round magazines, 4.49″ barrel.

${SHIPS_FFL}`,
  },
  "glock-27-gen4": {
    s: "Glock 27 Gen4 .40 S&W subcompact: 9+1 rounds, 3.43″ barrel, accepts G22 and G23 magazines. Ships to your local FFL dealer.",
    d: `The Glock 27 is the subcompact .40 S&W: the G26 footprint chambered for a bigger cartridge, with 9-round magazines and a 3.43″ barrel. It also takes G23 and G22 magazines.

${SHIPS_FFL}`,
  },
  "glock-20sf": {
    s: "Glock 20SF 10mm full-size with the Short Frame for a smaller grip: 15+1 rounds, 4.61″ barrel. For hunting and backcountry. Ships to FFL.",
    d: `The Glock 20SF chambers the powerful 10mm Auto in a Short Frame that reduces trigger reach, so the large grip is easier to hold. 15-round magazines and a 4.61″ barrel make it a popular woods and backcountry pistol.

${SHIPS_FFL}`,
  },
  "glock-29-gen4": {
    s: "Glock 29 Gen4 10mm subcompact: 10+1 rounds, 3.78″ barrel, accepts G20 magazines. Compact backcountry carry. Ships to your FFL.",
    d: `The Glock 29 packs 10mm Auto into a subcompact frame with a 3.78″ barrel and 10-round magazines, and it accepts full-size G20 magazines. A compact choice for backcountry carry if you can handle the recoil.

${SHIPS_FFL}`,
  },
  "glock-40-gen4-mos": {
    s: "Glock 40 Gen4 MOS 10mm long slide: 6.02″ barrel, 15+1 rounds, optic-ready MOS slide. Built for handgun hunting. Ships to your FFL.",
    d: `The Glock 40 is the long-slide 10mm built for handgun hunting: a 6.02″ barrel for more velocity and a long sight radius, 15-round magazines and a MOS slide ready for a red dot.

${SHIPS_FFL}`,
  },
  "glock-41-gen4": {
    s: "Glock 41 Gen4 .45 ACP long slide: 5.31″ barrel, 13+1 rounds. A competition and target .45. Ships to your local FFL dealer.",
    d: `The Glock 41 is the long-slide .45 ACP: a 5.31″ barrel and 13-round magazines on a Gen4 frame with interchangeable backstraps. Soft-shooting for a .45 and a solid competition or target pistol.

${SHIPS_FFL}`,
  },
  "glock-30s": {
    s: "Glock 30S .45 ACP subcompact: slim G36 slide on the G30SF frame, 10+1 rounds, 3.78″ barrel. Compact .45 carry. Ships to your FFL.",
    d: `The Glock 30S pairs the slimmer G36 slide with the G30SF short frame, giving a compact .45 ACP that is lighter and thinner up top. 10-round magazines and a 3.78″ barrel.

${SHIPS_FFL}`,
  },
  "glock-42": {
    s: "Glock 42 .380 ACP: Glock's smallest pistol, slimline, 6+1 rounds and a 3.25″ barrel for deep concealment. Ships to your FFL dealer.",
    d: `The Glock 42 is Glock's smallest pistol: a slimline .380 ACP with a 3.25″ barrel and 6-round magazines, made for deep concealment and pocket carry. Function-test the .380 ACP load you plan to carry before you rely on it.

${SHIPS_FFL}`,
  },
  "ati-milsport-9mm-pistol": {
    s: "ATI Milsport 9mm AR pistol: 5.5″ barrel, flash can, M-LOK handguard and blade pistol brace. Ships to your local FFL dealer.",
    d: `An AR-pattern pistol in 9mm: the familiar AR controls and ergonomics with a short 5.5″ barrel, a flash can, an M-LOK handguard for lights and grips, and a blade-style pistol brace. Cheap to shoot and easy to handle.

${SHIPS_FFL}`,
  },

  // Ammunition
  "federal-hst-9mm-124": {
    t: "Federal HST 9mm 124gr JHP Self-Defense Ammo",
    s: "Federal HST 9mm 124-grain JHP: 1,150 fps, nickel-plated cases, the law-enforcement duty load for carry and home defense. 20-round boxes.",
    d: `Federal's HST is the duty load chosen by law-enforcement agencies around the world, and this is the standard-pressure 9mm version: a 124-grain jacketed hollow point at 1,150 fps from a 4″ test barrel.

Its hollow point is designed not to plug as it passes through barriers such as heavy clothing, and the jacket and core hold together for nearly full weight retention. Nickel-plated cases and a high-performance primer help reliable feeding in semi-automatic pistols. Federal part P9HST1S, 20 rounds per box.`,
  },
  "speer-gold-dot-9mm-124": {
    t: "Speer Gold Dot 9mm 124gr GDHP Defense Ammo",
    s: "Speer Gold Dot 9mm 124-grain bonded hollow point: 1,150 fps, nickel cases, sealed primers. A benchmark carry and duty load. 20-round boxes.",
    d: `Speer Gold Dot is the original bonded defensive bullet and a benchmark for both self-defense and duty use. Its core is bonded to the jacket so the bullet holds together on impact, retaining weight and penetrating to useful depth, and the hollow point expands consistently through common barriers.

This 9mm load fires a 124-grain bullet at 1,150 fps from a 4″ test barrel. Nickel-plated brass and sealed primers help reliable ignition and cycling. Speer part 23618GD, 20 rounds per box.`,
  },
  "hornady-critical-defense-9mm": {
    s: "Hornady Critical Defense 9mm 115gr FTX: a flex-tip hollow point that resists clogging, for concealed carry and home defense.",
    d: `Hornady Critical Defense uses the FTX bullet — a hollow point with a soft polymer tip that keeps it from plugging with clothing and helps it expand reliably. The 115-grain 9mm load is a popular choice for compact carry pistols.`,
  },
  "winchester-target-9mm-115-fmj": {
    t: "Winchester 9mm 115gr FMJ Bulk Range Ammo",
    s: "Winchester Target & Practice 9mm 115gr FMJ: reliable brass-cased range ammo, from 50 rounds up to bulk 1,000-round cases. Priced per round.",
    d: `The "white box" Winchester 9mm: 115-grain full metal jacket in brass cases, made for practice, qualification and plinking. It is consistent, clean-running and reloadable, and buying a larger pack brings the price per round down.`,
  },
  "winchester-defender-9mm-pdx1": {
    s: "Winchester Defender 9mm +P 124gr PDX1 bonded JHP: a bonded hollow point for consistent expansion and weight retention. For defense.",
    d: `Winchester's Defender line uses the PDX1 bonded jacketed hollow point, built to expand consistently and hold its weight through barriers. This 9mm +P load fires a 124-grain bullet; make sure your pistol is rated for +P ammunition.`,
  },
  "hornady-american-gunner-9mm": {
    s: "Hornady American Gunner 9mm +P 124gr XTP: an affordable hollow point for practice with a defensive bullet. Brass cases.",
    d: `American Gunner loads Hornady's XTP hollow point — known for controlled expansion and deep penetration — at a price that lets you practice with the bullet you carry. 124 grains, +P pressure; confirm your pistol is rated for +P.`,
  },
  "g2-research-rip-9mm": {
    s: "G2 Research R.I.P. 9mm 92gr: a lightweight copper hollow point designed to fragment on impact. 20-round boxes.",
    d: `The G2 Research R.I.P. (Radically Invasive Projectile) is a lightweight 92-grain solid-copper hollow point machined so its petals separate on impact. A distinctive defensive load for 9mm pistols.`,
  },
  "imi-9mm-115-jhp": {
    s: "IMI 9mm 115gr JHP: an affordable jacketed hollow point from Israel Military Industries for carry and home defense practice.",
    d: `A straightforward 115-grain jacketed hollow point from IMI, the Israeli manufacturer known for military-grade ammunition. A budget-friendly way to keep hollow points on hand and confirm they feed in your pistol.`,
  },
  "hornady-american-gunner-357": {
    s: "Hornady American Gunner .357 Magnum 125gr XTP: a hollow point for revolvers and lever guns, for defense, training and hunting small game.",
    d: `A 125-grain XTP hollow point in .357 Magnum from Hornady's American Gunner line. The XTP gives controlled expansion and good penetration, making this a versatile load for revolvers and .357 lever-action rifles.`,
  },
  "norma-357-158-fmj": {
    s: "Norma Range & Training .357 Magnum 158gr FMJ: affordable full metal jacket range ammo for .357 revolvers and lever guns.",
    d: `Norma's Range & Training line in .357 Magnum: a 158-grain full metal jacket load for practice and plinking with revolvers and lever-action rifles.`,
  },
  "federal-punch-38-special": {
    s: "Federal Punch .38 Special +P 120gr JHP: a defensive hollow point designed for short-barrel revolvers. Confirm your revolver is +P rated.",
    d: `Federal Punch is built for everyday carry, with a jacketed hollow point designed to expand from short barrels — ideal for snub-nose .38 revolvers. This load is +P, so check that your revolver is rated for it.`,
  },
  "cci-big4-38-special": {
    s: "CCI Big 4 .38 Special shotshell: large #4 shot for snakes and pests at close range from a revolver.",
    d: `CCI's Big 4 shotshells load large #4 shot into a .38 Special case for snakes and small pests at very close range. Not intended for self-defense or for semi-automatic pistols that may not cycle them.`,
  },
  "cci-shotshell-45-acp": {
    s: "CCI Shotshell .45 ACP: a shot load for snakes and pests at close range. Built for pest control, not defense.",
    d: `A .45 ACP shotshell from CCI for dispatching snakes and small pests at close range. Shot loads may not cycle every semi-automatic pistol, so expect to cycle the slide by hand.`,
  },
  "hornady-whitetail-350-legend": {
    s: "Hornady American Whitetail 350 Legend 170gr InterLock: a proven deer load for straight-wall-cartridge states. Priced per round.",
    d: `The American Whitetail line pairs Hornady's InterLock bullet, which keeps core and jacket together for deep penetration, with affordable pricing. This 170-grain 350 Legend load suits deer hunting in states that require straight-wall cartridges.`,
  },
  "hornady-whitetail-450-bushmaster": {
    s: "Hornady American Whitetail 450 Bushmaster 245gr InterLock: a heavy straight-wall deer load for AR-15 and bolt rifles.",
    d: `A 245-grain InterLock soft point in 450 Bushmaster for deer and similar game at moderate ranges. Popular in AR-15 uppers and bolt-action rifles chambered for this straight-wall cartridge.`,
  },
  "winchester-deer-season-30-30": {
    s: "Winchester Deer Season XP 30-30 Win 150gr Extreme Point: a big-tipped bullet for fast expansion on deer. For lever-action rifles.",
    d: `Deer Season XP uses Winchester's Extreme Point bullet with a large polymer tip for rapid expansion on deer-sized game. This 150-grain 30-30 load is made for lever-action rifles.`,
  },
  "winchester-power-point-270": {
    s: "Winchester Power-Point .270 Win 150gr: a classic soft point hunting load for deer and similar big game.",
    d: `Power-Point is Winchester's long-running soft point hunting load. In .270 Winchester with a 150-grain bullet, it is a dependable choice for deer, antelope and similar game.`,
  },
  "atomic-308-subsonic": {
    s: "Atomic Match Subsonic .308 Win 175gr Sierra MatchKing: quiet, accurate subsonic ammo for suppressed .308 rifles.",
    d: `Atomic's subsonic .308 Winchester load uses the accurate Sierra MatchKing hollow point at subsonic velocity, so it pairs well with a suppressor. Expect a much lower trajectory than full-power .308 — zero accordingly.`,
  },
  "hornady-superformance-204": {
    s: "Hornady Superformance Varmint .204 Ruger 40gr V-MAX: a fast, flat-shooting varmint and predator load.",
    d: `Superformance propellants push bullets faster than standard loads. This .204 Ruger round fires a 40-grain V-MAX polymer-tipped bullet for flat trajectories and rapid expansion on varmints and small predators.`,
  },
  "fiocchi-shooting-dynamics-12ga": {
    s: "Fiocchi Shooting Dynamics 12 gauge target loads for trap, skeet, sporting clays and practice. Sold by the box or case.",
    d: `Fiocchi Shooting Dynamics is an affordable 12-gauge target load for clay games and practice, with consistent patterns round to round. Buy a case to bring the per-shell price down.`,
  },
  "fiocchi-speed-steel-12ga": {
    s: "Fiocchi Flyway Steel 12 gauge: non-toxic steel shot for waterfowl hunting where lead is not allowed.",
    d: `Steel shot is required for waterfowl in the United States, and Fiocchi's Flyway Steel 12-gauge load is made for ducks and geese. Check your regulations and choke recommendations before you hunt.`,
  },
  "hornady-critical-defense-12ga": {
    s: "Hornady Critical Defense 12 gauge 00 buckshot: tight-patterning buckshot for home defense shotguns.",
    d: `A home-defense 12-gauge load from Hornady's Critical Defense line, loaded with 00 buckshot for tight, consistent patterns at indoor distances. Pattern it in your own shotgun before relying on it.`,
  },
  "winchester-super-x-22lr": {
    s: "Winchester Super-X .22 LR shot: a tiny shot load for rimfire snake and pest control at very close range.",
    d: `A .22 LR shot cartridge from Winchester's Super-X line for snakes and pests at very short range, typically from a smoothbore or revolver. It will not cycle most semi-automatic rimfires.`,
  },
  "eley-benchrest-22lr": {
    s: "Eley Semi-Auto Benchrest .22 LR 40gr: match-grade rimfire tuned for consistent accuracy in semi-automatic rifles.",
    d: `Eley is a name in competitive rimfire shooting, and Semi-Auto Benchrest is tuned for consistent accuracy while reliably cycling semi-automatic actions. A 40-grain round nose for matches and serious target work.`,
  },
  "norma-tac-22": {
    s: "Norma TAC-22 .22 LR 40gr: reliable, affordable rimfire for training and plinking in rifles and pistols. Bulk packs available.",
    d: `Norma TAC-22 is a 40-grain lead round nose built for training: consistent, clean and inexpensive, so you can shoot a lot of it. Buy the larger pack for the best price per round.`,
  },
  "cci-shotshell-22lr": {
    s: "CCI Shotshell .22 LR 31gr: a #12 shot load for snakes and pests at very close range.",
    d: `CCI's .22 LR shotshell carries fine shot for snakes and small pests at very close range. Like other shot loads, it may not cycle a semi-automatic action.`,
  },
  "hornady-critical-defense-22wmr": {
    s: "Hornady Critical Defense .22 WMR 45gr FTX: a defensive load for .22 Magnum revolvers and pistols.",
    d: `Critical Defense in .22 Winchester Magnum Rimfire uses a 45-grain FTX flex-tip bullet tuned to expand from short barrels — a sensible choice if your carry gun is a .22 Magnum.`,
  },
  "aguila-super-extra-22lr": {
    s: "Aguila Super Extra High Velocity .22 LR 40gr: low-cost, high-velocity rimfire for plinking and small game.",
    d: `Aguila Super Extra is one of the most affordable high-velocity .22 LR loads, with a 40-grain lead round nose that cycles most semi-automatic rimfires. Great for plinking in bulk.`,
  },
  "winchester-super-x-22-hornet": {
    s: "Winchester Super-X .22 Hornet 46gr JHP: a classic varmint cartridge load for small game and pests.",
    d: `The .22 Hornet is a quiet, mild-recoiling centerfire varmint cartridge. This Super-X load fires a 46-grain jacketed hollow point for small game and pests at modest ranges.`,
  },

  // FRT triggers
  "frt-15l3": {
    t: "Rare Breed FRT-15L3 Forced Reset Trigger",
    s: "Rare Breed FRT-15L3 single-stage forced reset trigger for Mil-Spec AR-15 lowers: 3-position ambi selector, anti-walk pins. Made in USA.",
    d: `The FRT-15L3 is Rare Breed's current drop-in forced reset trigger for Mil-Spec AR-15 lowers. A 3-position ambidextrous selector switches between safe, semi-automatic and forced reset. In forced reset mode the trigger is pushed forward after each shot and locked until the bolt carrier returns to battery; every pull fires one round.

It is single-stage in both modes — about 4–4.5 lb in semi and 5.5–6 lb in FRT — and built from 7075 anodized aluminum and heat-treated 4140 steel. Rare Breed specifies a full-auto-profile (M16) bolt carrier group and recommends an H2 or H3 buffer (or an A5 system); it may not fit some Colt or other lowers with a sear block. Anti-walk pins, selector levers and Torx tools are in the box.`,
  },
  "rare-breed-frt-15l3-flat": {
    t: "Rare Breed FRT-15L3 Flat Forced Reset Trigger",
    s: "Rare Breed FRT-15L3 with a flat trigger shoe: single-stage forced reset trigger for Mil-Spec AR-15 lowers, 3-position ambi selector. Made in USA.",
    d: `The flat-shoe version of Rare Breed's FRT-15L3. Same drop-in forced reset mechanism and 3-position ambidextrous selector (safe, semi, FRT); the flat face gives a consistent finger position and a straighter press.

Single-stage in both modes, about 4–4.5 lb in semi and 5.5–6 lb in FRT. Requires a full-auto-profile (M16) bolt carrier group; H2 or H3 buffer recommended. Anti-walk pins and tools included.`,
  },
  "rare-breed-frt-15c3": {
    t: "Rare Breed FRT-15C3 Two-Stage Forced Reset Trigger",
    s: "Rare Breed FRT-15C3: a forced reset trigger with a two-stage semi mode for Mil-Spec AR-15 lowers. 3-position ambi selector, made in USA.",
    d: `The FRT-15C3 is the two-stage member of Rare Breed's line: in semi-automatic mode it breaks like a two-stage trigger — take-up, then a defined wall — while forced reset mode stays single-stage. The 3-position ambidextrous selector switches between safe, semi and FRT.

Drops into Mil-Spec AR-15 lowers with the included anti-walk pins. Requires a full-auto-profile (M16) bolt carrier group; H2 or H3 buffer recommended.`,
  },
  "rare-breed-frt-15": {
    s: "Rare Breed FRT-15: the original forced reset trigger for AR-15 lowers. Rare Breed's current models are the FRT-15L3 and FRT-15C3.",
    d: `The original Rare Breed FRT-15 forced reset trigger for AR-15 pattern lowers. Rare Breed's current production models are the FRT-15L3 and FRT-15C3, which add a 3-position selector; compare them before you buy.

One round per trigger pull, with the trigger mechanically reset after each shot. Gunsmith installation recommended.`,
  },
  "rare-breed-frt-15-e3": {
    s: "Rare Breed FRT-15 E3 forced reset trigger for AR-15 pattern lowers. Compare with the current FRT-15L3 before you buy.",
    d: `An earlier Rare Breed forced reset trigger for AR-15 pattern lowers. Compare it with the current FRT-15L3 and FRT-15C3, which add a 3-position safe/semi/FRT selector.

One round per trigger pull, with the trigger mechanically reset after each shot. Gunsmith installation recommended.`,
  },
  "frt-15l2": {
    s: "FRT-15L2 forced reset trigger for AR-15 pattern lowers. One round per pull; gunsmith installation recommended.",
    d: `A forced reset trigger for AR-15 pattern lowers. One round per trigger pull, with the trigger mechanically reset after each shot. Confirm fit with your lower and bolt carrier, and have a gunsmith install it if you are unsure.`,
  },
  "wot-trigger": {
    s: "WOT Wide Open Trigger: a forced reset trigger for AR-15 pattern lowers. Check fit and state law before ordering.",
    d: `The WOT (Wide Open Trigger) is a forced reset trigger for AR-15 pattern lowers. One round per pull, with a mechanical reset after each shot. Rebuild parts are sold separately.`,
  },
  "pbg-alamo-15": {
    s: "PBG Alamo-15 forced reset trigger for AR-15 pattern lowers. One round per pull; gunsmith installation recommended.",
    d: `The Alamo-15 from PBG is a forced reset trigger for AR-15 pattern lowers. One round per trigger pull, with the trigger mechanically reset after each shot.`,
  },
  "para-15": {
    s: "Para-15 forced reset trigger for AR-15 pattern lowers. One round per pull; check fit and your state's law before ordering.",
    d: `A forced reset trigger for AR-15 pattern lowers. One round per trigger pull, with the trigger mechanically reset after each shot. Gunsmith installation recommended.`,
  },

  // Parts & accessories
  "recover-tactical-p-ix": {
    s: "Recover Tactical P-IX chassis for Glock 17, 19 and more: adds rails and ambidextrous controls with no gunsmithing. Read the NFA notice.",
    d: `The P-IX is a polymer chassis that a compatible Glock drops into without tools or gunsmithing, adding Picatinny rails for lights and optics plus ambidextrous controls. Check Recover's compatibility list for your exact model.

Read the NFA notice below before adding a stock: a pistol with a barrel under 16″ in a chassis with a shoulder stock is a short-barreled rifle that needs an approved ATF Form 1 first.`,
  },
  "slide-fire-ssar-15": {
    s: "Slide Fire SSAR-15 OGR bump-fire stock for AR-15 pattern rifles. Restricted in some states — check local law before ordering.",
    d: `The Slide Fire SSAR-15 OGR is a bump-fire stock for AR-15 pattern rifles. It is restricted in some states and localities, so confirm it is legal where you live before you order.`,
  },
  "ssar-15-mod": {
    s: "Slide Fire SSAR-15 MOD bump-fire stock for AR-15 pattern rifles, MOD profile. Restricted in some states — check local law.",
    d: `The MOD-profile version of the Slide Fire SSAR-15 bump-fire stock for AR-15 pattern rifles. It is restricted in some states and localities, so confirm it is legal where you live before you order.`,
  },
  "wot-rebuild-kit": {
    s: "WOT trigger rebuild kit: replacement springs, pins and wear parts to keep a WOT forced reset trigger running.",
    d: `Replacement springs, pins and wear parts for WOT triggers. Keep a kit on hand for routine maintenance or to restore a trigger that has seen a lot of rounds.`,
  },
};

function withCopy(p: Product): Product {
  const c = COPY[p.slug];
  return c ? { ...p, summary: c.s, description: c.d, metaTitle: c.t } : p;
}

export const products: Product[] = baseProducts.map(withCopy);

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function productsIn(category: CategoryId | "all") {
  return category === "all"
    ? products
    : products.filter((p) => p.category === category);
}

export const trending = products.filter((p) => p.trending);

export function related(p: Product, n = 4) {
  return products
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .sort((a, b) =>
      a.type === p.type && b.type !== p.type ? -1 : b.type === p.type && a.type !== p.type ? 1 : 0
    )
    .slice(0, n);
}

/** Category tiles for the Categories screen (category + optional type filter). */
export const categoryTiles: {
  label: string;
  category: CategoryId;
  type?: string;
  image: string;
}[] = [
  { label: "Full-size pistols", category: "handguns", type: "full-size", image: H + "glock-17-gen6.png" },
  { label: "Compact pistols", category: "handguns", type: "compact", image: H + "glock-19-gen6.png" },
  { label: "Carry pistols", category: "handguns", type: "carry", image: H + "sig-p365-xl.jpg" },
  { label: "PCC & AR pistols", category: "handguns", type: "pcc", image: H + "ati-milsport-9mm.jpg" },
  { label: "Handgun ammo", category: "ammunition", type: "handgun", image: A + "winchester-target-9mm.jpg" },
  { label: "Rifle ammo", category: "ammunition", type: "rifle", image: A + "hornady-whitetail-350-legend.jpg" },
  { label: "Shotgun shells", category: "ammunition", type: "shotgun", image: A + "fiocchi-shooting-dynamics-12ga.webp" },
  { label: "Rimfire", category: "ammunition", type: "rimfire", image: A + "eley-benchrest-22lr.jpg" },
  { label: "FRT triggers", category: "triggers", image: T + "rare-breed-frt-15l3.jpg" },
  { label: "Parts & kits", category: "parts", image: P + "recover-pix-kit.jpg" },
];

export function shopHref(category: CategoryId | "all", type?: string) {
  return `/shop/${category}${type ? `?type=${type}` : ""}`;
}

/* ── Demo orders (placeholder) ───────────────────────────────────────── */

export type OrderStatus = "placed" | "shipped" | "at-ffl" | "complete" | "cancelled";

export type OrderItem = {
  slug: string;
  qty: number;
  rounds?: number;
  /** Snapshot at time of order (present for orders stored in Supabase). */
  name?: string;
  image?: string;
  unitPrice?: number;
  ffl?: boolean;
};

export type Order = {
  id: string;
  date: string; // ISO
  status: OrderStatus;
  items: OrderItem[];
  ffl?: { name: string; address: string };
  carrier: string;
  tracking: string;
  events: { status: OrderStatus; at: string | null; note?: string | null }[];
  email?: string;
  subtotal?: number;
  shipping?: number;
  total?: number;
  billing?: { name: string; line1: string; city: string; state: string; zip: string; phone?: string };
  payment?: "card" | "ach";
  delivery?: "standard" | "express";
};

export type Dealer = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  licenseNo?: string | null;
  phone?: string | null;
  email?: string | null;
  transferFee?: number | null;
  active?: boolean;
};

// PLACEHOLDER dealers used until Supabase is connected (seeded into the DB by db:seed).
export const demoDealers: Dealer[] = [
  { id: "ffl-1", name: "Demo Dealer — Range & Supply", address: "100 Sample Ave", city: "Austin", state: "TX", zip: "78701" },
  { id: "ffl-2", name: "Demo Dealer — Gunsmith Co.", address: "220 Example St", city: "Round Rock", state: "TX", zip: "78664" },
  { id: "ffl-3", name: "Demo Dealer — Outdoor Outfitters", address: "48 Placeholder Rd", city: "Cedar Park", state: "TX", zip: "78613" },
];

export function dealerAddress(d: Pick<Dealer, "address" | "city" | "state" | "zip">) {
  return `${d.address}, ${d.city}, ${d.state} ${d.zip}`;
}

/** Nearest-ZIP-first ordering (shared leading digits). Runs in the browser, so
 *  the dealer list can be one static, CDN-cached response. */
export function sortDealersByZip<T extends Pick<Dealer, "zip">>(list: T[], zip?: string): T[] {
  const z = (zip ?? "").replace(/\D/g, "").slice(0, 5);
  if (!z) return list;
  const score = (d: string) => {
    let i = 0;
    while (i < Math.min(d.length, z.length) && d[i] === z[i]) i++;
    return i;
  };
  return [...list].sort((a, b) => score(b.zip) - score(a.zip));
}

export const demoOrders: Order[] = [
  {
    id: "CB10482",
    date: "2026-11-14T15:15:00Z",
    status: "shipped",
    items: [
      { slug: "glock-19-gen5-fde", qty: 1 },
      { slug: "winchester-target-9mm-115-fmj", qty: 1, rounds: 500 },
    ],
    ffl: { name: "Sample FFL Dealer (demo)", address: "123 Example Rd, Austin, TX 78701" },
    carrier: "UPS",
    tracking: "1Z0000000000000000",
    events: [
      { status: "placed", at: "2026-11-14T15:15:00Z" },
      { status: "shipped", at: "2026-11-15T18:30:00Z" },
      { status: "at-ffl", at: null },
      { status: "complete", at: null },
    ],
  },
  {
    id: "CB10317",
    date: "2026-10-28T12:02:00Z",
    status: "complete",
    items: [{ slug: "norma-tac-22", qty: 2, rounds: 500 }],
    carrier: "FedEx",
    tracking: "000000000000",
    events: [
      { status: "placed", at: "2026-10-28T12:02:00Z" },
      { status: "shipped", at: "2026-10-29T09:10:00Z" },
      { status: "at-ffl", at: "2026-10-31T13:45:00Z" },
      { status: "complete", at: "2026-10-31T16:20:00Z" },
    ],
  },
];

export function getOrder(id: string) {
  return demoOrders.find((o) => o.id === id);
}
