"use client";

import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "@/lib/catalog";
import { categoryGlyph } from "@/components/icons";
import { site } from "@/config/site";

const account = [
  { href: "/learn", label: "Buying guides" },
  { href: "/orders", label: "My orders" },
  { href: "/favorites", label: "Favorites" },
  { href: "/profile", label: "Profile" },
  { href: "/welcome", label: "Sign in or create account" },
];

export function MenuSheet() {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/8"
      >
        <Menu className="size-6" strokeWidth={1.75} />
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm gap-0 border-r-0 bg-ground p-0">
        <div className="px-5 pt-6 pb-4">
          <SheetTitle className="font-display text-4xl uppercase">Menu</SheetTitle>
          <SheetDescription className="mt-2 text-sm text-ink-2">{site.tagline}</SheetDescription>
        </div>
        <nav aria-label="Departments" className="px-3">
          <ul>
            {categories.map((c) => {
              const Glyph = categoryGlyph[c.id];
              return (
                <li key={c.id}>
                  <SheetClose
                    render={
                      <Link
                        href={`/shop/${c.id}`}
                        className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-ink/8"
                      />
                    }
                    nativeButton={false}
                  >
                    <span className="grid size-10 place-items-center rounded-lg bg-ink text-primary-foreground">
                      <Glyph className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-bold">{c.name}</span>
                      <span className="block text-xs text-ink-2">{c.blurb}</span>
                    </span>
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mx-5 my-4 h-px bg-ink/15" />
        <nav aria-label="Account" className="px-5">
          <ul className="space-y-1">
            {account.map((a) => (
              <li key={a.href}>
                <SheetClose
                  render={<Link href={a.href} className="block py-2 text-[0.9375rem] font-semibold hover:underline" />}
                  nativeButton={false}
                >
                  {a.label}
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-auto px-5 pt-6 pb-8 text-xs leading-relaxed text-ink-2">
          Firearms ship to a licensed FFL dealer. You must be {site.minimumAge}+ to buy
          handguns and handgun ammunition.
        </p>
      </SheetContent>
    </Sheet>
  );
}
