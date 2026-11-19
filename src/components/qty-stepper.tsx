"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  onChange,
  label,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  className?: string;
}) {
  const btn =
    "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg bg-surface text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div role="group" aria-label={`Quantity for ${label}`} className={cn("inline-flex items-center gap-1", className)}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-3.5" strokeWidth={2.5} />
      </button>
      <output aria-live="polite" className="w-8 text-center text-sm font-bold tabular-nums">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= 99} aria-label="Increase quantity">
        <Plus className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
