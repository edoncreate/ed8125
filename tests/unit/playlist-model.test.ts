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

describe("filterCatalog (Discography filters)", async () => {
  const { filterCatalog } = await import("@/components/playlists/model");
  type C = import("@/lib/catalog").CatalogTrack;
  const c = (key: string, source: C["source"], year: number, duration: number, title = key): C => ({
    key,
    title,
    subtitle: `${source} · ${year}`,
    src: `/${key}.mp3`,
    duration,
    source,
    year,
  });
  const all: C[] = [
    c("b1", "beats", 2025, 181, "Sigo em frente"),
    c("b2", "beats", 2024, 204, "Temes"),
    c("lt1", "lost-tapes", 2010, 112, "Da nostalgia"),
    c("lt2", "lost-tapes", 2019, 263, "Vou Por Ai"),
    c("al1", "albums", 2016, 95, "Bloco"),
    c("lm1", "collabs", 2013, 278, "Excalibur"),
  ];
  const keys = (opts: Parameters<typeof filterCatalog>[1]) => filterCatalog(all, opts).map((t) => t.key);

  it("keeps catalog order with no filters", () => {
    expect(keys({})).toEqual(["b1", "b2", "lt1", "lt2", "al1", "lm1"]);
  });

  it("filters by source, year and length band", () => {
    expect(keys({ sources: ["lost-tapes"] })).toEqual(["lt1", "lt2"]);
    expect(keys({ years: [2025] })).toEqual(["b1"]);
    expect(keys({ lengths: ["short"] })).toEqual(["lt1", "al1"]); // under 2 min
    expect(keys({ lengths: ["mid"] })).toEqual(["b1", "b2"]); // 2–4 min
    expect(keys({ lengths: ["long"] })).toEqual(["lt2", "lm1"]); // over 4 min
  });

  it("several choices in one group widen it; groups narrow each other", () => {
    expect(keys({ sources: ["lost-tapes", "collabs"] })).toEqual(["lt1", "lt2", "lm1"]);
    expect(keys({ years: [2010, 2013, 2025] })).toEqual(["b1", "lt1", "lm1"]);
    expect(keys({ sources: ["lost-tapes", "collabs"], lengths: ["long"] })).toEqual(["lt2", "lm1"]);
    expect(keys({ sources: [], years: [], lengths: [] })).toHaveLength(6); // empty = no filter
  });

  it("searches title and subtitle, accents ignored", () => {
    expect(keys({ q: "vou por" })).toEqual(["lt2"]);
    expect(keys({ q: "COLLABS" })).toEqual(["lm1"]);
    expect(filterCatalog([c("x", "beats", 2025, 60, "Inquietação")], { q: "inquietacao" })).toHaveLength(1);
  });

  it("sorts newest, oldest, A–Z, shortest, longest", () => {
    expect(keys({ sort: "newest" })).toEqual(["b1", "b2", "lt2", "al1", "lm1", "lt1"]);
    expect(keys({ sort: "oldest" })[0]).toBe("lt1");
    expect(keys({ sort: "az" })[0]).toBe("al1"); // Bloco
    expect(keys({ sort: "shortest" })[0]).toBe("al1");
    expect(keys({ sort: "longest" })[0]).toBe("lm1");
  });

  it("can hide what's already in the playlist", () => {
    expect(keys({ exclude: ["b1", "lt1"] })).toEqual(["b2", "lt2", "al1", "lm1"]);
  });
});
