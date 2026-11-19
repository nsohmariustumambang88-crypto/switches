"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Staggers [data-reveal] children in as they scroll into view. Content is
 * visible in the server HTML; items already on screen are not hidden.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ul" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
      const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
      if (!below.length) return;
      gsap.set(below, { autoAlpha: 0, y: 28 });
      const triggers = ScrollTrigger.batch(below, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.8, overwrite: true }),
      });
      return () => triggers.forEach((t) => t.kill());
    },
    { scope: ref }
  );
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
