import { site } from "@content/site";
import { Header } from "@/components/chrome/Header";
import { AboutChapter, CollabsChapter, LostTapesChapter, NowChapter, ProjectsChapter } from "@/components/home/Chapters";
import { Hero } from "@/components/home/Hero";
import { getCollabs, getProjects, getVolume, getVolumes, lostTapeToPlayable, totalLostTapes } from "@/lib/content";
import { getChannelVideos } from "@/lib/youtube";

/** New YouTube uploads appear within the hour. */
export const revalidate = 3600;

export default async function HomePage() {
  const videos = await getChannelVideos();
  const loopVolume = getVolume(site.soundLoop.volume);
  const loopTrack = loopVolume?.tracks.find((t) => t.slug === site.soundLoop.slug);
  const soundTrack = loopVolume && loopTrack ? lostTapeToPlayable(loopVolume, loopTrack) : null;

  return (
    <>
      <Header variant="home" />
      <main>
        <Hero videos={videos} soundTrack={soundTrack} lostTapes={totalLostTapes()} />
        <NowChapter videos={videos} />
        <ProjectsChapter projects={getProjects()} videos={videos} />
        <LostTapesChapter volumes={getVolumes()} />
        <CollabsChapter collabs={getCollabs()} />
        <AboutChapter />
      </main>
    </>
  );
}
