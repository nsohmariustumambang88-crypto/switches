import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { img } from "@/config/site";
import { money } from "@/lib/format";
import type { Product } from "@/lib/catalog";
import { WishButton, Rating } from "@/components/product-bits";

export function ProductImage({
  product,
  sizes,
  priority,
  className,
  pad = "p-[9%]",
}: {
  product: Product;
  sizes: string;
  priority?: boolean;
  className?: string;
  pad?: string;
}) {
  // Filtered shots: a CSS filter isolates the element, which cancels its own
  // blend mode, so the multiply moves to a wrapper and the filter stays on the img.
  if (product.photo) {
    return (
      <span className="multiply absolute inset-0">
        <Image
          src={img(product.image)}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          data-fly={product.slug}
          className={cn(
            product.photo === "scene"
              ? "object-cover grayscale contrast-[1.08]"
              : cn("object-contain brightness-[1.16] contrast-[1.08] grayscale-[0.2]", pad),
            className
          )}
        />
      </span>
    );
  }
  return (
    <Image
      src={img(product.image)}
      alt={product.name}
      fill
      sizes={sizes}
      priority={priority}
      data-fly={product.slug}
      className={cn("multiply object-contain", pad, className)}
    />
  );
}

export function ProductCard({
  product,
  className,
  priority,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const off = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  return (
    <article data-reveal className={cn("group relative", className)}>
      <Link
        href={`/product/${product.slug}`}
        className="block focus-visible:outline-offset-4"
        aria-label={product.name}
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-panel">
          <ProductImage
            product={product}
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
            className="transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {off > 0 && (
              <span className="bg-ink px-1.5 py-1 label-caps text-primary-foreground">−{off}%</span>
            )}
            {product.ffl && (
              <span className="bg-surface-2 px-1.5 py-1 label-caps text-ink">FFL</span>
            )}
          </div>
        </div>
      </Link>
      <WishButton product={product} className="absolute top-2 right-2" />
      <div className="mt-2.5">
        <h3 className="line-clamp-2 min-h-[2.5em] text-[0.875rem] leading-[1.25] font-bold">
          <Link href={`/product/${product.slug}`} tabIndex={-1} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 truncate label-caps text-ink-2">{product.strip.slice(0, 2).join(" • ")}</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-[0.9375rem] font-extrabold tabular-nums">
            {product.packs && <span className="mr-1 text-xs font-semibold text-ink-2">from</span>}
            {money(product.price)}
            {product.compareAt && (
              <s className="ml-1.5 text-xs font-medium text-ink-2">{money(product.compareAt)}</s>
            )}
          </p>
          <Rating value={product.rating} />
        </div>
      </div>
    </article>
  );
}
