import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export function SectionHead({
  title,
  href,
  linkLabel = "See all",
  className,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 className="text-[1.375rem] leading-none font-extrabold tracking-[-0.02em] md:text-[2rem]">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-bold hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Horizontal snap rail on phones; four-up grid from md. */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <Reveal className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-x-5 md:gap-y-10 md:overflow-visible md:px-0 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} className="w-[44vw] max-w-56 shrink-0 snap-start md:w-auto md:max-w-none" />
      ))}
    </Reveal>
  );
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <Reveal
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4",
        className
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.slug} product={p} priority={i < 4} />
      ))}
    </Reveal>
  );
}
