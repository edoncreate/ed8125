/**
 * Refreshes content/youtube-snapshot.json from the channel (API if
 * YOUTUBE_API_KEY is set, else the public feed). The site merges this with the
 * live list, so it stays complete even when YouTube can't be reached at build.
 *
 *   npm run media:youtube-snapshot
 */
import { readFileSync, writeFileSync } from "node:fs";
import { CHANNEL_ID, parseYouTubeFeed, type Video } from "../src/lib/youtube";

const file = new URL("../content/youtube-snapshot.json", import.meta.url);

let previous: Video[] = [];
try {
  previous = JSON.parse(readFileSync(file, "utf8")) as Video[];
} catch {
  // first run
}

const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
const fresh = parseYouTubeFeed(await res.text());

const byId = new Map<string, Video>();
for (const v of [...previous, ...fresh]) byId.set(v.id, v);
const all = [...byId.values()].sort((a, b) => (a.published < b.published ? 1 : -1));

writeFileSync(file, JSON.stringify(all, null, 2) + "\n");
console.log(`youtube-snapshot.json: ${all.length} videos (${fresh.length} from the feed)`);
