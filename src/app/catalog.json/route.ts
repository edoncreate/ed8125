import { getCatalog } from "@/lib/catalog";
import { getChannelVideos } from "@/lib/youtube";

export const dynamic = "force-static";

/** Every playable audio track (key, title, subtitle, src, duration, href). Playlists resolve their keys here. */
export async function GET() {
  return Response.json(getCatalog(await getChannelVideos()));
}
