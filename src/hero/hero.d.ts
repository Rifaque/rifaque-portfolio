/** Types for hero.js (the accepted design's WebGL hero; plain JS, unchanged apart from how Three.js is loaded). */
export type HeroView = "axo" | "r" | "s" | "x";
export type HeroFrame = { cx: number; cy: number; height: number };
export type Hero = {
  canvas: HTMLCanvasElement;
  readonly view: HeroView;
  frame(f: Partial<HeroFrame>): void;
  theme(name: "dark" | "light"): void;
  setView(name: HeroView, opts?: { instant?: boolean }): void;
  gateOpen(cx: number): Promise<void>;
  gatePlay(onDone: () => void): void;
  gateFinish(onDone?: () => void): void;
  intro(): void;
  nudge(): void;
  render(): void;
  destroy(): void;
};
declare global {
  interface Window {
    /** Poster capture and tests: stop on the gate's first live frame. */
    __gateHold?: boolean;
  }
}
export declare function posterSVG(opts: { label: string }): string;
export declare function createHero(
  host: HTMLElement,
  opts: { reduced: () => boolean; onView?: (v: HeroView) => void; onSettle?: () => void; onContextLost?: () => void; onContextRestored?: () => void },
): Promise<Hero | null>;
