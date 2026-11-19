import { cn } from "@/lib/utils";
import { EchoType } from "@/components/echo-type";

/** Page title in poster type on every screen; `aside` (desktop actions) shows from md. */
export function PageTitle({
  title,
  meta,
  aside,
  className,
}: {
  title: string;
  meta?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6 pt-1 pb-5 md:pt-12 md:pb-8", className)}>
      <div className="min-w-0">
        <EchoType
          as="h1"
          text={title.toUpperCase()}
          className="font-display text-[clamp(2.75rem,13.5vw,4rem)] md:text-[clamp(4rem,8vw,7.5rem)]"
        />
        {meta && <div className="mt-3 text-sm text-ink-2 md:mt-4">{meta}</div>}
      </div>
      {aside && <div className="hidden shrink-0 md:block">{aside}</div>}
    </div>
  );
}
