import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/**
 * /robots.txt — crawl everything public; keep crawlers out of the back office,
 * the API and internal search results. Cart, checkout and account pages stay
 * crawlable so search engines can see their noindex tags.
 */
export default function robots(): MetadataRoute.Robots {
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
