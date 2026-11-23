import type { MetadataRoute } from "next";
import { site } from "@content/site";
import { getProjects, getVolumes } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/beats",
    "/projects",
    ...getProjects().map((p) => `/projects/${p.slug}`),
    "/lost-tapes",
    ...getVolumes().map((v) => `/lost-tapes/${v.id}`),
    "/collabs",
  ];
  return paths.map((p) => ({ url: `${site.url}${p}` }));
}
