import { describe, expect, it } from "vitest";
import { current, initialPlayerState, playerReducer, type PlayerItem } from "@/components/player/state";

const a = (k: string): PlayerItem => ({ type: "audio", track: { key: k, title: k, subtitle: "", src: `/${k}.mp3` } });
const v = (id: string): PlayerItem => ({ type: "video", video: { id, title: id, published: "2025-01-01", thumbnail: "", url: "" } });

describe("playerReducer", () => {
  it("load starts the chosen item of a queue", () => {
    const s = playerReducer(initialPlayerState, { type: "load", queue: [a("x"), a("y")], index: 1 });
    expect(current(s)).toEqual(a("y"));
    expect(s.playing).toBe(true);
  });

  it("toggle pauses and resumes; does nothing when empty", () => {
    expect(playerReducer(initialPlayerState, { type: "toggle" })).toEqual(initialPlayerState);
    const s = playerReducer(initialPlayerState, { type: "load", queue: [a("x")], index: 0 });
    expect(playerReducer(s, { type: "toggle" }).playing).toBe(false);
  });

  it("next/prev move through the queue and stop at the ends", () => {
    let s = playerReducer(initialPlayerState, { type: "load", queue: [a("x"), v("y"), a("z")], index: 0 });
    s = playerReducer(s, { type: "next" });
    expect(current(s)).toEqual(v("y"));
    s = playerReducer(s, { type: "next" });
    s = playerReducer(s, { type: "next" });
    expect(s.index).toBe(2);
    s = playerReducer(s, { type: "prev" });
    expect(current(s)).toEqual(v("y"));
  });

  it("ended advances and keeps playing; ended on the last item stops", () => {
    let s = playerReducer(initialPlayerState, { type: "load", queue: [a("x"), a("y")], index: 0 });
    s = playerReducer(s, { type: "ended" });
    expect(current(s)).toEqual(a("y"));
    expect(s.playing).toBe(true);
    s = playerReducer(s, { type: "ended" });
    expect(s.index).toBe(1);
    expect(s.playing).toBe(false);
  });

  it("close clears everything", () => {
    const s = playerReducer(initialPlayerState, { type: "load", queue: [a("x")], index: 0 });
    expect(playerReducer(s, { type: "close" })).toEqual(initialPlayerState);
  });

  it("load with an out-of-range index clamps", () => {
    const s = playerReducer(initialPlayerState, { type: "load", queue: [a("x")], index: 5 });
    expect(s.index).toBe(0);
  });
});
