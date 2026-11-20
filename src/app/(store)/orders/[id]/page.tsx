import type { Metadata } from "next";
import { Suspense } from "react";
import { demoOrders } from "@/lib/catalog";
import { TrackSkeleton } from "@/components/skeletons";
import { TrackView } from "./track-view";

export function generateStaticParams() {
  return demoOrders.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: PageProps<"/orders/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id}`, robots: { index: false, follow: false } };
}

/** URL params resolve inside Suspense so navigations show the skeleton instantly. */
export default function TrackPage({ params }: PageProps<"/orders/[id]">) {
  return (
    <Suspense fallback={<TrackSkeleton />}>
      {params.then(({ id }) => (
        <TrackView id={id} />
      ))}
    </Suspense>
  );
}
