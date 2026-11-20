import { ldScript } from "@/lib/seo";

/** Structured data for search engines, rendered as a native script tag (not next/script). */
export function JsonLd({ data }: { data: Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(data) }} />;
}
