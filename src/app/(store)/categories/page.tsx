import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { img } from "@/config/site";
import { categoryTiles, getProduct, shopHref } from "@/lib/catalog";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { SearchField } from "@/components/search-field";
import { CartButton } from "@/components/cart-button";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageBar title="" back={false} actions={<CartButton />} />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle title="Categories" meta="Every department, broken down." />
        <SearchField placeholder="Search categories and products…" className="md:hidden" />

        <Reveal as="ul" className="mt-4 grid grid-cols-2 gap-3 md:mt-0 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
          {categoryTiles.map((t) => (
            <li key={t.label} data-reveal>
              <Link href={shopHref(t.category, t.type)} className="group block">
                <span className="relative block aspect-[5/4] overflow-hidden rounded-lg bg-panel">
                  <Image
                    src={img(t.image)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 768px) 24vw, 46vw"
                    className="multiply object-contain p-[12%] transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  />
                  <ArrowUpRight className="absolute top-2.5 right-2.5 size-5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-2 block text-center text-[0.875rem] font-bold md:text-left md:text-base">
                  {t.label}
                </span>
              </Link>
            </li>
          ))}
        </Reveal>

        <Link
          href="/shop/all"
          className="group relative mt-8 block overflow-hidden rounded-lg bg-panel-deep text-ink md:mt-14"
        >
          <div className="relative z-10 flex min-h-48 max-w-[60%] flex-col justify-center gap-3 p-5 md:min-h-80 md:max-w-[45%] md:p-10">
            <p className="font-display text-[2.6rem] uppercase md:text-[5.5rem]">
              <span className="block">Built for</span>
              <span className="block text-surface-2">the range</span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold">
              Shop everything
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
          <div className="absolute inset-y-0 right-0 w-[56%] md:w-[52%]">
            <Image
              src={img(getProduct("glock-34-gen5-mos")!.image)}
              alt=""
              fill
              sizes="(min-width: 768px) 45vw, 56vw"
              className="multiply object-contain p-[6%] transition-transform duration-1000 ease-out-expo group-hover:scale-[1.04]"
            />
          </div>
        </Link>
      </div>
    </>
  );
}
