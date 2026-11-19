"use client";

import { Share } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ name }: { name: string }) {
  return (
    <button
      type="button"
      aria-label={`Share ${name}`}
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) await navigator.share({ title: name, url });
          else {
            await navigator.clipboard.writeText(url);
            toast("Link copied");
          }
        } catch {
          /* share sheet dismissed */
        }
      }}
      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-ink/8"
    >
      <Share className="size-5" strokeWidth={1.9} />
    </button>
  );
}
