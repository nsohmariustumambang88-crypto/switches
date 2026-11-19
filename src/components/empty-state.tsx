import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function EmptyState({
  figure,
  title,
  body,
  href = "/categories",
  cta = "Browse categories",
}: {
  figure: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center md:py-24">
      <p aria-hidden="true" className="relative isolate font-display text-[7rem] md:text-[10rem]">
        <span className="echo-layer absolute inset-0 -z-10 text-echo">{figure}</span>
        <span className="relative">{figure}</span>
      </p>
      <h2 className="mt-6 text-xl font-extrabold">{title}</h2>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-2">{body}</p>
      <Link href={href} className={buttonVariants({ size: "lg", className: "mt-6" })}>
        {cta}
      </Link>
    </div>
  );
}
