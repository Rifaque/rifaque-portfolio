import { sound } from "./sound.js";
export { sound };

/**
 * Theme and sound preferences, shared by the header and the hero. Ported from
 * the accepted design's shell: the theme is stored as `rsx-theme` and applied
 * before first paint by index.html; sound is on unless the visitor has turned
 * it off, and the audio context only starts from a gesture (lib/sound.js).
 */
export type Theme = "dark" | "light";

const root = () => document.documentElement;
export const currentTheme = (): Theme => (root().dataset.theme === "light" ? "light" : "dark");
export const reducedMotion = () => root().dataset.motion === "reduce" || matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Switches the theme for the whole page and tells listeners (the hero) about it. */
export function setTheme(next: Theme) {
  const r = root();
  if (!reducedMotion()) r.classList.add("theme-shift");
  r.dataset.theme = next;
  try {
    localStorage.setItem("rsx-theme", next);
  } catch {
    /* storage unavailable */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "light" ? "#f4f5f7" : "#08090b");
  window.dispatchEvent(new CustomEvent<Theme>("rsx-theme", { detail: next }));
  setTimeout(() => r.classList.remove("theme-shift"), 400);
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** A short status message at the bottom of the screen (role="status"). */
export function toast(msg: string) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.append(t);
  }
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2400);
}
