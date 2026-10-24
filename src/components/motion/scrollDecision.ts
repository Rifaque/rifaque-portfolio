/**
 * Scroll policy for route changes, kept free of React and the DOM so every
 * case can be unit-tested. ScrollManager supplies the inputs and carries out
 * the decision.
 */

export type Place = { pathname: string; search: string; hash: string };

export type NavigationAction = "PUSH" | "REPLACE" | "POP";

export type ScrollInput = {
  action: NavigationAction;
  next: Place;
  /** The location before this change; null on the first render of the document. */
  previous: Place | null;
  /** performance navigation type of the document load; read on the first render only. */
  documentNavigation?: string;
  /** Saved position of the history entry being shown, if any. */
  saved: number | undefined;
  reducedMotion: boolean;
};

export type ScrollDecision =
  | { type: "none" }
  | { type: "top"; behavior: ScrollBehavior }
  | { type: "restore"; y: number }
  | { type: "hash"; id: string; behavior: ScrollBehavior };

export function decideScroll({ action, next, previous, documentNavigation, saved, reducedMotion }: ScrollInput): ScrollDecision {
  const id = hashId(next.hash);
  const position = isPosition(saved) ? saved : undefined;

  // First render of a loaded document. The browser has already placed a
  // fragment target, or is at the top.
  if (!previous) {
    const returning = documentNavigation === "reload" || documentNavigation === "back_forward";
    if (returning && position !== undefined) return { type: "restore", y: position };
    if (id) return { type: "hash", id, behavior: "instant" };
    return { type: "none" };
  }

  // Back and Forward: return to where that entry was left.
  if (action === "POP") {
    if (position !== undefined) return { type: "restore", y: position };
    if (id) return { type: "hash", id, behavior: "instant" };
    return { type: "top", behavior: "instant" };
  }

  // A new route always starts at its top, or at its requested section.
  if (next.pathname !== previous.pathname) {
    if (id) return { type: "hash", id, behavior: "instant" };
    return { type: "top", behavior: "instant" };
  }

  // Same page. A query change is in-page state, such as /lab?layout=.
  if (next.search !== previous.search) return { type: "none" };

  // Same page, intentional anchor navigation, so it may glide.
  const inPage: ScrollBehavior = reducedMotion ? "instant" : "smooth";
  if (id) return { type: "hash", id, behavior: inPage };
  if (previous.hash) return { type: "top", behavior: inPage };
  return { type: "none" };
}

/** The element id a hash points at, or null for no hash. */
export function hashId(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Storage key for a history entry. React Router gives pushed entries a random
 * key kept in history.state, which survives a reload. The entry the document
 * was opened on has no key ("default"), and nor do entries the browser adds
 * for a typed-in hash, so their URL stands in for one.
 */
export function entryKey(location: Place & { key: string }) {
  return location.key && location.key !== "default"
    ? location.key
    : `default:${location.pathname}${location.search}${location.hash}`;
}

function isPosition(y: unknown): y is number {
  return typeof y === "number" && Number.isFinite(y) && y >= 0;
}

/* ---------- saved positions ---------- */

export const STORAGE_KEY = "rsx:scroll";
const LIMIT = 100;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/**
 * Positions by entry key, in memory, mirrored to sessionStorage so a reload
 * can restore them. Unavailable or corrupt storage leaves memory-only use.
 */
export function createScrollStore(storage: StorageLike | null) {
  const positions = new Map<string, number>();

  try {
    const parsed: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(parsed)) {
      for (const entry of parsed) {
        if (Array.isArray(entry) && typeof entry[0] === "string" && isPosition(entry[1])) positions.set(entry[0], entry[1]);
      }
    }
  } catch {
    // Unreadable data is discarded.
  }

  return {
    get: (key: string) => positions.get(key),
    set(key: string, y: number) {
      if (!isPosition(y)) return;
      // Re-insert so the Map's order stays oldest first.
      positions.delete(key);
      positions.set(key, Math.round(y));
      if (positions.size > LIMIT) positions.delete(positions.keys().next().value as string);
    },
    flush() {
      try {
        storage?.setItem(STORAGE_KEY, JSON.stringify([...positions]));
      } catch {
        // Quota or privacy mode: memory still works for this visit.
      }
    },
  };
}
