"use client";

import { useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  echoClassName?: string;
  /** "mount": play on mount. "scroll": play when scrolled into view. false: static. */
  play?: "mount" | "scroll" | false;
  delay?: number;
  id?: string;
};

/**
 * The poster's signature: heavy black type with a grey echo knocked out
 * behind it, offset up-left. On entrance the letters rise out of a mask and
 * the echo slides out of register — one motion, used everywhere a title
 * carries the page.
 */
export function EchoType({
  text,
  as: Tag = "h1",
  className,
  echoClassName,
  play = "mount",
  delay = 0,
  id,
}: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!play || !root.current || prefersReducedMotion()) return;
      const el = root.current;
      const ink = el.querySelector<HTMLElement>("[data-ink]");
      const echo = el.querySelector<HTMLElement>("[data-echo]");
      if (!ink || !echo) return;

      const split = SplitText.create(ink, { type: "chars", mask: "chars" });
      const tl = gsap.timeline({
        delay,
        scrollTrigger:
          play === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
      });
      tl.from(split.chars, { yPercent: 105, stagger: 0.035, duration: 1.05 }).from(
        echo,
        { "--echo-p": 0, duration: 1.3 },
        0.3
      );
      return () => {
        tl.kill();
        split.revert();
      };
    },
    { scope: root, dependencies: [text] }
  );

  return (
    <Tag ref={root} id={id} className={cn("relative isolate", className)}>
      <span
        aria-hidden="true"
        data-echo
        className={cn(
          "echo-layer pointer-events-none absolute inset-0 -z-10 select-none text-echo",
          echoClassName
        )}
      >
        {text}
      </span>
      <span data-ink className="relative block">
        {text}
      </span>
    </Tag>
  );
}
