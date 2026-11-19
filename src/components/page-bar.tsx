"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuSheet } from "@/components/menu-sheet";
import { CartButton } from "@/components/cart-button";
import { Wordmark } from "@/components/brand";

/** Phone-only top bar for inner screens: back · title · actions. */
export function PageBar({
  title,
  back = "/",
  actions,
  className,
}: {
  title: string;
  back?: string | false;
  actions?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid h-14 grid-cols-[2.5rem_1fr_auto] items-center gap-2 bg-ground/92 px-3 backdrop-blur-md md:hidden",
        className
      )}
    >
      {back !== false ? (
        <button
          type="button"
          aria-label="Back"
          onClick={() => (window.history.length > 1 ? router.back() : router.push(back))}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-ink/8"
        >
          <ArrowLeft className="size-[1.375rem]" strokeWidth={1.9} />
        </button>
      ) : (
        <span />
      )}
      <p className="truncate text-center text-[1.0625rem] font-extrabold tracking-tight">{title}</p>
      <div className="flex min-w-10 items-center justify-end gap-0.5">{actions}</div>
    </header>
  );
}

/** Phone-only home bar: menu · wordmark · cart. */
export function HomeBar() {
  return (
    <header className="sticky top-0 z-30 grid h-14 grid-cols-[2.5rem_1fr_2.5rem] items-center bg-ground/92 px-3 backdrop-blur-md md:hidden">
      <MenuSheet />
      <div className="text-center">
        <Wordmark />
      </div>
      <CartButton />
    </header>
  );
}
