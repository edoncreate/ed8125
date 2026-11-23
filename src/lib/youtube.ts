/**
 * ED8125's videos come straight from the YouTube channel: upload there and the
 * site lists it (pages revalidate hourly). With YOUTUBE_API_KEY set the whole
 * uploads playlist is read; without it the public feed gives the latest 15.
 * If YouTube can't be reached, the committed snapshot is used instead.
 */

export type Video = {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  published: string;
  thumbnail: string;
  url: string;
};

export const CHANNEL_ID = "UCRrfnRVH5LuN6ORAuGNivDw";
export const CHANNEL_URL = "https://www.youtube.com/@ED8125";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    }
    return ENTITIES[e.toLowerCase()] ?? all;
  });
}

/** "ED8125 - Sigo em frente #shorts" → "Sigo em frente". */
export function cleanTitle(raw: string): string {
  return raw
    .replace(/^\s*ED8125\s*[-–—|:]\s*/i, "")
    .replace(/(\s+#[\p{L}\p{N}_]+)+\s*$/u, "")
    .trim();
}

export function uploadsPlaylistId(channelId: string): string {
  return `UU${channelId.slice(2)}`;
}

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;

function newestFirst(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0));
}

export function parseYouTubeFeed(xml: string): Video[] {
  const videos: Video[] = [];
  for (const [, entry] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const id = /<yt:videoId>([^<]+)<\/yt:videoId>/.exec(entry)?.[1];
    const title = /<title>([\s\S]*?)<\/title>/.exec(entry)?.[1];
    const published = /<published>(\d{4}-\d{2}-\d{2})/.exec(entry)?.[1];
    if (!id || !title || !published) continue;
    videos.push({ id, title: cleanTitle(decode(title)), published, thumbnail: thumb(id), url: watch(id) });
  }
  return newestFirst(videos);
}

type PlaylistItemsPage = {
  nextPageToken?: string;
  items?: { snippet?: { title?: string; publishedAt?: string; resourceId?: { videoId?: string } } }[];
};

async function fromApi(key: string): Promise<Video[]> {
  const videos: Video[] = [];
  let page: string | undefined;
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.search = new URLSearchParams({
      part: "snippet",
      maxResults: "50",
      playlistId: uploadsPlaylistId(CHANNEL_ID),
      key,
      ...(page ? { pageToken: page } : {}),
    }).toString();
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);
    const data = (await res.json()) as PlaylistItemsPage;
    for (const item of data.items ?? []) {
      const s = item.snippet;
      const id = s?.resourceId?.videoId;
      if (!id || !s?.title || !s.publishedAt || s.title === "Private video") continue;
      videos.push({ id, title: cleanTitle(s.title), published: s.publishedAt.slice(0, 10), thumbnail: thumb(id), url: watch(id) });
    }
    page = data.nextPageToken;
  } while (page);
  return newestFirst(videos);
}

async function fromFeed(): Promise<Video[]> {
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
  const videos = parseYouTubeFeed(await res.text());
  if (videos.length === 0) throw new Error("YouTube feed had no entries");
  return videos;
}

/** Every known video, newest first: live from YouTube, merged with the snapshot. */
export async function getChannelVideos(): Promise<Video[]> {
  const snapshot = (await import("@content/youtube-snapshot.json")).default as Video[];
  let live: Video[] = [];
  try {
    const key = process.env.YOUTUBE_API_KEY;
    live = key ? await fromApi(key) : await fromFeed();
  } catch {
    // Offline build or YouTube hiccup: the snapshot keeps the site complete.
  }
  const byId = new Map<string, Video>();
  for (const v of [...snapshot, ...live]) byId.set(v.id, v);
  return newestFirst([...byId.values()]);
}
