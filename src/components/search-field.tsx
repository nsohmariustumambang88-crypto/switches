"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchField({
  className,
  placeholder = "Search handguns, ammo, triggers…",
  defaultValue = "",
  size = "lg",
}: {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: "lg" | "sm";
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const v = q.trim();
        router.push(v ? `/shop/all?q=${encodeURIComponent(v)}` : "/shop/all");
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Search the store
      </label>
      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-2",
          size === "lg" ? "size-5" : "size-4"
        )}
      />
      <input
        id="site-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "w-full rounded-lg border border-transparent bg-surface pr-4 text-ink outline-none transition-colors placeholder:text-[#555552] hover:bg-surface-2 focus:border-ink focus:bg-surface-2",
          size === "lg" ? "h-12 pl-11 text-[0.9375rem]" : "h-10 pl-10 text-sm"
        )}
      />
    </form>
  );
}
