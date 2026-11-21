/**
 * /learn guides: types, pillars, authors and the built-in starter guides.
 *
 * The built-in guides seed the Supabase `articles` table (npm run db:seed) and
 * serve the site in demo mode. Once Supabase is connected, guides are written
 * and edited in Admin → Learn and published without a deploy.
 *
 * Facts come from the manufacturers' own pages (cited under each guide) as of
 * November 2026. Legal pages (state laws) are intentionally not included yet.
 * Keep this module import-free (type imports only): scripts/db-seed.mjs loads it
 * with Node's TypeScript stripping.
 */
import type { CategoryId } from "./catalog";

export type PillarId = "buying-online" | "handguns" | "ammo" | "triggers" | "reference" | "updates";

export type Pillar = {
  id: PillarId;
  name: string;
  blurb: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** Store department this pillar links to (and pulls related guides for). */
  category?: CategoryId;
  /** Show a not-legal-advice note on guides in this pillar. */
  legalNote?: boolean;
};

export type Author = {
  slug: string;
  name: string;
  kind: "person" | "team";
  role: string;
  bio: string;
  credentials?: string;
  url?: string;
};

export type Source = { label: string; url: string };
export type ChangeEntry = { date: string; note: string };

export type Article = {
  id?: string;
  slug: string;
  pillar: PillarId;
  title: string;
  /** Search title (≤ 55 chars; the store name is appended). */
  metaTitle?: string;
  /** Meta description and card summary (≤ 155 chars). */
  description: string;
  /** Markdown — see src/lib/markdown.ts for what is supported. */
  body: string;
  cover?: string;
  coverAlt?: string;
  author: string;
  /** Named reviewer (e.g. an attorney or armorer) — only when someone real has reviewed it. */
  reviewer?: string;
  reviewedAt?: string;
  sources: Source[];
  changelog: ChangeEntry[];
  relatedProducts: string[];
  status: "draft" | "published";
  publishedAt: string;
  /** Changes only when the content changes (drives dateModified and sitemap lastmod). */
  updatedAt: string;
};

export const pillars: Pillar[] = [
  {
    id: "buying-online",
    name: "Buying online",
    blurb: "FFL transfers, age rules, shipping and what to expect",
    metaTitle: "How Buying Guns & Ammo Online Works",
    metaDescription:
      "Step-by-step guides to buying a handgun online: choosing an FFL dealer, Form 4473, the background check, transfer fees, ages and adult-signature delivery.",
    intro:
      "Buying a handgun online is simple once you know the steps: the pistol ships to a licensed dealer near you, and you complete the paperwork and background check there. These guides walk through each part of the process.",
    category: "handguns",
    legalNote: true,
  },
  {
    id: "handguns",
    name: "Handguns",
    blurb: "Model comparisons, generations and compatibility",
    metaTitle: "Handgun Guides: Glock & SIG P365 Compared",
    metaDescription:
      "Glock Gen6 vs V vs Gen5, SIG P365 vs P365-XL vs XMACRO, and which magazines fit which pistol — practical guides built from the manufacturers' specs.",
    intro:
      "Which Glock generation should you buy, which P365 fits your hand, and which magazines swap between models? These guides compare pistols on the specs their makers publish.",
    category: "handguns",
  },
  {
    id: "ammo",
    name: "Ammunition",
    blurb: "Defensive loads, grain weights and price per round",
    metaTitle: "Ammo Guides: 9mm Defensive & Range Ammo",
    metaDescription:
      "Compare 9mm defensive loads like Federal HST and Speer Gold Dot, learn FMJ vs JHP and grain weights, and work out the real price per round.",
    intro:
      "The right ammunition depends on the job: cheap full metal jacket for practice, proven hollow points for carry. These guides compare loads on the data their makers publish.",
    category: "ammunition",
  },
  {
    id: "triggers",
    name: "Triggers",
    blurb: "How forced reset triggers work, fit and models",
    metaTitle: "Forced Reset Trigger (FRT) Guides",
    metaDescription:
      "What a forced reset trigger is, how it differs from binary and standard triggers, what your AR-15 needs to run one, and Rare Breed FRT-15L3 vs FRT-15C3.",
    intro:
      "Forced reset triggers are popular and often misunderstood. These guides explain how they work, what your rifle needs, and how the current Rare Breed models differ. Always check your state's law before you buy.",
    category: "triggers",
    legalNote: true,
  },
  {
    id: "reference",
    name: "Glossary",
    blurb: "Plain-English definitions of the terms we use",
    metaTitle: "Firearms Glossary & Reference",
    metaDescription: "Plain-English definitions of FFL, Form 4473, NICS, MOS, RMSc, GMB, FRT, BCG, JHP, +P and the other terms on our product pages.",
    intro: "Short, plain-English definitions of the terms you'll see on product pages and in our guides.",
  },
  {
    id: "updates",
    name: "Updates",
    blurb: "Dated news on products and rules that affect buyers",
    metaTitle: "Firearm Product & Rule Updates",
    metaDescription: "Dated updates on new models, discontinued products and rule changes that affect what you can buy — each linked to the guide it changes.",
    intro: "Dated notes on new models, discontinued products and rule changes. Each update links to the guide it affects.",
  },
];

export const authors: Author[] = [
  {
    slug: "editorial-team",
    name: "Editorial team",
    kind: "team",
    role: "Writers and product specialists",
    bio: "Our guides are written by the store's product team from manufacturers' published specifications and our own stock. We list our sources under every guide and date every change. Replace this profile with the real writers' names and credentials before launch.",
  },
];

const D = "2026-11-20";
const S = {
  glock19g6: { label: "GLOCK — G19 Gen6 technical data", url: "https://us.glock.com/products/commercial-firearms/pistols/g19-gen6" },
  glock17g6: { label: "GLOCK — G17 Gen6 technical data", url: "https://us.glock.com/products/commercial-firearms/pistols/g17-gen6" },
  glock19v: { label: "GLOCK — G19 V technical data", url: "https://us.glock.com/products/commercial-firearms/pistols/g19-v" },
  glock17v: { label: "GLOCK — G17 V technical data", url: "https://us.glock.com/products/commercial-firearms/pistols/g17-v" },
  glock43xmos: { label: "GLOCK — G43X MOS technical data", url: "https://us.glock.com/products/commercial-firearms/pistols/g43x-mos" },
  vSeries: { label: "GunsAmerica — Glock confirms V series", url: "https://gunsamerica.com/digest/glock-confirms-v-series" },
  rbL3: { label: "Rare Breed Triggers — FRT-15L3", url: "https://rarebreedtriggers.com/product/frt-15l3-2/" },
  rbC3: { label: "Rare Breed Triggers — FRT-15C3", url: "https://rarebreedtriggers.com/product/frt-15c3/" },
  rbDomains: { label: "Rare Breed Triggers — protected domains", url: "https://rarebreedtriggers.com/protecteddomains/" },
  doj: {
    label: "U.S. Department of Justice — settlement with Rare Breed (May 2025)",
    url: "https://www.justice.gov/opa/pr/department-justice-announces-settlement-litigation-between-federal-government-and-rare-breed",
  },
  hst: { label: "Federal — Personal Defense HST 9mm 124gr (P9HST1S)", url: "https://www.federalpremium.com/handgun/personal-defense-hst/11-P9HST1S.html" },
  goldDot: { label: "Speer — Gold Dot 9mm 124gr (23618GD)", url: "https://www.speer.com/ammunition/gold-dot/gold-dot-handgun-personal-protection/19-23618GD.html" },
  p365: { label: "SIG SAUER — P365 (optic ready)", url: "https://www.sigsauer.com/p365-optic-ready.html" },
  p365xl: { label: "SIG SAUER — P365-XL", url: "https://www.sigsauer.com/p365-xl.html" },
  p365xm: { label: "SIG SAUER — P365-XMACRO", url: "https://www.sigsauer.com/p365-xmacro-1.html" },
  gunGenius: { label: "GunBroker Gun Genius — top-selling handguns of 2025", url: "https://genius.gunbroker.com/top-selling/guns/the-top-selling-handguns-of-2025/" },
  ecfrAge: { label: "27 CFR 478.99 — prohibited sales (age limits)", url: "https://www.ecfr.gov/current/title-27/chapter-II/subchapter-B/part-478/subpart-F/section-478.99" },
  nics: { label: "FBI — National Instant Criminal Background Check System", url: "https://www.fbi.gov/how-we-can-help-you/more-fbi-services-and-information/nics" },
  atf: { label: "ATF — firearms", url: "https://www.atf.gov/firearms" },
};

const first: ChangeEntry[] = [{ date: D, note: "First published." }];

export const builtinArticles: Article[] = [
  {
    slug: "glock-gen6-vs-v-vs-gen5",
    pillar: "handguns",
    title: "Glock Gen6 vs V vs Gen5: what changed and which to buy",
    metaTitle: "Glock Gen6 vs V vs Gen5: Differences Explained",
    description:
      "Glock now builds Gen6 and V pistols. Compare the G19 and G17 Gen6, V and Gen5 on grip, optics, trigger and weight, and see which one fits you.",
    author: "editorial-team",
    sources: [S.glock19g6, S.glock17g6, S.glock19v, S.glock17v, S.vSeries],
    changelog: first,
    relatedProducts: ["glock-19-gen6", "glock-19-v", "glock-17-gen6", "glock-17-v", "glock-19-gen5-mos", "glock-17-gen5"],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## The short answer

- **Gen6** is Glock's new grip and optics platform: a palm swell, a thumb rest, a new grip texture, a factory optic-ready system and a flat-faced trigger.
- **V** keeps the familiar Gen5-style grip without finger grooves and adds interchangeable backstraps, the GLOCK Marksman Barrel (GMB), an nDLC finish, front serrations, an ambidextrous slide stop and a reversible magazine catch.
- **Gen5** is being replaced. Glock confirmed in October 2025 that it was retiring much of its lineup in favor of the V series, so Gen5 pistols are now remaining stock.

If you want a red dot from day one or have large hands, start with Gen6. If you like the Gen5 feel and want to tune the grip with backstraps, choose V. If you want the proven design at the lowest price, buy Gen5 while stock lasts.

## Glock 19: Gen6 vs V

Both are the same compact size, with a 4.02″ barrel and 15-round magazines. The numbers below are from Glock's US technical data.

| | G19 Gen6 | G19 V |
|---|---|---|
| Barrel | 4.02″ | 4.02″ |
| Standard magazine | 15 rounds | 15 rounds |
| Optional magazines listed by Glock | — | 17, 24, 31, 33 |
| Weight without magazine | 20.11 oz | 21.52 oz |
| Overall length | 7.28″ | 7.28″ |
| Width | 1.35″ | 1.34″ |
| Height with magazine | 5.04″ | 5.04″ |
| Trigger distance | 2.68″ | 2.76″ |
| Grip | Palm swell, thumb rest, Gen6 texture | No finger grooves, interchangeable backstraps |
| Optics | Optic-ready system standard | Not on the standard model |

The Gen6's shorter trigger distance (68 mm against 70 mm) and its palm swell are the changes you notice first in the hand.

## Glock 17: Gen6 vs V

| | G17 Gen6 | G17 V |
|---|---|---|
| Barrel | 4.49″ | 4.49″ |
| Standard magazine | 17 rounds | 17 rounds |
| Optional magazines listed by Glock | — | 19, 24, 31, 33 |
| Weight without magazine | 21.16 oz | 20.81 oz |
| Overall length | 7.95″ | 7.95″ |
| Height with magazine | 5.47″ | 5.47″ |
| Trigger distance | 2.68″ | 2.76″ |

The G17 V adds a flared magwell and a cutout at the front of the frame for faster reloads.

## Which should you buy?

1. **You want a red dot now.** Gen6 comes optic-ready from the factory. See the [Glock 19 Gen6](/product/glock-19-gen6) and [Glock 17 Gen6](/product/glock-17-gen6).
2. **You like the Gen5 grip and want to adjust it.** The V series adds backstraps and ambidextrous controls. See the [Glock 19 V](/product/glock-19-v) and [Glock 17 V](/product/glock-17-v).
3. **You want the lowest price on a proven pistol.** Remaining Gen5 stock, such as the [Glock 19 Gen5 MOS](/product/glock-19-gen5-mos), is the classic design with an optic cut.

## Holsters and accessories

Gen6 changes the grip shape and the optic system, so holster and optic-mount makers are updating their fit lists. Before you carry a Gen6, make sure your holster maker lists the exact model and generation. Magazines are covered in [Do Glock 17 magazines fit a Glock 19?](/learn/handguns/do-glock-17-mags-fit-glock-19)`,
  },
  {
    slug: "do-glock-17-mags-fit-glock-19",
    pillar: "handguns",
    title: "Do Glock 17 magazines fit a Glock 19? Glock magazine compatibility",
    metaTitle: "Do Glock 17 Mags Fit a Glock 19? Compatibility",
    description:
      "Yes: a Glock 17 magazine works in a Glock 19 and sticks out below the grip. Here's which Glock magazines swap between models, and which never do.",
    author: "editorial-team",
    sources: [S.glock19v, S.glock17v, S.glock19g6, S.glock17g6, S.glock43xmos],
    changelog: first,
    relatedProducts: ["glock-19-v", "glock-19-gen6", "glock-17-v", "glock-26-gen4", "glock-43x-mos", "glock-48"],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## The short answer

**Yes.** A Glock 17 magazine fits and feeds in a Glock 19. Glock's own technical data for the G19 V lists 17, 24, 31 and 33-round magazines as optional, all of them longer magazines from the same double-stack 9mm family. A G17 magazine sticks out about 0.4″ below a G19's grip: Glock lists the G17 at 5.47″ tall with its magazine and the G19 at 5.04″.

## The rule of thumb

Glock magazines interchange **within the same caliber and frame family**. A longer magazine works in a shorter grip and simply protrudes. A shorter magazine in a longer grip will usually lock and feed, but its base plate sits up inside the grip. That makes reloads slower and a stuck magazine harder to clear, so match magazines to the gun for carry.

| Family | Models | What swaps |
|---|---|---|
| 9mm double-stack | G17, G19, G26, G34, G45 | Longer magazines fit shorter grips: G17 → G19 → G26 |
| 9mm Slimline | G43X, G48 | Their own slim 10-round magazines; Glock now also sells 15-round Slimline magazines |
| 9mm single-stack | G43 (original) | G43 magazines only; they do not fit the G43X or G48 |
| .40 S&W | G22, G27 | G22 magazines fit the G27 |
| 10mm | G20, G29, G40 | G20 and G40 magazines fit the G29 |
| .45 ACP | G41, G30S | G41 (full-size .45) magazines fit the G30S |
| .380 ACP | G42 | G42 magazines only |

Slimline magazines and double-stack magazines **never** interchange. They are different widths.

## Generations and left-handed shooters

Gen4, Gen5 and V pistols have a reversible magazine catch. If you move it to the right side for left-handed use, older magazines without the ambidextrous notch will not lock in. If you shoot left-handed, buy current-production magazines and check that they have the notch on both sides.

For Gen6 pistols, Glock lists the compatible magazines on each model's product page. Check that list before you buy spares.

## Common pairings

- **G19 owners:** a G17 or 24-round magazine makes a good spare for the range or home. Carry the flush 15-round magazine.
- **G26 owners:** a G19 magazine is the classic backup reload.
- **G43X and G48 owners:** stick with Slimline magazines. Double-stack magazines will not fit.

See the [Glock 19 V](/product/glock-19-v), [Glock 26 Gen4](/product/glock-26-gen4) and [Glock 43X MOS](/product/glock-43x-mos).`,
  },
  {
    slug: "what-is-a-forced-reset-trigger",
    pillar: "triggers",
    title: "What is a forced reset trigger? FRT vs binary vs standard triggers",
    metaTitle: "What Is an FRT? Forced Reset vs Binary Triggers",
    description:
      "How a forced reset trigger works, how it differs from binary and standard AR-15 triggers, what your rifle needs to run one, and what to check first.",
    author: "editorial-team",
    sources: [S.rbL3, S.rbC3, S.doj, S.rbDomains],
    changelog: first,
    relatedProducts: ["frt-15l3", "rare-breed-frt-15l3-flat", "rare-breed-frt-15c3"],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## In one sentence

A forced reset trigger (FRT) is an AR-15 trigger that is **pushed forward mechanically after each shot** instead of waiting for your finger to let it reset. It still fires **one round per pull**; it just resets faster.

## How it works

In a standard AR-15 trigger, the disconnector catches the hammer after each shot. The trigger only resets when you ease your finger forward.

In an FRT, the bolt carrier's rearward travel drives the trigger forward to its reset position. Rare Breed describes its design as **locking the trigger from being pulled until the bolt carrier group returns to battery**. You have to pull again for every round.

## FRT vs binary vs standard

| | Standard AR-15 trigger | Forced reset trigger | Binary trigger |
|---|---|---|---|
| Fires when you… | Pull | Pull | Pull, and again on release (in binary mode) |
| Reset | Your finger lets it forward | The action pushes it forward | Your finger lets it forward |
| Rounds per pull | One | One | One on pull, one on release |
| Typical selector | Safe / Semi | Safe / Semi / FRT | Safe / Semi / Binary |

## What your rifle needs

Rare Breed's FRT-15L3 and FRT-15C3 are drop-in triggers for **Mil-Spec AR-15 lower receivers**. Rare Breed states that they:

- **Require a full-auto-profile (M16) bolt carrier group** to work properly.
- Run best with an **H2 or H3 buffer**, or an A5 buffer system.
- **May not fit some Colt or other lowers with a sear block** or shelf.

Both come with a 3-position ambidextrous selector, anti-walk pins and the Torx tools you need to fit them.

## The legal picture

Forced reset triggers for AR-pattern rifles came back on the federal market after the **May 2025 settlement** between the U.S. Department of Justice and Rare Breed Triggers. Under that settlement Rare Breed agreed not to develop FRTs for handguns, and we only sell FRTs for AR-15 lowers.

> Several states and cities restrict or ban forced reset triggers. Confirm the law where you live before you order. We cannot ship to restricted addresses. This guide is general information, not legal advice.

## Buy from a real dealer

FRT demand has drawn impersonation storefronts that copy a maker's name and logo. Before buying anywhere:

- Check the maker's own list of official domains. Rare Breed publishes one.
- Be wary of prices far below the published $450 MSRP for the FRT-15L3.
- Pay by card, never by gift card, wire or crypto.

Compare the current models in [FRT-15L3 vs FRT-15C3](/learn/triggers/frt-15l3-vs-frt-15c3).`,
  },
  {
    slug: "frt-15l3-vs-frt-15c3",
    pillar: "triggers",
    title: "Rare Breed FRT-15L3 vs FRT-15C3: single-stage or two-stage?",
    metaTitle: "FRT-15L3 vs FRT-15C3: Which Rare Breed FRT?",
    description:
      "Rare Breed's FRT-15L3 and FRT-15C3 share a price, selector and parts list. The difference is how semi-auto mode feels. Compare them, plus the flat-shoe L3.",
    author: "editorial-team",
    sources: [S.rbL3, S.rbC3],
    changelog: first,
    relatedProducts: ["frt-15l3", "rare-breed-frt-15l3-flat", "rare-breed-frt-15c3"],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## The difference in one line

The **FRT-15L3** is single-stage in both semi-automatic and forced reset modes. The **FRT-15C3** breaks like a **two-stage** trigger in semi mode (take-up, then a defined wall) and is single-stage in FRT mode.

## Side by side

| | FRT-15L3 | FRT-15L3 (Flat) | FRT-15C3 |
|---|---|---|---|
| Semi mode | Single-stage, 4–4.5 lb | Single-stage, 4–4.5 lb | Two-stage |
| FRT mode | Single-stage, 5.5–6 lb | Single-stage, 5.5–6 lb | Single-stage |
| Trigger shoe | Curved | Flat | Curved |
| Selector | 3-position ambidextrous | 3-position ambidextrous | 3-position ambidextrous |
| Rare Breed MSRP | $450 | $450 | $450 |

Pull weights for the L3 are Rare Breed's published figures. Rare Breed builds the L3 from 7075 anodized aluminum and heat-treated 4140 steel.

## What's in the box (all three)

One trigger, two anti-walk pins, four anti-walk pin screws, a selector drum, long and short selector levers, two T10 Torx selector-lever screws and two T10 Torx wrenches.

## Which should you choose?

- **Pick the FRT-15L3** if you want one consistent, single-stage feel in both modes. Most buyers start here.
- **Pick the L3 (Flat)** if you prefer a flat shoe for a consistent finger position.
- **Pick the FRT-15C3** if you shoot precision or slow fire in semi mode and like a two-stage break.

## Before you install

All three need a Mil-Spec AR-15 lower and a **full-auto-profile (M16) bolt carrier group**. Rare Breed recommends an H2 or H3 buffer, or an A5 system, and notes that some Colt or other lowers with a sear block may not accept them. If you have not installed a trigger group before, have a gunsmith do it and function-check the rifle afterwards.

> Forced reset triggers are restricted in several states. Confirm the law where you live before you order.

See [what a forced reset trigger is](/learn/triggers/what-is-a-forced-reset-trigger), or shop the [FRT-15L3](/product/frt-15l3), [FRT-15L3 (Flat)](/product/rare-breed-frt-15l3-flat) and [FRT-15C3](/product/rare-breed-frt-15c3).`,
  },
  {
    slug: "hst-vs-gold-dot-9mm",
    pillar: "ammo",
    title: "Federal HST vs Speer Gold Dot 9mm 124gr: defensive ammo compared",
    metaTitle: "HST vs Gold Dot 9mm 124gr: Which Carry Ammo?",
    description:
      "Federal HST and Speer Gold Dot are both police duty loads. Compare the 9mm 124-grain versions on velocity, construction and cases, and how to choose.",
    author: "editorial-team",
    sources: [S.hst, S.goldDot],
    changelog: first,
    relatedProducts: ["federal-hst-9mm-124", "speer-gold-dot-9mm-124", "hornady-critical-defense-9mm", "winchester-target-9mm-115-fmj"],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## The short answer

On paper, the 124-grain 9mm versions of **Federal HST** and **Speer Gold Dot** are close to identical: the same bullet weight, the same 1,150 fps muzzle velocity from a 4″ test barrel, nickel-plated cases, and 20 rounds to a box. Both makers describe them as law-enforcement duty loads. The right choice is the one that **feeds flawlessly in your pistol** and that you can keep buying.

## Side by side

All figures are the makers' published data.

| | Federal HST 9mm 124gr | Speer Gold Dot 9mm 124gr |
|---|---|---|
| Part number | P9HST1S | 23618GD |
| Bullet | HST jacketed hollow point | Gold Dot hollow point (bonded) |
| Muzzle velocity | 1,150 fps | 1,150 fps |
| At 25 yards | 1,095 fps | 1,092 fps |
| At 50 yards | 1,049 fps | 1,044 fps |
| At 100 yards | 977 fps | 969 fps |
| Test barrel | 4″ | 4″ |
| Case | Nickel-plated | Nickel-plated, sealed primer |
| Box | 20 rounds | 20 rounds |

## How they're built

- **HST:** Federal designed the hollow point not to plug as it passes through barriers such as heavy clothing. The jacket and core hold together for near-total weight retention.
- **Gold Dot:** Speer bonds the core to the jacket so the two can't separate on impact. That keeps weight on the bullet so it penetrates to useful depths, and the hollow point expands consistently through common barriers.

## Choosing a defensive load

1. **Test it in your gun.** Before you carry any hollow point, fire enough of it through your own pistol and magazines to trust it. Many instructors suggest at least a couple of boxes.
2. **Match the weight to your practice ammo.** A 124-grain practice load shoots closest to a 124-grain carry load.
3. **Other weights exist.** Federal also lists HST 9mm in 147-grain (1,000 fps) and a 124-grain +P (1,200 fps). Only use +P if your pistol is rated for it.
4. **Short barrel?** Loads designed for short barrels, such as [Hornady Critical Defense](/product/hornady-critical-defense-9mm), are another good option for subcompacts.

## Practice vs carry

Hollow points cost several times as much as full metal jacket. Most shooters practice with FMJ such as [Winchester 9mm 115gr](/product/winchester-target-9mm-115-fmj) and keep a few boxes of their carry load for function checks.

Shop [Federal HST 9mm](/product/federal-hst-9mm-124) and [Speer Gold Dot 9mm](/product/speer-gold-dot-9mm-124).`,
  },
  {
    slug: "sig-p365-vs-p365-xl-vs-xmacro",
    pillar: "handguns",
    title: "SIG P365 vs P365-XL vs P365-XMACRO: which size fits you?",
    metaTitle: "SIG P365 vs P365-XL vs XMACRO: Size Compared",
    description:
      "Compare the SIG P365, P365-XL and P365-XMACRO on capacity, barrel, size and weight from SIG's own specs, and see how they stack up against the Glock 43X.",
    author: "editorial-team",
    sources: [S.p365, S.p365xl, S.p365xm, S.gunGenius, S.glock43xmos, S.glock19g6],
    changelog: first,
    relatedProducts: ["sig-p365", "sig-p365-xl", "sig-p365-xmacro", "glock-43x-mos", "glock-19-gen6"],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## Why the P365 matters

The SIG P365 topped GunBroker's list of best-selling handguns in 2025. It put 10+ rounds of 9mm into a pistol about the size of a single-stack, and SIG has since grown it into a family. The three most popular versions trade concealment against shootability and capacity.

## Side by side

| | P365 | P365-XL | P365-XMACRO |
|---|---|---|---|
| Capacity (standard magazines) | 10 (flush + extended included) | 12 | 17 |
| Barrel | 3.1″ | 3.7″ | 3.7″ |
| Overall length | Shortest of the three | 6.6″ | 6.6″ |
| Height | Shortest of the three | 4.8″ | 5.2″ |
| Width | — | 1.1″ | 1.1″ |
| Weight (SIG) | — | 20.7 oz | 22 oz with magazine |
| Sights | XRAY3 day/night | XRAY3 day/night | XRAY3 day/night |
| Optic ready | ROMEO-X COMPACT cut | Shield RMSc footprint | Shield RMSc footprint |
| Rail | — | SIG rail | M1913 |

XL and XMACRO figures are from SIG's model tables for SKUs 365XL-9-BXR3 and 365XCA-9-BXR3. The optic-ready P365 (365-9-BXR3P) ships with one flush and one extended 10-round magazine, and SIG offers an optional 12-round magazine.

## Which one?

- **P365:** the deepest concealment. Pick it if it will ride in a pocket, an appendix holster under a T-shirt, or on a small frame.
- **P365-XL:** the balance most carriers end up with. A longer slide and grip help you shoot it well, and it's only about half an inch bigger than the P365.
- **P365-XMACRO:** full-size capacity (17+1) in the same thin profile, with a real M1913 rail for a light. It's the easiest of the three to shoot fast.

## How they compare to Glock

For reference, Glock lists the [Glock 43X MOS](/product/glock-43x-mos) at 10+1 rounds, a 3.41″ barrel, 6.50″ long, 1.10″ wide and 16.26 oz without a magazine, and the [Glock 19 Gen6](/product/glock-19-gen6) at 15+1, 4.02″, 7.28″ long and 1.35″ wide. Note that SIG and Glock measure weight differently (with and without a magazine), so compare like with like.

Shop the [P365](/product/sig-p365), [P365-XL](/product/sig-p365-xl) and [P365-XMACRO](/product/sig-p365-xmacro).`,
  },
  {
    slug: "how-buying-a-handgun-online-works",
    pillar: "buying-online",
    title: "How buying a handgun online works: the FFL transfer, step by step",
    metaTitle: "How to Buy a Handgun Online: FFL Transfer Steps",
    description:
      "Buying a handgun online? It ships to a licensed dealer (FFL), not your door. Here's each step: choosing a dealer, Form 4473, the background check and fees.",
    author: "editorial-team",
    sources: [S.ecfrAge, S.nics, S.atf],
    changelog: [{ date: "2026-11-21", note: "Added what ships to your door and the two delivery options." }, ...first],
    relatedProducts: ["glock-19-gen6", "sig-p365", "glock-43x-mos"],
    status: "published",
    publishedAt: D,
    updatedAt: "2026-11-21",
    body: `## The short version

You buy the handgun online. We ship it to a **federally licensed firearms dealer (FFL)** near you. You collect it there after completing **ATF Form 4473** and passing a **background check**. Handguns never ship to your home.

## What ships to your door, and what goes to an FFL

| Item | Where it ships |
|---|---|
| Handguns and other firearms | The FFL dealer you choose at checkout. Federal law requires it. |
| Ammunition | Your address, with an adult signature on delivery |
| Triggers, parts and accessories | Your address |

Only firearms go through a dealer. Everything else comes straight to you, where your state allows it.

## Delivery options

Every order ships in a **plain box with no store branding**, whichever speed you pick.

- **Standard (discreet):** arrives within 3 days. It's free over the free-shipping threshold shown at checkout.
- **Fast-track:** express delivery for a flat fee.

Firearms ship to your dealer at either speed. We ship within the United States only. See [shipping and delivery](/shipping) for the current prices.

## Step by step

1. **Choose your handgun** and add it to your cart.
2. **Pick an FFL dealer at checkout.** Choose a dealer from our list, or tell us about a local shop. Call the dealer first to confirm they accept transfers and to ask their fee.
3. **We ship to the dealer.** The pistol goes to the dealer's licensed premises, never to a home address.
4. **The dealer contacts you** when it arrives and logs it into their records.
5. **Visit the dealer** with a valid government-issued photo ID. You'll fill out ATF Form 4473, and the dealer runs a background check through the FBI's National Instant Criminal Background Check System (NICS) or your state's equivalent.
6. **Pay the transfer fee** if the dealer charges one, then take your handgun home.

## Who can buy

- **Age:** under federal rules, a licensed dealer may not sell or deliver a handgun or handgun ammunition to anyone under 21. The limit for rifles, shotguns and their ammunition is 18.
- **Residency:** a handgun must be transferred by a dealer in the state where you live, so choose an FFL in your home state.
- **State rules:** some states add permits, waiting periods or other checks. Your dealer will tell you what applies where you live.

## Transfer fees

Each dealer sets its own transfer fee. Where a dealer in our list has told us its fee, we show it at checkout. Ask before you choose, because fees vary from shop to shop.

## Common questions

**Can a handgun ship to my house?** No. Handguns bought online always go to an FFL.

**What if my background check is delayed?** Your dealer will explain the next steps. Some dealers wait for a final answer before they release a firearm.

**Can I buy ammunition online too?** Yes. Ammunition ships to your address with an adult signature on delivery, subject to your state's rules.

> This guide is general information about how our orders work, not legal advice. Laws change and vary by state; check the rules where you live.`,
  },
  {
    slug: "glossary",
    pillar: "reference",
    title: "Firearms glossary: the terms you'll see when buying online",
    metaTitle: "Gun Buyer's Glossary: FFL, MOS, FRT, JHP & More",
    description:
      "Plain-English definitions of the terms on our product pages, from FFL, Form 4473 and NICS to MOS, RMSc, GMB, FRT, BCG, JHP and +P.",
    author: "editorial-team",
    sources: [S.atf, S.nics, S.glock19g6, S.rbL3, S.hst],
    changelog: first,
    relatedProducts: [],
    status: "published",
    publishedAt: D,
    updatedAt: D,
    body: `## Buying and transfer

- **FFL**: a Federal Firearms License, or the licensed dealer who holds one. Handguns bought online ship to an FFL near you for transfer.
- **Transfer**: the handoff at the dealer, where you complete the paperwork and background check. Dealers may charge a transfer fee.
- **Form 4473**: the ATF firearms transaction record you fill out at the dealer before taking a firearm home.
- **NICS**: the FBI's National Instant Criminal Background Check System, which dealers use for the background check (some states run their own).
- **Adult signature**: a delivery that must be signed for by an adult. Ammunition orders ship this way.

## Handguns

- **Striker-fired**: a pistol fired by a spring-loaded striker rather than a hammer, with the same trigger pull every shot. Glock and the SIG P365 are striker-fired.
- **Safe Action**: Glock's system of three passive, independent safeties that disengage as you pull the trigger and re-engage when you release it.
- **Full-size, compact, subcompact**: rough size classes. Examples are the Glock 17, Glock 19 and Glock 26.
- **Slimline**: Glock's thin single-stack-width frames, such as the G43X and G48.
- **Gen5, Gen6, V**: Glock generations. Gen6 adds a new grip and optics system; V is the redesigned Gen5-style line.
- **GMB**: GLOCK Marksman Barrel, Glock's match-grade barrel.
- **nDLC**: a hard, corrosion-resistant finish on Glock slides.
- **Backstrap**: an interchangeable panel on the back of the grip that changes its size.
- **Magwell**: the opening the magazine goes into. A flared magwell speeds up reloads.
- **Manual safety**: a lever that blocks the trigger. Some P365 models are offered with or without one.

## Optics

- **Optic ready**: a slide cut to mount a red dot sight.
- **MOS**: Glock's Modular Optic System, a slide cut that accepts optics through adapter plates.
- **Footprint**: the mounting pattern of a red dot. **RMSc** (Shield RMSc) is a common pattern for slim carry pistols.

## AR-15 and triggers

- **Lower receiver (lower)**: the serialized part of an AR-15 that houses the trigger. "Mil-Spec" means it is built to the standard military dimensions.
- **BCG**: bolt carrier group. **M16-profile** (full-auto-profile) carriers have a longer, heavier rear section, and Rare Breed FRTs require one.
- **Buffer**: the weight in the stock tube that controls the bolt's speed. **H2 and H3** are heavier buffers.
- **Forced reset trigger (FRT)**: a trigger pushed forward mechanically after each shot. One round per pull.
- **Binary trigger**: a trigger that fires once on the pull and once on the release in binary mode.
- **Single-stage / two-stage**: a single-stage trigger breaks after one smooth movement; a two-stage trigger has take-up, then a wall.
- **Anti-walk pins**: trigger and hammer pins held in place with screws or collars so they cannot drift.

## Ammunition

- **Grain (gr)**: bullet weight. 7,000 grains make a pound. Common 9mm weights are 115, 124 and 147 grains.
- **FMJ**: full metal jacket, an inexpensive practice bullet that doesn't expand.
- **JHP**: jacketed hollow point, a defensive bullet designed to expand.
- **Bonded**: a bullet whose core is fused to its jacket so the two hold together.
- **+P**: loaded to higher pressure than standard. Use only in firearms rated for it.
- **Muzzle velocity (fps)**: bullet speed at the muzzle in feet per second, measured from a stated test-barrel length.
- **Price per round**: the pack price divided by the round count, which lets you compare box sizes.
- **Nickel-plated case**: a coated brass case that resists corrosion and helps smooth feeding.`,
  },
];
