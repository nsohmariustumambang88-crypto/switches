"use client";

import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { img } from "@/config/site";
import { EchoType } from "@/components/echo-type";

/** Admin page heading: the storefront's poster title at operate scale. */
export function AdminTitle({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6 md:pb-8">
      <div className="min-w-0">
        <EchoType
          as="h1"
          text={title.toUpperCase()}
          className={cn(
            "font-display",
            title.length > 18 ? "text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.9]" : "text-[clamp(2.75rem,8vw,5.5rem)]"
          )}
        />
        {meta && <div className="mt-3 text-sm text-ink-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Poster numeral with a caps label — the dashboard's ledger unit. */
export function Figure({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-t-2 border-ink pt-3">
      <span className="label-caps text-ink-2">{label}</span>
      <span className="truncate font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.85] text-figure tabular-nums">{value}</span>
      {sub && <span className="text-xs text-ink-2">{sub}</span>}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex gap-3 rounded-lg p-4 text-sm leading-relaxed",
        tone === "error" ? "bg-danger text-primary-foreground" : "bg-surface text-ink"
      )}
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function Loading({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-surface" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

/** Product shot on a grey panel (multiplied), from a catalog path or Cloudinary id. */
export function Shot({ image, alt = "", size = 56, className }: { image?: string | null; alt?: string; size?: number; className?: string }) {
  return (
    <span className={cn("relative block shrink-0 overflow-hidden rounded-lg bg-panel", className)} style={{ width: size, height: size }}>
      {image && <Image src={img(image)} alt={alt} fill sizes={`${size}px`} className="multiply object-contain p-[8%]" />}
    </span>
  );
}

const control =
  "w-full rounded-lg border border-transparent bg-surface px-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-[#555552] hover:bg-surface-2 focus:border-ink focus:bg-surface-2";

export function Field({
  label,
  hint,
  className,
  children,
  htmlFor,
}: {
  label: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold text-ink-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink-2">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, "h-11", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(control, "min-h-24 py-2.5 leading-relaxed", props.className)} />;
}

export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={cn(control, "h-11 cursor-pointer appearance-none bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat pr-9", props.className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23111' stroke-width='2'/%3E%3C/svg%3E\")" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Black-on-ground caps section rule used to group form panels. */
export function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-t-2 border-ink pt-4", className)}>
      <h2 className="mb-4 label-caps text-ink">{title}</h2>
      {children}
    </section>
  );
}
