/**
 * Refreshes content/youtube-snapshot.json from the channel (API if
 * YOUTUBE_API_KEY is set, else the public feed), view counts included. The site
 * merges this with the live list, so it stays complete even when YouTube can't
 * be reached at build.
 *
 *   npm run media:youtube-snapshot
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fetchChannelVideos, mergeVideos, type Video } from "../src/lib/youtube";

const file = new URL("../content/youtube-snapshot.json", import.meta.url);

let previous: Video[] = [];
try {
  previous = JSON.parse(readFileSync(file, "utf8")) as Video[];
} catch {
  // first run
}

const fresh = await fetchChannelVideos();
const all = mergeVideos(previous, fresh);

writeFileSync(file, JSON.stringify(all, null, 2) + "\n");
console.log(`youtube-snapshot.json: ${all.length} videos (${fresh.length} from YouTube)`);
