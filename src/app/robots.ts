import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * /robots.txt — crawl everything public; keep crawlers out of the back office,
 * the API and internal search results. Cart, checkout and account pages stay
 * crawlable so search engines can see their noindex tags. Preview deployments
 * block everything (see site.indexable).
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.indexable) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/*?q=", "/*&q="],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
