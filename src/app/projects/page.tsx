import type { Metadata } from "next";
import { ProjectCards } from "@/components/home/Chapters";
import { Page } from "@/components/page/Page";
import { getProjects } from "@/lib/content";
import { getChannelVideos } from "@/lib/youtube";

export const metadata: Metadata = { title: "Projects", description: "ED8125's projects: One week one beat and Brasil com amor." };

export default async function ProjectsPage() {
  const videos = await getChannelVideos();
  return (
    <Page kicker="Projects" title="Bodies of" accent="work." lead={<p>Series and albums: beats that belong together.</p>}>
      <ProjectCards projects={getProjects()} videos={videos} />
    </Page>
  );
}
