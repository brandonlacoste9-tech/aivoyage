import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/billing",
          "/settings",
          "/favorites",
          "/trips/",
          "/auth/",
          "/invite/",
          "/plan/",
        ],
      },
      // Common AI / answer-engine crawlers — allow public content
      {
        userAgent: "GPTBot",
        allow: ["/", "/pricing", "/explore", "/llms.txt"],
        disallow: ["/api/", "/dashboard", "/billing", "/settings", "/trips/", "/auth/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/pricing", "/explore", "/llms.txt"],
        disallow: ["/api/", "/dashboard", "/billing", "/settings", "/trips/", "/auth/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/pricing", "/explore", "/llms.txt"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/pricing", "/explore", "/llms.txt"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/pricing", "/explore", "/llms.txt"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/pricing", "/explore", "/llms.txt"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
