/*
 * Page shell shared by the three concepts: header with the approved
 * wordmark, a theme control that names the action it performs, and a
 * compact sound control.
 *
 * Sound is intended to be on by default. Browsers only allow audio after a
 * user gesture, so the context is created on the visitor's first pointer or
 * key press and nothing is claimed to be playing before that. One quiet cue
 * marks a project being selected; nothing plays on scroll or hover.
 */
import { wordmark, STATUS_GLYPH } from "./content.js";

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const root = document.documentElement;
const mq = matchMedia("(prefers-reduced-motion: reduce)");
export const reduced = () => mq.matches || root.dataset.motion === "reduce";
export const status = (p) => `<span class="status" data-stage="${p.stage}"><svg class="glyph" viewBox="0 0 12 12" aria-hidden="true">${STATUS_GLYPH[p.stage]}</svg><span>${esc(p.status)}</span></span>`;
export const mediaTag = (m, KIND) => `<span class="tag${m.kind === "illustration" ? "" : " tag-real"}">${KIND[m.kind]}</span>`;

/* ---------------------------------------------------------------- header */
export function header(conceptName, current) {
  const wm = (v) => `<img class="wm wm-${v}" src="${wordmark[v].src}" srcset="${wordmark[v].src} 1x, ${wordmark[v].src2x} 2x" width="${wordmark[v].w}" height="${wordmark[v].h}" alt="RSX Develops">`;
  const el = document.createElement("header");
  el.className = "site-head";
  el.innerHTML = `<div class="wrap">
    <a class="wm-link" href="../" aria-label="RSX Develops: all concepts">${wm("dark")}${wm("light")}</a>
    <span class="concept-name">${esc(conceptName)}</span>
    <nav class="head-nav" aria-label="Concepts">
      <a href="../capability-carousel/"${current === "a" ? ' aria-current="page"' : ""}>A</a>
      <a href="../interactive-project-space/"${current === "b" ? ' aria-current="page"' : ""}>B</a>
      <a href="../technical-evidence-explorer/"${current === "c" ? ' aria-current="page"' : ""}>C</a>
      <button class="icon-btn" id="theme-btn" type="button"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1z"/></svg><span id="theme-label"></span></button>
      <button class="icon-btn square" id="sound-btn" type="button" aria-pressed="true" aria-label="Sound"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 7.5h3l4-3.2v11.4l-4-3.2h-3z"/><path class="i-wave" d="M13.4 7.2a4 4 0 0 1 0 5.6M15.6 5a7 7 0 0 1 0 10"/><path class="i-x" d="M13.5 7.5l4 5M17.5 7.5l-4 5"/></svg></button>
    </nav></div>`;
  document.body.prepend(el);
  initTheme();
  initSound();
}

/* ---------------------------------------------------------------- theme */
function initTheme() {
  const btn = $("#theme-btn");
  const sync = () => {
    const next = root.dataset.theme === "light" ? "dark" : "light";
    // The control names the action it will perform.
    $("#theme-label").textContent = next === "light" ? "Light" : "Dark";
    btn.setAttribute("aria-label", `Switch to ${next} theme`);
    btn.title = `Switch to ${next} theme`;
  };
  btn.addEventListener("click", () => {
    const apply = () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      try { localStorage.setItem("rsx-theme", root.dataset.theme); } catch { /* fine */ }
      sync();
    };
    // One coordinated cross-fade for the whole page where supported.
    if (document.startViewTransition && !reduced()) document.startViewTransition(apply);
    else apply();
  });
  sync();
}

/* ---------------------------------------------------------------- sound */
let ctx = null;
let on = true;
let last = 0;
function initSound() {
  try { on = localStorage.getItem("rsx-sound") !== "off"; } catch { /* fine */ }
  const btn = $("#sound-btn");
  const sync = () => {
    btn.setAttribute("aria-pressed", String(on));
    btn.title = on ? "Sound on: select to mute" : "Sound off: select to turn on";
  };
  btn.addEventListener("click", () => {
    on = !on;
    try { localStorage.setItem("rsx-sound", on ? "on" : "off"); } catch { /* fine */ }
    sync();
    if (on) cue();
  });
  // Audio may only start after a gesture; create the context on the first one.
  const arm = () => {
    if (ctx || navigator.webdriver) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) try { ctx = new AC(); } catch { ctx = null; }
  };
  addEventListener("pointerdown", arm, { capture: true });
  addEventListener("keydown", arm, { capture: true });
  sync();
}
/** A short, quiet knock. Cooldown so rapid input never stacks. */
export function cue(freq = 520) {
  if (!on || !ctx || ctx.state === "closed") return;
  const now = performance.now();
  if (now - last < 90) return;
  last = now;
  ctx.resume?.();
  const t0 = ctx.currentTime + 0.005;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq * 1.04, t0);
  o.frequency.exponentialRampToValueAtTime(freq, t0 + 0.02);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + 0.11);
}

/* ---------------------------------------------------------------- also built */
export function alsoBuiltHTML(alsoBuilt, caseStudy) {
  return `<aside class="also" aria-labelledby="also-title"><h3 id="also-title">Also built</h3>${alsoBuilt
    .map((a) => `<p><b>${a.slug ? `<a href="${caseStudy(a.slug)}">${esc(a.title)}</a>` : a.href ? `<a href="${a.href}">${esc(a.title)}</a>` : esc(a.title)}</b>. ${esc(a.note)}</p>`)
    .join("")}</aside>`;
}
