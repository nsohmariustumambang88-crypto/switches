"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category, CategoryId, Product } from "@/lib/catalog";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { SearchField } from "@/components/search-field";
import { ProductGrid } from "@/components/product-lists";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
] as const;
type Sort = (typeof SORTS)[number]["id"];

const PRICES = [
  { id: "any", label: "Any price", test: () => true },
  { id: "u50", label: "Under $50", test: (n: number) => n < 50 },
  { id: "50-250", label: "$50 – $250", test: (n: number) => n >= 50 && n < 250 },
  { id: "250-500", label: "$250 – $500", test: (n: number) => n >= 250 && n < 500 },
  { id: "500", label: "$500 and up", test: (n: number) => n >= 500 },
] as const;
type PriceId = (typeof PRICES)[number]["id"];

const uniq = (xs: (string | undefined)[]) =>
  Array.from(new Set(xs.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));

function matches(p: Product, q: string) {
  const hay = `${p.name} ${p.brand} ${p.caliber ?? ""} ${p.strip.join(" ")} ${p.category}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

export function Listing({
  category,
  title,
  products,
  categories,
}: {
  category: CategoryId | "all";
  title: string;
  products: Product[];
  categories: Category[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q")?.trim() ?? "";
  const cat = category === "all" ? undefined : categories.find((c) => c.id === category);

  // "All" lists departments as chips; a department lists its types.
  const chips =
    category === "all"
      ? categories.map((c) => ({ id: c.id as string, name: c.short === "Ammo" ? "Ammunition" : c.short }))
      : cat!.types.length > 1
        ? cat!.types
        : [];

  const [chip, setChip] = useState<string>(params.get("type") ?? "all");
  const [brands, setBrands] = useState<string[]>([]);
  const [calibers, setCalibers] = useState<string[]>([]);
  const [price, setPrice] = useState<PriceId>("any");
  const [sort, setSort] = useState<Sort>("featured");
  const [sheet, setSheet] = useState<null | "filter" | "sort">(null);
  const [side, setSide] = useState<"bottom" | "right">("bottom");
  const [searching, setSearching] = useState(false);

  // Follow ?type= when the same listing is reached again with a new filter.
  const typeParam = params.get("type") ?? "all";
  const [lastType, setLastType] = useState(typeParam);
  if (typeParam !== lastType) {
    setLastType(typeParam);
    setChip(typeParam);
  }

  const base = products;
  const allBrands = uniq(base.map((p) => p.brand));
  const allCalibers = uniq(base.map((p) => p.caliber));

  const results = useMemo(() => {
    const priceTest = PRICES.find((p) => p.id === price)!.test;
    const list = base.filter(
      (p) =>
        (chip === "all" || (category === "all" ? p.category === chip : p.type === chip)) &&
        (!brands.length || brands.includes(p.brand)) &&
        (!calibers.length || (p.caliber && calibers.includes(p.caliber))) &&
        priceTest(p.price) &&
        (!q || matches(p, q))
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return sorted;
  }, [base, chip, brands, calibers, price, sort, q, category]);

  const activeFilters = brands.length + calibers.length + (price === "any" ? 0 : 1);
  const clearAll = () => {
    setBrands([]);
    setCalibers([]);
    setPrice("any");
    setChip("all");
  };

  const open = (which: "filter" | "sort") => {
    setSide(window.matchMedia("(min-width: 768px)").matches ? "right" : "bottom");
    setSheet(which);
  };

  const heading = q ? `“${q}”` : title;

  return (
    <>
      <PageBar
        title=""
        actions={
          <button
            type="button"
            aria-label={searching ? "Close search" : "Search"}
            aria-expanded={searching}
            onClick={() => setSearching((s) => !s)}
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-ink/8"
          >
            {searching ? <X className="size-5" /> : <Search className="size-5" strokeWidth={1.9} />}
          </button>
        }
      />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        {searching && <SearchField className="mb-3 md:hidden" defaultValue={q} />}

        <PageTitle
          title={q ? "Search" : title}
          meta={
            <>
              {results.length} {results.length === 1 ? "product" : "products"}
              {q && (
                <>
                  {" "}for <strong className="text-ink">{heading}</strong> ·{" "}
                  <Link href={`/shop/${category}`} className="font-semibold text-ink underline">
                    clear search
                  </Link>
                </>
              )}
              {cat && !q && <> · {cat.blurb}</>}
            </>
          }
          aside={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => open("filter")}>
                <SlidersHorizontal />
                Filter{activeFilters ? ` (${activeFilters})` : ""}
              </Button>
              <Button variant="outline" onClick={() => open("sort")}>
                <ArrowDownUp />
                {SORTS.find((s) => s.id === sort)!.label}
              </Button>
            </div>
          }
        />


        {chips.length > 0 && (
          <ToggleGroup
            aria-label="Filter by type"
            value={[chip]}
            onValueChange={(v) => setChip((v as string[])[0] ?? "all")}
            className="no-scrollbar -mx-4 mb-5 w-auto max-w-none gap-2 overflow-x-auto px-4 md:mx-0 md:mb-8 md:px-0"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            {chips.map((c) => (
              <ToggleGroupItem key={c.id} value={c.id}>
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}

        {results.length ? (
          <ProductGrid key={`${chip}-${sort}-${price}-${brands.join()}-${calibers.join()}-${q}`} products={results} />
        ) : (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="font-display text-[4rem] text-echo">0</p>
            <p className="max-w-xs text-sm text-ink-2">
              Nothing matches these filters{q ? ` and “${q}”` : ""}. Remove a filter or try a broader search.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                clearAll();
                if (q) router.push(`/shop/${category}`);
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Phone: floating Filter / Sort pair above the tab bar (kit screen 5). */}
      <div className="fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom)+0.75rem)] z-30 flex justify-center px-4 md:hidden">
        <div className="grid w-full max-w-xs grid-cols-2 overflow-hidden rounded-lg shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)]">
          <button
            type="button"
            onClick={() => open("filter")}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 bg-ink text-sm font-bold text-primary-foreground"
          >
            <SlidersHorizontal className="size-4" />
            Filter{activeFilters ? ` (${activeFilters})` : ""}
          </button>
          <button
            type="button"
            onClick={() => open("sort")}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 bg-surface-2 text-sm font-bold text-ink"
          >
            <ArrowDownUp className="size-4" />
            Sort
          </button>
        </div>
      </div>

      <Sheet open={sheet === "filter"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent
          side={side}
          className={cn(
            "gap-0 bg-ground p-0",
            side === "bottom" ? "max-h-[85dvh] rounded-t-[8px] border-t-0" : "w-full border-l-0 sm:max-w-md"
          )}
        >
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="text-xl font-extrabold">Filter</SheetTitle>
            <SheetDescription className="text-ink-2">{results.length} products match</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-7 overflow-y-auto px-5 pb-6">
            <fieldset>
              <legend className="mb-3 label-caps text-ink-2">Price</legend>
              <RadioGroup value={price} onValueChange={(v) => setPrice(v as PriceId)} className="gap-3">
                {PRICES.map((p) => (
                  <Label key={p.id} className="flex cursor-pointer items-center gap-3 text-[0.9375rem] font-medium">
                    <RadioGroupItem value={p.id} />
                    {p.label}
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>
            {allBrands.length > 1 && (
              <CheckList legend="Brand" options={allBrands} value={brands} onChange={setBrands} />
            )}
            {allCalibers.length > 1 && (
              <CheckList legend="Caliber" options={allCalibers} value={calibers} onChange={setCalibers} />
            )}
          </div>
          <SheetFooter className="grid grid-cols-2 gap-2 border-t border-ink/15 bg-ground px-5 py-4">
            <Button variant="outline" size="lg" onClick={clearAll}>
              Clear all
            </Button>
            <Button size="lg" onClick={() => setSheet(null)}>
              Show {results.length}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "sort"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent
          side={side}
          className={cn(
            "gap-0 bg-ground p-0",
            side === "bottom" ? "rounded-t-[8px] border-t-0" : "w-full border-l-0 sm:max-w-sm"
          )}
        >
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="text-xl font-extrabold">Sort by</SheetTitle>
            <SheetDescription className="sr-only">Choose how products are ordered</SheetDescription>
          </SheetHeader>
          <RadioGroup
            value={sort}
            onValueChange={(v) => {
              setSort(v as Sort);
              setSheet(null);
            }}
            className="gap-0 px-5 pb-8"
          >
            {SORTS.map((s) => (
              <Label
                key={s.id}
                className="flex cursor-pointer items-center justify-between border-b border-ink/10 py-4 text-[0.9375rem] font-semibold"
              >
                {s.label}
                <RadioGroupItem value={s.id} />
              </Label>
            ))}
          </RadioGroup>
        </SheetContent>
      </Sheet>
    </>
  );
}

function CheckList({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 label-caps text-ink-2">{legend}</legend>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <Label key={o} className="flex cursor-pointer items-center gap-3 text-[0.9375rem] font-medium">
              <Checkbox
                checked={on}
                onCheckedChange={(c) => onChange(c ? [...value, o] : value.filter((x) => x !== o))}
              />
              {o}
            </Label>
          );
        })}
      </div>
    </fieldset>
  );
}
