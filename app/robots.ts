import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/landing"],
        disallow: ["/s/", "/api/", "/admin"],
      },
    ],
    sitemap: "https://notrace.co.in/sitemap.xml",
    host: "https://notrace.co.in",
  };
}
