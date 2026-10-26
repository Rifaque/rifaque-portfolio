/** Types for sound.js (the accepted design's synthesised UI cues; plain JS, unchanged). */
export declare const sound: {
  init(): void;
  /** Returns whether sound is now on (false if audio could not start). */
  set(on: boolean): boolean;
  play(name: "press" | "select" | "turn" | "settle" | "open" | "close" | "on" | "off" | "theme"): void;
  subscribe(fn: (on: boolean) => void): () => void;
  readonly enabled: boolean;
  readonly available: boolean;
};
