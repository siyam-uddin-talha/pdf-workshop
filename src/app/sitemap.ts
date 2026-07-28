import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { TOOL_PAGES } from "@/lib/tool-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const toolRoutes: MetadataRoute.Sitemap = Object.keys(TOOL_PAGES).map((slug) => ({
    url: absoluteUrl(`/${slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...toolRoutes,
  ];
}
