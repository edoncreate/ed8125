import type { MetadataRoute } from "next";
import { site } from "@content/site";
import { getProjects, getVolumes } from "@/lib/content";
import { getTrackPages } from "@/lib/tracks";
import { getChannelVideos } from "@/lib/youtube";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = [
    "/",
    "/beats",
    "/projects",
    ...getProjects().map((p) => `/projects/${p.slug}`),
    "/lost-tapes",
    ...getVolumes().map((v) => `/lost-tapes/${v.id}`),
    "/collabs",
    "/radio",
    "/playlists",
    "/privacy",
    ...getTrackPages(await getChannelVideos()).map((t) => `/track/${t.slug}`),
  ];
  return paths.map((p) => ({ url: `${site.url}${p === "/" ? "/" : `${p}/`}` }));
}
