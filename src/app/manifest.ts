import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** /manifest.webmanifest — install metadata and the poster grey for the browser chrome. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#cacac7",
    theme_color: "#cacac7",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
