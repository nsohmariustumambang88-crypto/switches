import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { img } from "@/config/site";
import { money } from "@/lib/format";
import { getCategories, getProduct, getProducts } from "@/lib/data/catalog";
import { getProduct as builtinProduct } from "@/lib/catalog";
import { categoryGlyph } from "@/components/icons";
import { EchoType } from "@/components/echo-type";
import { Lockup, SpecStrip } from "@/components/brand";
import { AddToCart } from "@/components/add-to-cart";
import { ProductImage } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

const FEATURED = "glock-19-gen6";

/** The poster: the reference's grey print, re-set around one product. */
export async function PosterHero() {
  const p = (await getProduct(FEATURED)) ?? (await getProducts("handguns"))[0];
  if (!p) return null;
  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[90rem] px-4 pt-2 md:px-6 md:pt-10 lg:px-10">
      <div className="grid grid-cols-12 items-end gap-x-6">
        <EchoType
          id="hero-title"
          text="GLOCK"
          delay={0.15}
          className="col-span-12 font-display text-[24.5vw] md:col-span-8 md:text-[clamp(9rem,15vw,14rem)]"
        />
        <div className="col-span-12 mt-3 flex items-end justify-between gap-4 md:col-span-4 md:mt-0 md:block md:pb-3 md:text-right">
          <p className="max-w-[15rem] text-[0.8125rem] leading-snug text-ink-2 md:ml-auto md:text-sm">
            The new Gen6 compact. Fifteen rounds, an optic-ready slide and a flat-faced trigger.
          </p>
          <p className="shrink-0 text-right text-[0.8125rem] leading-tight font-extrabold uppercase md:mt-4 md:text-base">
            Ships to
            <br />
            your FFL
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-12 gap-x-6 md:mt-6">
        {/* The poster's dark product field: the shot fills the frame. */}
        <div className="relative col-span-12 aspect-[16/11] overflow-hidden rounded-lg bg-panel-deep md:col-span-8 md:aspect-[3/2]">
          <Link href={`/product/${p.slug}`} aria-label={`View ${p.name}`} className="absolute inset-0">
            <ProductImage product={p} priority sizes="(min-width: 768px) 62vw, 100vw" pad="p-[3%]" />
          </Link>
          <Link
            href={`/product/${p.slug}`}
            aria-label={`Open ${p.name}`}
            className="group absolute top-3 right-3 grid size-11 place-items-center rounded-lg bg-ink text-primary-foreground transition-transform hover:scale-105 md:top-5 md:right-5 md:size-14"
          >
            <ArrowUpRight className="size-6 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 md:size-8" strokeWidth={2.25} />
          </Link>
        </div>

        <div className="col-span-12 flex flex-col md:col-span-4 md:justify-between">
          <div className="mt-3 grid grid-cols-12 items-end gap-x-4 md:mt-0 md:flex md:flex-col md:items-stretch md:gap-8">
            <div className="col-span-5 flex items-end gap-2">
              <span className="rotate-180 pb-1 label-caps text-[0.75rem] text-ink-2 [writing-mode:vertical-rl]">
                {p.figure.label}
              </span>
              <span className="font-display text-[5.5rem] leading-[0.78] text-figure md:text-[clamp(8rem,12vw,11rem)]">
                {p.figure.value}
              </span>
            </div>
            <Link
              href="/shop/handguns"
              className="group col-span-7 justify-self-end md:self-end"
              aria-label="Shop all handguns"
            >
              <Lockup
                lines={["Shop", "Hand", "Guns"]}
                className="text-[2.75rem] transition-transform duration-500 ease-out-expo group-hover:-translate-x-1 md:text-[clamp(4.5rem,7.4vw,7.25rem)]"
              />
            </Link>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:mt-8">
            <SpecStrip items={p.strip} className="self-start md:self-end" />
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-xl font-extrabold tabular-nums">{money(p.price)}</p>
              <AddToCart product={p} size="lg" className="w-auto min-w-0 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Desktop department posters: one big field, one wide, two small.
const DEPT_POSTERS = {
  handguns: { word: "Handguns", image: "glock-19-gen5-fde", span: "col-span-6 row-span-2", size: "text-[clamp(4rem,6.5vw,6.5rem)]", box: "inset-x-10 top-16 bottom-36" },
  ammunition: { word: "Ammo", image: "hornady-critical-defense-9mm", span: "col-span-6", size: "text-[clamp(3.5rem,5vw,5rem)]", box: "left-[46%] right-16 top-6 bottom-6" },
  triggers: { word: "Triggers", image: "frt-15l3", span: "col-span-3", size: "text-[clamp(2.25rem,3vw,3rem)]", box: "inset-x-8 top-14 bottom-20" },
  parts: { word: "Parts", image: "recover-tactical-p-ix", span: "col-span-3", size: "text-[clamp(2.25rem,3vw,3rem)]", box: "inset-x-8 top-14 bottom-20" },
} as const;

/** Departments: inked squares on phones (the kit's icon row), poster panels on desktop. */
export async function CategoryRow() {
  const [categories, all] = await Promise.all([getCategories(), getProducts()]);
  return (
    <nav aria-label="Departments" className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
      <Reveal as="ul" className="grid grid-cols-4 gap-3 md:hidden">
        {categories.map((c) => {
          const Glyph = categoryGlyph[c.id];
          return (
            <li key={c.id} data-reveal>
              <Link href={`/shop/${c.id}`} className="group flex flex-col items-center gap-2">
                <span className="grid aspect-square w-full place-items-center rounded-lg bg-ink text-primary-foreground transition-colors group-hover:bg-ink-2">
                  <Glyph className="size-9" />
                </span>
                <span className="text-[0.75rem] font-bold">{c.short}</span>
              </Link>
            </li>
          );
        })}
      </Reveal>

      <Reveal as="ul" className="hidden h-[36rem] grid-cols-12 grid-rows-2 gap-5 md:grid">
        {categories.map((c) => {
          const d = DEPT_POSTERS[c.id];
          const shot = all.find((p) => p.slug === d.image) ?? builtinProduct(d.image)!;
          const Glyph = categoryGlyph[c.id];
          const count = all.filter((p) => p.category === c.id).length;
          return (
            <li key={c.id} data-reveal className={d.span}>
              <Link
                href={`/shop/${c.id}`}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg bg-panel p-6"
              >
                <span className={`absolute ${d.box}`}>
                  <Image
                    src={img(shot.image)}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 45vw, 1px"
                    className="multiply object-contain transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                  />
                </span>
                <span className="relative flex items-start justify-between">
                  <span className="flex items-center gap-2 label-caps text-ink-2">
                    <Glyph className="size-5 text-ink" />
                    {count} products
                  </span>
                  <ArrowUpRight className="size-7 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className={`relative font-display uppercase ${d.size}`}>{d.word}</span>
              </Link>
            </li>
          );
        })}
      </Reveal>
    </nav>
  );
}

/** Black ammo block: inverted poster with three product panels. */
export async function AmmoBanner() {
  const picks = ["winchester-target-9mm-115-fmj", "hornady-critical-defense-9mm", "norma-tac-22"].map(
    (s) => builtinProduct(s)!
  );
  const live = await getProducts("ammunition");
  const shown = picks.map((p) => live.find((x) => x.slug === p.slug) ?? p);
  return (
    <section aria-labelledby="ammo-title" className="bg-ink text-primary-foreground">
      <div className="mx-auto grid max-w-[90rem] gap-8 px-4 py-12 md:grid-cols-12 md:gap-6 md:px-6 md:py-20 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:col-span-5">
          <h2 id="ammo-title" className="font-display text-[4.25rem] uppercase md:text-[clamp(5rem,8vw,7.5rem)]">
            <span className="block">Stock</span>
            <span className="block">up on</span>
            <span className="block text-echo">ammo</span>
          </h2>
          <div className="space-y-5">
            <p className="max-w-sm text-sm leading-relaxed text-[#b9b9b6]">
              Handgun, rifle, shotgun and rimfire, sold by the box or in bulk. Choose the
              round count on each product.
            </p>
            <Link
              href="/shop/ammunition"
              className="group inline-flex h-12 items-center gap-2 rounded-lg bg-ground px-5 text-[0.9375rem] font-bold text-ink transition-colors hover:bg-surface-2"
            >
              Shop ammunition
              <ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
        <Reveal as="ul" className="grid grid-cols-3 items-end gap-3 md:col-span-7 md:gap-5">
          {shown.map((p, i) => (
            <li key={p.slug} data-reveal className={i === 1 ? "md:-translate-y-10" : undefined}>
              <Link href={`/product/${p.slug}`} className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-panel">
                  <Image
                    src={img(p.image)}
                    alt={p.name}
                    fill
                    sizes="(min-width: 768px) 18vw, 30vw"
                    className="multiply object-contain p-[10%] transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                </span>
                <span className="mt-2 block text-[0.75rem] leading-tight font-semibold text-[#d6d6d3] md:text-sm">
                  {p.name}
                </span>
                <span className="mt-0.5 block text-[0.75rem] text-echo tabular-nums md:text-sm">
                  from {money(p.price)}
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Choose your handgun",
    body: "Add it to your cart and pay online like any other order.",
  },
  {
    title: "Pick an FFL dealer",
    body: "At checkout, choose a licensed dealer near you. We ship the firearm to them, not to your door.",
  },
  {
    title: "Pick it up",
    body: "Bring a valid ID to the dealer, complete Form 4473 and the background check, and take it home.",
  },
];

export function FflSteps() {
  return (
    <section aria-labelledby="ffl-title" className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
      <h2 id="ffl-title" className="max-w-xl text-[1.75rem] leading-[1.05] font-extrabold tracking-[-0.02em] md:text-[2.75rem]">
        How handgun orders work
      </h2>
      <Reveal as="ul" className="mt-8 grid gap-8 md:mt-12 md:grid-cols-3 md:gap-6">
        {steps.map((s, i) => (
          <li key={s.title} data-reveal className="flex gap-4 md:flex-col md:gap-5">
            <span className="relative isolate shrink-0 font-display text-[4.5rem] md:text-[7rem]" aria-hidden="true">
              <span className="echo-layer absolute inset-0 -z-10 text-echo">{i + 1}</span>
              <span className="relative">{i + 1}</span>
            </span>
            <div className="pt-1 md:border-t md:border-ink md:pt-4">
              <h3 className="text-lg font-extrabold">{s.title}</h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-2">{s.body}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
