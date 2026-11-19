import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

/** Small wordmark with a static echo; used in navigation. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={cn("relative isolate inline-block font-display text-[1.375rem] leading-none", className)}
    >
      <span
        aria-hidden="true"
        className="echo-layer absolute inset-0 -z-10 text-echo [--echo-x:-0.07em] [--echo-y:-0.06em]"
      >
        {site.name}
      </span>
      <span className="relative">{site.name}</span>
    </Link>
  );
}

/**
 * Stacked right-aligned poster lockup ("TACTI / CAL / FARM" in the
 * reference). The last line is set grey.
 */
export function Lockup({
  lines,
  className,
}: {
  lines: readonly string[];
  className?: string;
}) {
  return (
    <p className={cn("font-display text-right uppercase", className)}>
      {lines.map((l, i) => (
        <span
          key={i}
          className={cn("block", i === lines.length - 1 && lines.length > 1 && "text-echo-strong")}
        >
          {l}
        </span>
      ))}
    </p>
  );
}

/** Rectangular spec strip: "9MM • 17 RD • 4.49″ BBL". */
export function SpecStrip({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1.5 bg-panel px-2 py-1.5 label-caps text-ink",
        className
      )}
    >
      {items.map((s, i) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">•</span>}
          {s}
        </span>
      ))}
    </p>
  );
}
