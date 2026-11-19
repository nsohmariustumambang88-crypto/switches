"use client";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

const visible = (el: HTMLElement) => el.offsetParent !== null || el.getClientRects().length > 0;

function inViewport(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
}

function bump(target?: HTMLElement) {
  if (!target) return;
  gsap.fromTo(
    target,
    { scale: 1.28 },
    { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.38)", clearProps: "scale" }
  );
}

/**
 * Lifts the product shot off its panel and drops it into the cart icon.
 * The x and y legs use different eases, which bends the path into an arc.
 */
export function flyToCart(slug: string) {
  const target = Array.from(
    document.querySelectorAll<HTMLElement>("[data-cart-target]")
  ).find(visible);
  const source = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-fly="${CSS.escape(slug)}"]`)
  ).filter(visible);
  const from = source.find(inViewport);

  if (!target || !from || prefersReducedMotion()) {
    bump(target);
    return;
  }

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = from.cloneNode(true) as HTMLElement;
  clone.removeAttribute("data-fly");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: "0",
    zIndex: "90",
    pointerEvents: "none",
    objectFit: "contain",
    mixBlendMode: "multiply",
  });
  document.body.appendChild(clone);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  gsap
    .timeline({
      onComplete: () => {
        clone.remove();
        bump(target);
      },
    })
    .to(clone, { x: dx, duration: 0.85, ease: "power2.inOut" }, 0)
    .to(clone, { y: dy, duration: 0.85, ease: "back.in(1.5)" }, 0)
    .to(clone, { scale: 0.08, rotate: -12, duration: 0.85, ease: "power2.in" }, 0)
    .to(clone, { opacity: 0, duration: 0.15 }, 0.72);
}
