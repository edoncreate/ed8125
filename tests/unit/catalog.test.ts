import { describe, expect, it } from "vitest";
import { getCatalog } from "@/lib/catalog";
import { totalLostTapes } from "@/lib/content";
import type { Video } from "@/lib/youtube";

const v = (title: string, published: string): Video => ({ id: title, title, published, thumbnail: "", url: "" });

describe("catalog (everything a playlist can hold)", () => {
  const audio = { "Sigo em frente": { file: "39-sigo-em-frente.mp3", duration: 61, episode: 39 } };
  const cat = getCatalog([v("Caminho", "2025-07-15"), v("Sigo em frente", "2025-07-25")], audio);

  it("lists beats with audio first, then albums, then the Lost Tapes", () => {
    expect(cat[0].key).toBe("beat:Sigo em frente"); // test videos use their title as id
    expect(cat.some((t) => t.key === "beat:Caminho")).toBe(false); // no audio yet
    expect(cat.filter((t) => t.key.startsWith("album:brasil-com-amor/"))).toHaveLength(11);
    expect(cat.filter((t) => t.key.startsWith("lt:"))).toHaveLength(totalLostTapes());
  });

  it("has unique keys and a source for every track", () => {
    expect(new Set(cat.map((t) => t.key)).size).toBe(cat.length);
    expect(cat.every((t) => t.src && t.title)).toBe(true);
  });
});
