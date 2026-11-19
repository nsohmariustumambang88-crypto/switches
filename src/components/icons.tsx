import type { SVGProps } from "react";
import type { CategoryId } from "@/lib/catalog";

/* Solid pictograms for the four departments, drawn on one 24px grid. */

type P = SVGProps<SVGSVGElement>;

export function PistolGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M2 6h20v4.6h-.9l.6 8.6c.05.75-.5 1.3-1.25 1.3h-3.1c-.65 0-1.15-.45-1.25-1.1L15.5 14h-2.3c-1.6 0-2.4-.8-2.75-2.1l-.35-1.3H2V6Zm9.95 4.6.25.9c.17.6.5.9 1.1.9h2l-.25-1.8h-3.1Z"
      />
      <path d="M3.2 4.6h2.2V6H3.2zM18.8 4.6h1.6V6h-1.6z" />
    </svg>
  );
}

export function CartridgeGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M9 9.2V7.6c0-2.5 1.2-4.2 3-5.1 1.8.9 3 2.6 3 5.1v1.6H9Z" />
      <path d="M9 10.4h6v8.4h.9v2.7H8.1v-2.7H9v-8.4Z" />
    </svg>
  );
}

export function TriggerGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M3 3.5h18v4.6H3z" />
      <path d="M10.6 8.1h3.3c.25 4.4-.8 8.6-3.3 12.1l-.9 1.25c-.35.5-1.15.25-1.15-.35V17c1.5-2.6 2.15-5.5 2.05-8.9Z" />
      <path d="M17.2 9.2c1.6 0 2.8 1.2 2.8 2.8v6.4h-1.6V12c0-.7-.5-1.2-1.2-1.2h-1.6V9.2h1.6Z" />
    </svg>
  );
}

export function RailGlyph(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M2 12.5h20v5.5H2z" />
      <path d="M3 8h3.2v4.5H3zM8.3 8h3.2v4.5H8.3zM13.6 8h3.2v4.5h-3.2zM18.9 8H21v4.5h-2.1z" />
    </svg>
  );
}

export const categoryGlyph: Record<CategoryId, (p: P) => React.ReactElement> = {
  handguns: PistolGlyph,
  ammunition: CartridgeGlyph,
  triggers: TriggerGlyph,
  parts: RailGlyph,
};

/* Sign-in marks for the welcome screen (single-colour). */

export function GoogleMark(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 12.23c0-.72-.06-1.25-.19-1.8H12.2v3.27h5.4c-.11.9-.7 2.27-2.02 3.18l-.02.12 2.93 2.27.2.02c1.87-1.72 2.91-4.25 2.91-7.06Z" />
      <path d="M12.2 21.8c2.66 0 4.9-.88 6.53-2.39l-3.11-2.41c-.84.58-1.95.99-3.42.99a5.94 5.94 0 0 1-5.61-4.1l-.12.01-3.04 2.36-.04.11A9.86 9.86 0 0 0 12.2 21.8Z" />
      <path d="M6.6 13.89a6.07 6.07 0 0 1-.33-1.95c0-.68.12-1.34.32-1.95v-.13L3.51 7.47l-.1.05a9.86 9.86 0 0 0 0 8.84l3.19-2.47Z" />
      <path d="M12.2 5.89c1.85 0 3.1.8 3.81 1.47l2.78-2.72A9.48 9.48 0 0 0 12.2 2.08a9.86 9.86 0 0 0-8.8 5.44l3.19 2.47a5.97 5.97 0 0 1 5.61-4.1Z" />
    </svg>
  );
}

export function AppleMark(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.37 12.72c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65l.04.01ZM14.1 5.97c.63-.77 1.06-1.83.94-2.89-.91.04-2.01.61-2.66 1.37-.58.67-1.1 1.76-.96 2.79 1.01.08 2.05-.51 2.68-1.27Z" />
    </svg>
  );
}
