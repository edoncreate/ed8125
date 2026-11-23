import type { Metadata } from "next";
import { VolumeRows } from "@/components/home/Chapters";
import { Page } from "@/components/page/Page";
import { getVolumes, totalLostTapes } from "@/lib/content";

export const metadata: Metadata = {
  title: "Lost Tapes",
  description: "Fifteen years of ED8125 beats that never left the hard drive, 2005–2021.",
};

export default function LostTapesPage() {
  const volumes = getVolumes();
  return (
    <Page
      kicker={
        <>
          <b>{totalLostTapes()}</b> beats · {volumes[0].from}–{volumes.at(-1)!.to}
        </>
      }
      title="Lost"
      accent="Tapes."
      lead={
        <p>
          Beats made between 2005 and 2021 that never left the hard drive, in four volumes, in the order they were
          made. Rough edges included.
        </p>
      }
    >
      <VolumeRows volumes={volumes} />
    </Page>
  );
}
