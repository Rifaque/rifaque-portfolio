/*
 * What every page shares: the theme switch, the sound switch, sound on marked
 * controls, the résumé check and status glyphs. Used by the home page and by
 * each case-study page, so they behave identically.
 *
 * Portfolio integration preview: both header controls name the action they
 * perform. The theme switch reads "Light" in the dark theme and "Dark" in the
 * light one (its icon shows the same target); the sound switch is icon-only,
 * named "Enable sound" or "Mute sound" from the actual audio state.
 */
import { sound } from "./sound.js";
import { site } from "./content.js";

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const root = document.documentElement;
const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
export const reduced = () => root.dataset.motion === "reduce" || mqReduce.matches;

const GLYPHS = {
  released: '<circle cx="6" cy="6" r="5" fill="currentColor"/>',
  delivered: '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.6 6.2l1.6 1.6 3.3-3.4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  "pre-release": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor"/>',
  "in-development": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 2.6V6h2.6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  "private-alpha": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.2 1.6"/>',
  retired: '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.6 9.4l6.8-6.8" stroke="currentColor" stroke-width="1.5"/>',
};
export const glyph = (stage) => `<svg class="glyph" viewBox="0 0 12 12" aria-hidden="true">${GLYPHS[stage]}</svg>`;
export const status = (p) => `<span class="status" data-stage="${p.stage}">${glyph(p.stage)}<span>${esc(p.status)}</span></span>`;

let toastTimer;
export function toast(msg) {
  let t = $("#toast");
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

export function initShell({ onTheme } = {}) {
  const soundBtn = $("#sound-switch");
  sound.init();
  sound.subscribe((on) => {
    const label = on ? "Mute sound" : "Enable sound";
    soundBtn.dataset.on = String(on);
    soundBtn.setAttribute("aria-label", label);
    soundBtn.title = label;
  });
  soundBtn.addEventListener("click", () => {
    const next = !sound.enabled;
    if (!next) sound.play("off");
    const ok = sound.set(next);
    if (next && ok) sound.play("on");
    if (next && !ok) toast(sound.available ? "Sound couldn't start in this browser." : "Sound isn't available here.");
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sound]");
    if (b && b.dataset.sound !== "none") sound.play(b.dataset.sound);
  });

  const themeBtn = $("#theme-switch");
  const sync = () => {
    const light = root.dataset.theme === "light";
    const next = light ? "dark" : "light";
    $(".pref-label", themeBtn).textContent = light ? "Dark" : "Light";
    themeBtn.setAttribute("aria-label", `Switch to ${next} theme`);
    themeBtn.title = `Switch to ${next} theme`;
    $('meta[name="theme-color"]').content = light ? "#f4f5f7" : "#08090b";
    onTheme?.(root.dataset.theme);
  };
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    sound.play("theme");
    if (!reduced()) root.classList.add("theme-shift");
    root.dataset.theme = next;
    try { localStorage.setItem("rsx-theme", next); } catch { /* fine */ }
    sync();
    setTimeout(() => root.classList.remove("theme-shift"), 400);
  });
  sync();

  // The résumé link appears only once the approved PDF actually exists.
  fetch(site.resume, { method: "HEAD" })
    .then((r) => {
      if (r.ok && (r.headers.get("content-type") || "").includes("pdf"))
        $$(".resume-link").forEach((a) => { a.href = site.resume; a.hidden = false; });
    })
    .catch(() => {});

  return { sound };
}
