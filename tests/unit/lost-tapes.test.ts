import { describe, expect, it } from "vitest";
import { cleanTrackTitle, parseLostTapeFilename, parseVolumeFolder, slugify } from "@/lib/lost-tapes";

describe("parseLostTapeFilename", () => {
  it.each([
    ["2005 - Interlude...Ilusões -.mp3", { year: 2005, date: null, title: "Interlude...Ilusões", note: null }],
    ["2006 - Beat ilusões (3).wav", { year: 2006, date: null, title: "Beat ilusões", note: null }],
    ["2006 - beat javier soli - Almohada wave (1).wav", { year: 2006, date: null, title: "Beat javier soli - Almohada wave", note: null }],
    ["2006 - beat stephane grappel (sonar LE) (1).wav", { year: 2006, date: null, title: "Beat stephane grappel", note: "sonar LE" }],
    ["2010 - beat da nostalgia (zidek).mp3", { year: 2010, date: null, title: "Beat da nostalgia", note: "zidek" }],
    ["2015 - Full Moon - ED8125.mp3", { year: 2015, date: null, title: "Full Moon", note: null }],
    ["2019_04_09_Abril MAguas 1000.mp3", { year: 2019, date: "2019-04-09", title: "Abril MAguas 1000", note: null }],
    ["2021_01_03_Tributo_ Carlos_do_Carmo_base.mp3", { year: 2021, date: "2021-01-03", title: "Tributo Carlos do Carmo base", note: null }],
    ["20_07_30_Everything.mp3", { year: 2020, date: "2020-07-30", title: "Everything", note: null }],
  ])("%s", (name, expected) => {
    expect(parseLostTapeFilename(name)).toEqual(expected);
  });

  it("returns null year when the name has no year", () => {
    expect(parseLostTapeFilename("Untitled beat.mp3")).toEqual({ year: null, date: null, title: "Untitled beat", note: null });
  });
});

describe("parseVolumeFolder", () => {
  it("reads volume number and year span", () => {
    expect(parseVolumeFolder("Lost Tapes - vol 2 (2010 - 2014)")).toEqual({
      id: "vol-2",
      label: "Vol. 2",
      from: 2010,
      to: 2014,
    });
  });

  it("treats a bare year folder as its own volume", () => {
    expect(parseVolumeFolder("2020")).toEqual({ id: "2020", label: "2020", from: 2020, to: 2020 });
  });
});

describe("slugify", () => {
  it("makes lowercase ascii slugs", () => {
    expect(slugify("Beat ilusões (3)")).toBe("beat-ilusoes-3");
    expect(slugify("Interlude...Ilusões")).toBe("interlude-ilusoes");
    expect(slugify("Tributo  Carlos do Carmo")).toBe("tributo-carlos-do-carmo");
  });
});

describe("cleanTrackTitle", () => {
  it.each([
    ["LOS MASCHINEROS - Besame", { title: "Los Maschineros – Besame", instrumental: false }],
    ["Los Maschineros - Tive Razão", { title: "Los Maschineros – Tive Razão", instrumental: false }],
    ["Bright INSTR", { title: "Bright", instrumental: true }],
    ["Noite Magica INSTRU", { title: "Noite Magica", instrumental: true }],
    ["Honey Project v2", { title: "Honey", instrumental: false }],
    ["And i love v3 torvao", { title: "And i love torvao", instrumental: false }],
    ["Timi v1", { title: "Timi", instrumental: false }],
    ["01beat kenzo", { title: "Kenzo", instrumental: false }],
    ["1ed-chil beat", { title: "Ed-chil", instrumental: false }],
    ["beat tal", { title: "Tal", instrumental: false }],
    ["Gira Sol", { title: "Gira Sol", instrumental: false }],
    // "beat" and bare numbers are noise in a beatmaker's archive
    ["11 - beat Cavalo Preto", { title: "Cavalo Preto", instrumental: false }],
    ["01 beat Hooverphonic", { title: "Hooverphonic", instrumental: false }],
    ["Beat sgov 1", { title: "Sgov", instrumental: false }],
    ["1beat a tard e q e 1.1", { title: "A tard e q e", instrumental: false }],
    ["1beat JMC 05 new", { title: "JMC", instrumental: false }],
    ["Peace yall beat", { title: "Peace yall", instrumental: false }],
    ["Mellow piano solo - 2", { title: "Mellow piano solo", instrumental: false }],
    ["Beat javier soli - Almohada wave", { title: "Javier soli - Almohada wave", instrumental: false }],
    ["Temes versao 1", { title: "Temes", instrumental: false }],
    ["Sky bEtal wav", { title: "Sky bEtal", instrumental: false }],
    ["Vive Para Seres Grande LowQ", { title: "Vive Para Seres Grande", instrumental: false }],
    ["Chega de Saudade Project", { title: "Chega de Saudade", instrumental: false }],
    ["beat do golpe por ED8125", { title: "Do golpe", instrumental: false }],
    // numbers that belong to a word stay
    ["Tributo a 4Camels", { title: "Tributo a 4Camels", instrumental: false }],
    ["Beatriz", { title: "Beatriz", instrumental: false }],
    // never empties a title
    ["beat 1", { title: "Beat 1", instrumental: false }],
  ])("%s", (raw, expected) => expect(cleanTrackTitle(raw)).toEqual(expected));
});
