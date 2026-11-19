/**
 * Instant-navigation placeholders in the poster world: grey panels in the
 * exact footprint of the page they stand in for, so content lands without a jump.
 */

const block = "animate-pulse rounded-lg bg-panel";

export function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product" className="mx-auto grid max-w-[90rem] gap-x-12 md:grid-cols-12 md:px-6 md:pt-10 lg:px-10">
      <div className="h-14 md:hidden" />
      <div className="md:col-span-7">
        <div className="aspect-square animate-pulse bg-panel-deep/60 md:aspect-[5/4] md:rounded-lg" />
        <div className="mt-4 flex items-end justify-between px-4 md:px-0">
          <div className={`${block} h-24 w-28`} />
          <div className={`${block} h-14 w-40`} />
        </div>
      </div>
      <div className="space-y-4 px-4 pt-6 md:col-span-5 md:px-0 md:pt-0">
        <div className={`${block} h-12 w-11/12`} />
        <div className={`${block} h-12 w-2/3`} />
        <div className={`${block} h-5 w-32`} />
        <div className={`${block} h-10 w-40`} />
        <div className={`${block} mt-6 h-14 w-full`} />
        <div className={`${block} h-24 w-full`} />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading products" className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
      <div className="h-14 md:hidden" />
      <div className="pt-1 pb-5 md:pt-12 md:pb-8">
        <div className={`${block} h-14 w-3/4 max-w-xl md:h-24`} />
        <div className={`${block} mt-4 h-4 w-48`} />
      </div>
      <div className="mb-6 flex gap-2">
        {[16, 20, 20, 28].map((w, i) => (
          <div key={i} className={`${block} h-9`} style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className={`${block} aspect-[5/4]`} />
            <div className={`${block} mt-2.5 h-4 w-4/5`} />
            <div className={`${block} mt-2 h-4 w-1/3`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrackSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading order" className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
      <div className="h-14 md:hidden" />
      <div className={`${block} mt-2 h-20 w-3/4 max-w-lg md:mt-12 md:h-32`} />
      <div className="mt-10 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`${block} size-8`} />
            <div className={`${block} h-5 w-48`} />
          </div>
        ))}
      </div>
    </div>
  );
}
