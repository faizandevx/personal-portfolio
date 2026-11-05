import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL, STATIC_ROUTES } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...STATIC_ROUTES, ...projects.map((project) => `/projects/${project.slug}`)].map(
    (route) => ({ url: `${SITE_URL}${route === "/" ? "" : route}` }),
  );
}
