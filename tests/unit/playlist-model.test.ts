import { describe, expect, it } from "vitest";
import { addKey, cleanName, moveKey, removeAt, resolveTracks } from "@/components/playlists/model";
import type { PlayableTrack } from "@/lib/content";

const t = (key: string): PlayableTrack => ({ key, title: key, subtitle: "", src: `/${key}.mp3` });

describe("playlist model", () => {
  it("addKey appends once; adding again leaves the list as is", () => {
    expect(addKey(["a"], "b")).toEqual(["a", "b"]);
    expect(addKey(["a", "b"], "a")).toEqual(["a", "b"]);
  });

  it("removeAt and moveKey keep the rest in order", () => {
    expect(removeAt(["a", "b", "c"], 1)).toEqual(["a", "c"]);
    expect(moveKey(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveKey(["a", "b", "c"], 0, -1)).toEqual(["a", "b", "c"]);
  });

  it("resolveTracks drops keys the catalog no longer has", () => {
    const catalog = new Map([["a", t("a")], ["c", t("c")]]);
    expect(resolveTracks(["a", "gone", "c"], catalog).map((x) => x.key)).toEqual(["a", "c"]);
  });

  it("cleanName trims, collapses spaces and caps at 80 characters", () => {
    expect(cleanName("  Late   night  ")).toBe("Late night");
    expect(cleanName("x".repeat(100))).toHaveLength(80);
    expect(cleanName("   ")).toBe("");
  });
});
