"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { img } from "@/config/site";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { loadSearchIndex, rankSearch, type SearchEntry } from "@/lib/search";

type Option =
  | { kind: "product"; e: SearchEntry }
  | { kind: "recent"; q: string }
  | { kind: "all"; q: string };

/**
 * Search with instant suggestions (ARIA combobox). The index is a static,
 * CDN-cached file fetched once on first focus; ranking runs in the browser,
 * so typing costs no server work. Recent searches are kept on this device.
 */
export function SearchField({
  className,
  placeholder = "Search handguns, ammo, triggers…",
  defaultValue = "",
  size = "lg",
  panelClassName,
}: {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  size?: "lg" | "sm";
  panelClassName?: string;
}) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const recent = useStore((s) => (s.hydrated ? s.recentSearches : []));
  const addRecent = useStore((s) => s.addRecentSearch);
  const clearRecent = useStore((s) => s.clearRecentSearches);

  const trimmed = q.trim();
  const options: Option[] = useMemo(() => {
    if (!trimmed) return recent.map((r) => ({ kind: "recent" as const, q: r }));
    const hits = index ? rankSearch(index, trimmed) : [];
    return [...hits.map((e) => ({ kind: "product" as const, e })), { kind: "all" as const, q: trimmed }];
  }, [trimmed, recent, index]);

  const ensureIndex = () => {
    if (!index) loadSearchIndex().then(setIndex);
  };

  const go = (href: string) => {
    setOpen(false);
    setActive(-1);
    router.push(href);
  };

  const searchAll = (value: string) => {
    const v = value.trim();
    if (v) addRecent(v);
    go(v ? `/shop/all?q=${encodeURIComponent(v)}` : "/shop/all");
  };

  const choose = (o: Option) => {
    if (o.kind === "product") {
      if (trimmed) addRecent(trimmed);
      go(`/product/${o.e.s}`);
    } else if (o.kind === "recent") {
      setQ(o.q);
      searchAll(o.q);
    } else searchAll(o.q);
  };

  const move = (dir: 1 | -1) => {
    if (!options.length) return;
    setOpen(true);
    const next = active < 0 ? (dir === 1 ? 0 : options.length - 1) : (active + dir + options.length) % options.length;
    setActive(next);
    const o = options[next];
    if (o?.kind === "product") router.prefetch(`/product/${o.e.s}`);
  };

  const showPanel = open && options.length > 0;
  const optionId = (i: number) => `${id}-opt-${i}`;

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (showPanel && active >= 0) choose(options[active]);
        else searchAll(q);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
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
        id={id}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && active >= 0 ? optionId(active) : undefined}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
          ensureIndex();
        }}
        onFocus={() => {
          setOpen(true);
          ensureIndex();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className={cn(
          "w-full rounded-lg border border-transparent bg-surface pr-4 text-ink outline-none transition-colors placeholder:text-[#555552] hover:bg-surface-2 focus:border-ink focus:bg-surface-2",
          size === "lg" ? "h-12 pl-11 text-[0.9375rem]" : "h-10 pl-10 text-sm"
        )}
      />

      {showPanel && (
        <div
          className={cn(
            "absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded-lg border border-ink bg-surface-2 text-ink",
            panelClassName
          )}
        >
          {!trimmed && (
            <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
              <span className="label-caps text-ink-2">Recent searches</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => clearRecent()}
                className="cursor-pointer text-xs font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline"
              >
                Clear
              </button>
            </div>
          )}
          <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-[min(26rem,60dvh)] overflow-y-auto py-1">
            {options.map((o, i) => {
              const on = i === active;
              return (
                <li
                  key={o.kind === "product" ? o.e.s : `${o.kind}-${o.q}`}
                  id={optionId(i)}
                  role="option"
                  aria-selected={on}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
                    on ? "bg-ink text-primary-foreground" : "hover:bg-ink/6"
                  )}
                >
                  {o.kind === "product" ? (
                    <>
                      <span className="relative block size-10 shrink-0 overflow-hidden rounded-[3px] bg-panel">
                        <Image src={img(o.e.i)} alt="" fill sizes="40px" className="multiply object-contain p-[8%]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{o.e.n}</span>
                        <span className={cn("block truncate label-caps", on ? "text-echo" : "text-ink-2")}>
                          {[o.e.b, o.e.c].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="shrink-0 font-bold tabular-nums">
                        {o.e.f && <span className={cn("mr-1 text-xs font-medium", on ? "text-echo" : "text-ink-2")}>from</span>}
                        {money(o.e.p)}
                      </span>
                    </>
                  ) : o.kind === "recent" ? (
                    <>
                      <Clock className="size-4 shrink-0 opacity-70" />
                      <span className="flex-1 truncate">{o.q}</span>
                    </>
                  ) : (
                    <>
                      <Search className="size-4 shrink-0 opacity-70" />
                      <span className="flex-1 truncate">
                        Search all products for <strong>“{o.q}”</strong>
                      </span>
                      <ArrowRight className="size-4 shrink-0" />
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          {trimmed && index && options.length === 1 && (
            <p className="border-t border-ink/10 px-3 py-2 text-xs text-ink-2">No direct matches — search the full catalog.</p>
          )}
        </div>
      )}
    </form>
  );
}
