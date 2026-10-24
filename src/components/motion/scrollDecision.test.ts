import { describe, expect, it } from "vitest";
import { STORAGE_KEY, createScrollStore, decideScroll, entryKey, hashId, type Place, type ScrollInput } from "./scrollDecision";

const home: Place = { pathname: "/", search: "", hash: "" };
const work: Place = { pathname: "/", search: "", hash: "#work" };
const extendspace: Place = { pathname: "/work/extendspace", search: "", hash: "" };

const input = (over: Partial<ScrollInput>): ScrollInput => ({
  action: "PUSH",
  next: extendspace,
  previous: home,
  saved: undefined,
  reducedMotion: false,
  ...over,
});

describe("decideScroll: new routes", () => {
  it("PUSH to a new path starts at the top, instantly", () => {
    expect(decideScroll(input({}))).toEqual({ type: "top", behavior: "instant" });
  });

  it("REPLACE to a new path starts at the top, instantly", () => {
    expect(decideScroll(input({ action: "REPLACE" }))).toEqual({ type: "top", behavior: "instant" });
  });

  it("a saved position for the new entry does not apply to PUSH", () => {
    expect(decideScroll(input({ saved: 900 }))).toEqual({ type: "top", behavior: "instant" });
  });

  it("a new path with a hash goes to its target, instantly", () => {
    const next = { ...extendspace, hash: "#cs-the-question" };
    expect(decideScroll(input({ next }))).toEqual({ type: "hash", id: "cs-the-question", behavior: "instant" });
    expect(decideScroll(input({ next: work, previous: extendspace }))).toEqual({ type: "hash", id: "work", behavior: "instant" });
  });
});

describe("decideScroll: same page", () => {
  it("a hash on the same page glides to its target", () => {
    expect(decideScroll(input({ next: work, previous: home }))).toEqual({ type: "hash", id: "work", behavior: "smooth" });
  });

  it("re-selecting the current hash glides back to it", () => {
    expect(decideScroll(input({ next: work, previous: work }))).toEqual({ type: "hash", id: "work", behavior: "smooth" });
  });

  it("reduced motion makes in-page moves instant", () => {
    expect(decideScroll(input({ next: work, previous: home, reducedMotion: true }))).toEqual({
      type: "hash",
      id: "work",
      behavior: "instant",
    });
    expect(decideScroll(input({ next: home, previous: work, reducedMotion: true }))).toEqual({ type: "top", behavior: "instant" });
  });

  it("leaving a hash for the bare page returns to the top", () => {
    expect(decideScroll(input({ next: home, previous: work }))).toEqual({ type: "top", behavior: "smooth" });
  });

  it("a search-only change keeps the position", () => {
    const lab = (search: string): Place => ({ pathname: "/lab", search, hash: "" });
    expect(decideScroll(input({ next: lab("?layout=stacked"), previous: lab("?layout=pinned") }))).toEqual({ type: "none" });
    expect(decideScroll(input({ action: "REPLACE", next: lab(""), previous: lab("?layout=pinned") }))).toEqual({ type: "none" });
  });

  it("navigating to the URL already shown does nothing", () => {
    expect(decideScroll(input({ next: home, previous: home }))).toEqual({ type: "none" });
  });
});

describe("decideScroll: Back and Forward", () => {
  it("POP restores a saved position", () => {
    expect(decideScroll(input({ action: "POP", next: home, previous: extendspace, saved: 4706 }))).toEqual({ type: "restore", y: 4706 });
  });

  it("Forward is a POP too and restores the same way", () => {
    expect(decideScroll(input({ action: "POP", next: extendspace, previous: home, saved: 0 }))).toEqual({ type: "restore", y: 0 });
  });

  it("POP without a saved position falls back to the hash, then the top", () => {
    expect(decideScroll(input({ action: "POP", next: work, previous: extendspace }))).toEqual({ type: "hash", id: "work", behavior: "instant" });
    expect(decideScroll(input({ action: "POP", next: home, previous: extendspace }))).toEqual({ type: "top", behavior: "instant" });
  });

  it("POP restores instantly even when motion is allowed", () => {
    expect(decideScroll(input({ action: "POP", next: work, previous: home, saved: 120 }))).toEqual({ type: "restore", y: 120 });
  });

  it("invalid saved values are ignored", () => {
    for (const saved of [NaN, -5, Infinity]) {
      expect(decideScroll(input({ action: "POP", next: home, previous: extendspace, saved }))).toEqual({ type: "top", behavior: "instant" });
    }
  });
});

describe("decideScroll: first render of a document", () => {
  const first = (over: Partial<ScrollInput>) => input({ action: "POP", previous: null, ...over });

  it("direct entry leaves the browser at the top", () => {
    expect(decideScroll(first({ documentNavigation: "navigate", saved: 800 }))).toEqual({ type: "none" });
  });

  it("direct entry with a hash goes to its target", () => {
    expect(decideScroll(first({ next: work, documentNavigation: "navigate" }))).toEqual({ type: "hash", id: "work", behavior: "instant" });
  });

  it("refresh restores the entry's saved position, over its hash", () => {
    expect(decideScroll(first({ documentNavigation: "reload", saved: 1500 }))).toEqual({ type: "restore", y: 1500 });
    expect(decideScroll(first({ next: work, documentNavigation: "reload", saved: 1500 }))).toEqual({ type: "restore", y: 1500 });
  });

  it("refresh without a saved position falls back to the hash or stays put", () => {
    expect(decideScroll(first({ next: work, documentNavigation: "reload" }))).toEqual({ type: "hash", id: "work", behavior: "instant" });
    expect(decideScroll(first({ documentNavigation: "reload" }))).toEqual({ type: "none" });
  });

  it("returning to the document through history restores too", () => {
    expect(decideScroll(first({ documentNavigation: "back_forward", saved: 300 }))).toEqual({ type: "restore", y: 300 });
  });

  it("an unknown navigation type is treated as direct entry", () => {
    expect(decideScroll(first({ documentNavigation: undefined, saved: 300 }))).toEqual({ type: "none" });
  });
});

describe("helpers", () => {
  it("hashId decodes, and ignores an empty hash", () => {
    expect(hashId("")).toBeNull();
    expect(hashId("#")).toBeNull();
    expect(hashId("#work-extendspace")).toBe("work-extendspace");
    expect(hashId("#caf%C3%A9")).toBe("café");
    expect(hashId("#%E0%A4%A")).toBe("%E0%A4%A");
  });

  it("entryKey uses the router key, or the URL for the document's first entry", () => {
    expect(entryKey({ ...extendspace, key: "k3x9" })).toBe("k3x9");
    expect(entryKey({ ...home, search: "?a=1", key: "default" })).toBe("default:/?a=1");
    expect(entryKey({ ...work, key: "default" })).toBe("default:/#work");
  });
});

describe("createScrollStore", () => {
  const memory = (initial?: string) => {
    const data = new Map<string, string>(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
    return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), data };
  };

  it("round-trips positions through storage", () => {
    const storage = memory();
    const a = createScrollStore(storage);
    a.set("k1", 4705.6);
    a.flush();
    expect(createScrollStore(storage).get("k1")).toBe(4706);
  });

  it("discards corrupt or malformed data", () => {
    expect(createScrollStore(memory("{not json")).get("k1")).toBeUndefined();
    const store = createScrollStore(memory(JSON.stringify([["k1", "high"], ["k2", -1], [3, 10], ["k4", 40]])));
    expect(store.get("k1")).toBeUndefined();
    expect(store.get("k2")).toBeUndefined();
    expect(store.get("k4")).toBe(40);
  });

  it("works without storage, and when storage throws", () => {
    const none = createScrollStore(null);
    none.set("k", 10);
    none.flush();
    expect(none.get("k")).toBe(10);

    const throwing = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    const store = createScrollStore(throwing);
    store.set("k", 20);
    expect(() => store.flush()).not.toThrow();
    expect(store.get("k")).toBe(20);
  });

  it("keeps at most the 100 most recent entries", () => {
    const store = createScrollStore(null);
    for (let i = 0; i < 105; i++) store.set(`k${i}`, i);
    expect(store.get("k0")).toBeUndefined();
    expect(store.get("k4")).toBeUndefined();
    expect(store.get("k5")).toBe(5);
    expect(store.get("k104")).toBe(104);
  });
});
