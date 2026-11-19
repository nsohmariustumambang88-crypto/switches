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
  description: string;
  specs: [string, string][];
  packs?: Pack[];
  /** Firearm: ships to an FFL dealer for transfer. */
  ffl?: boolean;
  /** Compliance notice shown on the product page and in the cart. */
  notice?: string;
  trending?: boolean;
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
  },
  {
    id: "triggers",
    name: "FRT Triggers",
    short: "Triggers",
    blurb: "Forced-reset triggers for AR-15 lowers",
    types: [{ id: "frt", name: "Forced reset" }],
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
      ["Casing", shot ? "Hull" : "Brass"],
    ],
    packs: p,
    notice: AMMO_NOTICE,
    trending: a.trending,
  };
}

export const products: Product[] = [
  // ── Handguns ───────────────────────────────────────────────────────────
  glock({ slug: "glock-17-gen5", name: "Glock 17 Gen5", model: "17", type: "full-size", caliber: "9mm", capacity: 17, barrel: "4.49″", price: 599, image: "glock-17-gen5.jpg", trending: true, rating: 4.9, reviews: 412 }),
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
  ...(
    [
      ["rare-breed-frt-15", "Rare Breed FRT-15", "Rare Breed", 380, "rare-breed-frt-15.webp", true, 4.8, 210],
      ["rare-breed-frt-15-e3", "Rare Breed FRT-15 E3", "Rare Breed", 399, "rare-breed-frt-15-e3.jpeg", true, 4.8, 96],
      ["frt-15l3", "FRT-15L3 Forced Reset Trigger", "Rare Breed", 399, "frt-15l3.webp", false, 4.7, 64],
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
  { label: "Full-size pistols", category: "handguns", type: "full-size", image: H + "glock-17-gen5.jpg" },
  { label: "Compact pistols", category: "handguns", type: "compact", image: H + "glock-19-gen5-fde.jpg" },
  { label: "Carry pistols", category: "handguns", type: "carry", image: H + "glock-43x-pvd.jpg" },
  { label: "PCC & AR pistols", category: "handguns", type: "pcc", image: H + "ati-milsport-9mm.jpg" },
  { label: "Handgun ammo", category: "ammunition", type: "handgun", image: A + "winchester-target-9mm.jpg" },
  { label: "Rifle ammo", category: "ammunition", type: "rifle", image: A + "hornady-whitetail-350-legend.jpg" },
  { label: "Shotgun shells", category: "ammunition", type: "shotgun", image: A + "fiocchi-shooting-dynamics-12ga.webp" },
  { label: "Rimfire", category: "ammunition", type: "rimfire", image: A + "eley-benchrest-22lr.jpg" },
  { label: "FRT triggers", category: "triggers", image: T + "rare-breed-frt-15.webp" },
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
  billing?: { name: string; line1: string; city: string; state: string; zip: string };
  payment?: "card" | "ach";
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
