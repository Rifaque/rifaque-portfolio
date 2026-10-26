/*
 * Exploded View prototype controller.
 *
 * Division of labour (mirrors the proposed production split):
 *  - CSS owns resting poses and simple state transitions (explode/collapse,
 *    lift, key presses, switches).
 *  - Anime.js owns choreography that has to be sequenced: layers entering and
 *    leaving on project change, and the signal travelling through a project's
 *    layers ("Run").
 *  - The dossier hand-off is a FLIP with the Web Animations API here; in
 *    production it would be Motion for React (shared element) or a View
 *    Transition, whichever proves simpler inside React.
 *  - Sound goes through sound.js only.
 */
import { animate, createTimeline, stagger } from "../vendor/anime.esm.min.js";
import { projects, more, experience, principles, tech, site } from "./content.js";
import { sound } from "./sound.js";

const $ = (s, el = document) => el.querySelector(s);
const root = document.documentElement;
const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
const reduced = () => root.dataset.motion === "reduce" || (mqReduce.matches && root.dataset.motion !== "full");
const fine = matchMedia("(hover: hover) and (pointer: fine)");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const state = { index: 1, collapsed: false, running: null, opener: null, open: false };

/* ------------------------------------------------------------ status glyphs
   Shape carries the stage, so colour is never the only signal. */
const GLYPHS = {
  released: '<circle cx="6" cy="6" r="5" fill="currentColor"/>',
  delivered: '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.6 6.2l1.6 1.6 3.3-3.4" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  "pre-release": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 1a5 5 0 0 1 0 10z" fill="currentColor"/>',
  "in-development": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6 2.6V6h2.6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  "private-alpha": '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.2 1.6"/>',
  retired: '<circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.6 9.4l6.8-6.8" stroke="currentColor" stroke-width="1.5"/>',
};
const glyph = (stage) => `<svg class="glyph" viewBox="0 0 12 12" aria-hidden="true">${GLYPHS[stage]}</svg>`;
const status = (p) => `<span class="status" data-stage="${p.stage}">${glyph(p.stage)}<span>${esc(p.status)}</span></span>`;

/* ------------------------------------------------------------ toast */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
}

/* ------------------------------------------------------------ theme */
const themeSwitch = $("#theme-switch");
themeSwitch.dataset.short = "Light";
function syncTheme() {
  const light = root.dataset.theme === "light";
  themeSwitch.setAttribute("aria-checked", String(light));
  $('meta[name="theme-color"]').content = light ? "#edf1f7" : "#060a13";
}
themeSwitch.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  const apply = () => {
    root.dataset.theme = next;
    try { localStorage.setItem("rsx-theme", next); } catch { /* fine */ }
    syncTheme();
  };
  sound.play("theme");
  if (reduced()) return apply();
  root.classList.add("theme-shift");
  apply();
  setTimeout(() => root.classList.remove("theme-shift"), 320);
});
syncTheme();

/* ------------------------------------------------------------ sound switch */
const soundSwitch = $("#sound-switch");
soundSwitch.dataset.short = "Sound";
sound.init();
sound.subscribe((on) => {
  soundSwitch.setAttribute("aria-checked", String(on));
  $(".switch-label", soundSwitch).textContent = on ? "Sound on" : "Sound";
});
if (!sound.available) soundSwitch.dataset.unavailable = "";
soundSwitch.addEventListener("click", () => {
  const want = !sound.enabled;
  const ok = sound.set(want);
  if (want && !ok) toast("Sound isn't available in this browser.");
  if (ok) sound.play("on");
});

// Plain keys and links share one press cue; elements with their own cue opt out.
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-sound]");
  if (el && el.dataset.sound !== "none") sound.play(el.dataset.sound);
});

/* ------------------------------------------------------------ faces */
function face(p, { tagged = true } = {}) {
  const f = p.face;
  const tag = tagged ? `<span class="face-tag">${f.kind === "screenshot" ? "SCREENSHOT" : "ILLUSTRATION"}</span>` : "";
  if (f.kind === "screenshot") {
    const cls = f.crop ? "face crop-btl" : "face";
    return `<div class="${cls}">${tag}<img src="${f.src}" ${f.srcset ? `srcset="${f.srcset}" sizes="(max-width: 640px) 90vw, 600px"` : ""} width="${f.w}" height="${f.h}" alt="" decoding="async"></div>`;
  }
  return `<div class="face">${tag}${illustration(f.id)}</div>`;
}
function illustration(id) {
  if (id === "nexus") {
    const bars = [8, 18, 30, 14, 26, 34, 20, 10, 24, 16, 8, 28, 12, 6].map((h) => `<i style="--h:${h}"></i>`).join("");
    return `<div class="ill ill-nexus"><span class="chip">push-to-talk</span><div class="wave">${bars}</div><p class="utter">“Set a timer for ten minutes”</p><span class="chip">→ Command Fabric</span></div>`;
  }
  if (id === "reflux") {
    return `<div class="ill ill-reflux"><div class="work">Film (2021)</div><div class="resume"></div><div class="versions"><span>1080p · local folder</span><span>2160p · Jellyfin</span><span>{edition-Extended} · share</span></div></div>`;
  }
  return `<div class="ill ill-extendspace"><div class="tablet"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><b></b><u></u></div></div>`;
}

/* ------------------------------------------------------------ rail */
const rail = $("#rail");
rail.innerHTML = projects
  .map(
    (p, i) => `<button class="tab" role="tab" id="tab-${p.slug}" aria-controls="readout" aria-selected="false" tabindex="-1" data-i="${i}">
      <span class="tab-n">0${i + 1}</span><span>${esc(p.short ?? p.title)}</span>${p.hubzero ? '<span class="tab-tag">HubZero</span>' : `<span class="status" data-stage="${p.stage}">${glyph(p.stage)}</span>`}
    </button>`,
  )
  .join("");
rail.addEventListener("click", (e) => {
  const b = e.target.closest(".tab");
  if (b) select(+b.dataset.i, { focus: false });
});
rail.addEventListener("keydown", (e) => {
  const map = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  let i = state.index;
  if (e.key in map) i = (i + map[e.key] + projects.length) % projects.length;
  else if (e.key === "Home") i = 0;
  else if (e.key === "End") i = projects.length - 1;
  else return;
  e.preventDefault();
  select(i, { focus: true });
});

/* ------------------------------------------------------------ stack */
const rig = $("#rig");
const stage = $("#stage");

function stackHTML(p) {
  const n = p.layers.length;
  return (
    p.layers
      .map((l, i) => {
        const front = i === 0;
        return `<div class="layer${front ? " is-front" : ""}" style="--i:${i};z-index:${n - i}" data-k="${i}">
          <div class="pane">
            ${front ? face(p) : `<span class="pane-top">0${i + 1} ${esc(l.name)}</span><div class="pane-side"><small>0${i + 1}</small><b>${esc(l.name)}</b><span>${esc(l.role)}</span></div>`}
            <span class="port"></span>
          </div>
        </div>`;
      })
      .join("") + '<span class="spark" aria-hidden="true"></span>'
  );
}

let swapping = null;
function renderStack(p, animateIn) {
  stopRun();
  const build = () => {
    rig.innerHTML = stackHTML(p);
    rig.classList.toggle("is-collapsed", state.collapsed);
    if (!animateIn || reduced()) return;
    const layers = [...rig.querySelectorAll(".layer")];
    layers.forEach((l) => l.style.setProperty("--enter", "1"));
    swapping = animate(layers, { "--enter": [1, 0], duration: 620, delay: stagger(55, { start: 40 }), ease: "outExpo" });
  };
  const old = [...rig.querySelectorAll(".layer")];
  swapping?.pause();
  if (!animateIn || reduced() || !old.length) return build();
  // Old layers sink back and fade, front first, then the new stack rises in.
  swapping = animate(old, { "--enter": [0, 1], duration: 240, delay: stagger(25), ease: "inQuad", onComplete: build });
}

/* Pointer tilt: a few degrees, eased, and only while the pointer moves. */
const tilt = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
function tiltLoop() {
  tilt.x += (tilt.tx - tilt.x) * 0.12;
  tilt.y += (tilt.ty - tilt.y) * 0.12;
  rig.style.setProperty("--rx", `${9 - tilt.y * 5}deg`);
  rig.style.setProperty("--ry", `${-27 + tilt.x * 7}deg`);
  if (Math.abs(tilt.tx - tilt.x) + Math.abs(tilt.ty - tilt.y) > 0.002) tilt.raf = requestAnimationFrame(tiltLoop);
  else tilt.raf = 0;
}
$(".hero").addEventListener("pointermove", (e) => {
  if (!fine.matches || reduced() || innerWidth <= 640) return;
  const r = stage.getBoundingClientRect();
  tilt.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
  tilt.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
  if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltLoop);
});
$(".hero").addEventListener("pointerleave", () => {
  tilt.tx = tilt.ty = 0;
  if (!tilt.raf && (tilt.x || tilt.y)) tilt.raf = requestAnimationFrame(tiltLoop);
});

// Clicking the stage: the front layer opens the dossier; a back layer is inspected.
stage.addEventListener("click", (e) => {
  const l = e.target.closest(".layer");
  if (!l) return;
  if (l.classList.contains("is-front")) openDossier(state.index, $("#open-dossier"));
  else inspect(+l.dataset.k);
});
// The stage stays aria-hidden: keyboard and assistive tech use the equivalent
// buttons in the readout (layer index, Run, Open the dossier).

/* ------------------------------------------------------------ readout */
const readout = $("#readout");
function renderReadout(p) {
  const f = p.face;
  readout.setAttribute("aria-labelledby", `tab-${p.slug}`);
  readout.innerHTML = `
    <div class="ro-head"><h2 class="ro-name">${esc(p.title)}</h2><span class="ro-kicker">${esc(p.kicker)}</span></div>
    <div class="ro-meta">${status(p)}<span class="ro-owner${p.hubzero ? " hz" : ""}">${esc(p.owner)}</span></div>
    ${p.question ? `<p class="ro-q">${esc(p.question)}</p>` : `<p class="ro-q">${esc(p.summary)}</p>`}
    <p class="sr">${esc(f.kind === "screenshot" ? f.alt : f.caption)}</p>
    <div class="ro-actions">
      <button class="key key-primary" type="button" id="run" data-sound="none">${esc(p.run.label)} <span aria-hidden="true">▶</span></button>
      <button class="key" type="button" id="open-dossier" data-sound="none">Open the dossier <span class="arrow" aria-hidden="true">→</span></button>
      ${p.cable ? '<button class="key" type="button" id="cable" data-sound="none" aria-pressed="false">Pull the cable</button>' : ""}
      <button class="switch" type="button" role="switch" id="explode" aria-checked="${!state.collapsed}"><span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span class="switch-label">Taken apart</span></button>
    </div>
    <ol class="layers-index" aria-label="Layers of ${esc(p.title)}">${p.layers
      .map((l, i) => `<li><button type="button" data-k="${i}" aria-describedby="ro-step"><i></i>${esc(l.name)}<span class="sr">: ${esc(l.role)}. ${esc(l.body)}</span></button></li>`)
      .join("")}</ol>
    <p class="ro-step" id="ro-step" aria-live="polite">${esc(p.run.input)}</p>`;
  $("#explode").dataset.short = "Apart";
  $("#run").addEventListener("click", () => run(p));
  $("#open-dossier").addEventListener("click", (e) => openDossier(state.index, e.currentTarget));
  $("#explode").addEventListener("click", (e) => {
    state.collapsed = !state.collapsed;
    e.currentTarget.setAttribute("aria-checked", String(!state.collapsed));
    rig.classList.toggle("is-collapsed", state.collapsed);
    sound.play(state.collapsed ? "off" : "on");
  });
  $("#cable")?.addEventListener("click", (e) => pullCable(p, e.currentTarget));
  readout.querySelectorAll(".layers-index button").forEach((b) => {
    b.addEventListener("click", () => inspect(+b.dataset.k));
  });
}

function setStep(html) { $("#ro-step").innerHTML = html; }
function lit(k, on = true) {
  rig.querySelector(`.layer[data-k="${k}"]`)?.classList.toggle("is-lit", on);
  readout.querySelector(`.layers-index button[data-k="${k}"]`)?.classList.toggle("is-lit", on);
}
function clearLit() {
  rig.querySelectorAll(".is-lit, .is-fault").forEach((el) => el.classList.remove("is-lit", "is-fault"));
  readout.querySelectorAll(".layers-index button").forEach((b) => b.classList.remove("is-lit", "is-done", "is-skipped", "is-fault"));
}

/** Lift one layer out of the stack and say what it does. */
function inspect(k) {
  stopRun();
  const p = projects[state.index];
  clearLit();
  lit(k);
  sound.play("select", { pitch: 1 + k * 0.06 });
  const l = p.layers[k];
  setStep(`<b>0${k + 1} ${esc(l.name)}</b> · ${esc(l.role)}. ${esc(l.body)}`);
}

/* ------------------------------------------------------------ run: the signal travels */
function stopRun() {
  state.running?.pause();
  state.running = null;
  const spark = rig.querySelector(".spark");
  if (spark) spark.style.opacity = "0";
}

function run(p) {
  stopRun();
  clearLit();
  if (state.collapsed) $("#explode").click();
  const n = p.layers.length;
  const order = p.run.reverse ? [...Array(n).keys()].reverse() : [...Array(n).keys()];
  const skip = new Set(p.run.skip ?? []);
  const btns = readout.querySelectorAll(".layers-index button");
  const say = (i, k) => setStep(`<b>${i + 1}/${n}</b> ${esc(p.run.steps[k])}`);

  if (reduced()) {
    // Every final state at once: all layers marked, the full path written out.
    order.forEach((k) => btns[k].classList.add(skip.has(k) ? "is-skipped" : "is-done"));
    setStep(`${p.run.steps.map((s, k) => (skip.has(k) ? `<s>${esc(s)}</s>` : esc(s))).join(" → ")}. <b>${esc(p.run.done)}</b>`);
    sound.play("done");
    return;
  }

  const spark = rig.querySelector(".spark");
  spark.style.setProperty("--p", String(order[0]));
  const tl = createTimeline({ defaults: { ease: "inOutQuad" } });
  tl.add(spark, { opacity: [0, 1], duration: 160 }, 0);
  let t = 120;
  order.forEach((k, i) => {
    if (i > 0) {
      tl.add(spark, { "--p": k, duration: 320 }, t);
      t += 320;
    }
    tl.call(() => {
      if (i > 0) { const prev = order[i - 1]; lit(prev, false); btns[prev].classList.add(skip.has(prev) ? "is-skipped" : "is-done"); }
      if (skip.has(k)) { btns[k].classList.add("is-skipped"); say(i, k); sound.play("step", { pitch: 0.75 }); return; }
      lit(k);
      say(i, k);
      sound.play("step", { pitch: 1 + i * 0.125 });
    }, t);
    t += skip.has(k) ? 380 : 520;
  });
  tl.call(() => {
    const lastK = order[order.length - 1];
    lit(lastK, false);
    btns[lastK].classList.add("is-done");
    setStep(`<b>Done.</b> ${esc(p.run.done)}`);
    sound.play("done");
  }, t);
  tl.add(spark, { opacity: 0, duration: 260 }, t);
  state.running = tl;
}

/* ExtendSpace only: pull the USB cable mid-stream and watch the session recover. */
function pullCable(p, btn) {
  stopRun();
  clearLit();
  const usb = 2;
  btn.disabled = true;
  btn.setAttribute("aria-pressed", "true");
  const layer = rig.querySelector(`.layer[data-k="${usb}"]`);
  const ill = rig.querySelector(".ill-extendspace");
  const b = readout.querySelector(`.layers-index button[data-k="${usb}"]`);
  layer.classList.add("is-fault");
  b.classList.add("is-fault");
  ill?.classList.add("is-down");
  sound.play("fault");
  setStep("<b>Cable pulled.</b> The link is down; the session notices instead of hanging.");
  const wait = reduced() ? 0 : 1300;
  setTimeout(() => {
    layer.classList.remove("is-fault");
    b.classList.remove("is-fault");
    lit(usb);
    lit(1);
    setStep("<b>Reconnected.</b> The stream resumes at the next keyframe.");
    sound.play("on");
    setTimeout(() => {
      ill?.classList.remove("is-down");
      clearLit();
      setStep("<b>Video flowing again.</b> Tested on one PC and one tablet.");
      sound.play("done");
      btn.disabled = false;
      btn.setAttribute("aria-pressed", "false");
    }, wait);
  }, wait);
}

/* ------------------------------------------------------------ select */
function select(i, { focus = false, animateIn = true, quiet = false } = {}) {
  if (i === state.index && rig.childElementCount) { if (focus) rail.children[i].focus(); return; }
  state.index = i;
  [...rail.children].forEach((b, j) => {
    b.setAttribute("aria-selected", String(j === i));
    b.tabIndex = j === i ? 0 : -1;
  });
  if (focus) rail.children[i].focus();
  const p = projects[i];
  renderStack(p, animateIn);
  renderReadout(p);
  if (!quiet) sound.play("select");
}

/* ------------------------------------------------------------ dossier */
const dlg = $("#dossier");
const sheet = $("#dossier-sheet");

function dossierHTML(p) {
  const f = p.face;
  const fig =
    f.kind === "screenshot"
      ? `<figure class="d-figure${f.crop ? " btl" : ""}"><div class="frame"><img src="${f.src}" ${f.srcset ? `srcset="${f.srcset}" sizes="(max-width: 1080px) 92vw, 700px"` : ""} width="${f.w}" height="${f.h}" alt="${esc(f.alt)}"></div><figcaption><b>SCREENSHOT</b>${esc(f.caption.replace(/^Screenshot( \(composite\))? · /, ""))}</figcaption></figure>`
      : `<figure class="d-figure"><div class="frame" role="img" aria-label="${esc(f.caption)}">${illustration(f.id)}</div><figcaption><b>ILLUSTRATION</b>${esc(f.caption.replace(/^Illustration · /, ""))}</figcaption></figure>`;
  const facts = [["Ownership", p.owner], ["Role", p.role], ["Period", p.period], ["Licence", p.licence]].filter(([, v]) => v);
  return `
    <header class="d-hero">
      <div>
        <h1 id="d-title" tabindex="-1">${esc(p.title)}</h1>
        <p class="d-kicker">${esc(p.kicker)}</p>
        ${status(p)}
        ${p.question ? `<p class="d-q">${esc(p.question)}</p>` : `<p class="d-q">${esc(p.summary)}</p>`}
        <dl class="d-facts">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
        ${p.credit ? `<p class="d-credit">${esc(p.credit)}</p>` : ""}
      </div>
      ${fig}
    </header>
    <section class="d-section"><h2>Why it exists</h2>${(p.question ? [p.summary, ...p.why] : p.why).map((t) => `<p>${esc(t)}</p>`).join("")}</section>
    <section class="d-section"><h2>Taken apart</h2>
      <ol class="d-layers">${p.layers.map((l, i) => `<li style="--k:${i}"><span class="n">0${i + 1}</span><span><b>${esc(l.name)}</b><small>${esc(l.role)}</small></span><p>${esc(l.body)}</p></li>`).join("")}</ol>
    </section>
    <section class="d-section"><h2>Decisions</h2><div class="d-grid">${p.decisions.map(([h, b]) => `<article><h3>${esc(h)}</h3><p>${esc(b)}</p></article>`).join("")}</div></section>
    <section class="d-section"><h2>What isn't done</h2><ul class="d-limits">${p.limits.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
    <section class="d-section"><h2>Stack</h2><ul class="d-stack">${p.stack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></section>
    <section class="d-section"><h2>Explore</h2>
      <div class="d-links">
        <a class="key key-primary" href="/work/${p.slug}" data-proto="case">Full case study <span class="arrow" aria-hidden="true">→</span></a>
        ${p.links.map((l) => `<a class="key" href="${l.href}" rel="noopener">${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join("")}
      </div>
      ${p.linksNote ? `<p class="d-note">${esc(p.linksNote)}</p>` : ""}
    </section>`;
}

function fillDossier(i) {
  const p = projects[i];
  const n = projects.length;
  $("#d-body").innerHTML = dossierHTML(p);
  $("#d-count").textContent = `Dossier 0${i + 1} / 0${n}`;
  const prev = projects[(i - 1 + n) % n];
  const next = projects[(i + 1) % n];
  $("#d-prev").textContent = `← ${prev.short ?? prev.title}`;
  $("#d-next").textContent = `${next.short ?? next.title} →`;
  sheet.scrollTop = 0;
}

let sheetAnim = null;
function frontRect() {
  const front = rig.querySelector(".layer.is-front .pane");
  return front ? front.getBoundingClientRect() : null;
}
function clipFrom(r) {
  const W = innerWidth, H = innerHeight;
  return `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px round 22px)`;
}

function openDossier(i, opener, { push = true } = {}) {
  if (state.open) return;
  state.open = true;
  state.opener = opener ?? null;
  if (i !== state.index) select(i, { animateIn: false, quiet: true });
  stopRun();
  fillDossier(i);
  if (push) history.pushState({ project: projects[i].slug }, "", `?project=${projects[i].slug}`);
  dlg.showModal();
  sound.play("open");
  const body = $("#d-body");
  const title = $("#d-title");
  if (reduced()) {
    sheetAnim = sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "linear" });
    title.focus({ preventScroll: true });
    return;
  }
  // Hand-off: the sheet opens out of the front layer's rectangle while the
  // project's face lifts off the layer and lands in the dossier figure.
  const r = frontRect();
  body.style.setProperty("--in", "0");
  sheetAnim = sheet.animate(
    [{ clipPath: r ? clipFrom(r) : "inset(40% 30% round 22px)", opacity: 0.85 }, { clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 }],
    { duration: 760, easing: "cubic-bezier(0.7, 0, 0.2, 1)" },
  );
  if (r) fly(projects[i], r, $(".d-figure .frame"), 760);
  animate(body.children, { "--in": [0, 1], duration: 520, delay: stagger(70, { start: 420 }), ease: "outQuart" });
  setTimeout(() => body.style.removeProperty("--in"), 1600);
  title.focus({ preventScroll: true });
}

/** Shared-element flight between the front layer and the dossier figure. */
function fly(p, fromRect, target, duration, reverse = false) {
  if (!target) return Promise.resolve();
  const to = target.getBoundingClientRect();
  const a = reverse ? to : fromRect;
  const b = reverse ? fromRect : to;
  const ghost = document.createElement("div");
  ghost.className = "ghost";
  ghost.innerHTML = face(p, { tagged: false });
  Object.assign(ghost.style, { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px` });
  dlg.append(ghost);
  target.style.visibility = "hidden";
  const t = (r) => `translate(${r.left - b.left}px, ${r.top - b.top}px) scale(${r.width / b.width}, ${r.height / b.height})`;
  const anim = ghost.animate(
    [{ transform: t(a), opacity: 1 }, { transform: "none", opacity: reverse ? 0.2 : 1 }],
    { duration, easing: "cubic-bezier(0.7, 0, 0.2, 1)" },
  );
  return anim.finished.finally(() => { ghost.remove(); target.style.visibility = ""; });
}

function closeDossier({ pop = false } = {}) {
  if (!state.open) return;
  state.open = false;
  sound.play("close");
  const finish = () => {
    dlg.close();
    const back = state.opener && document.contains(state.opener) ? state.opener : $("#open-dossier") ?? rail.children[state.index];
    back?.focus({ preventScroll: true });
  };
  if (!pop && new URLSearchParams(location.search).has("project")) history.back();
  sheetAnim?.cancel();
  if (reduced()) {
    sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).finished.then(finish, finish);
    return;
  }
  const r = frontRect();
  const fig = $(".d-figure .frame");
  const figVisible = fig && fig.getBoundingClientRect().bottom > 0;
  if (r && figVisible) fly(projects[state.index], r, fig, 520, true);
  sheet
    .animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)", opacity: 1 }, { clipPath: r ? clipFrom(r) : "inset(40% 30% round 22px)", opacity: 0.3 }], {
      duration: 520,
      easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    })
    .finished.then(finish, finish);
}

function stepDossier(d) {
  const n = projects.length;
  const i = (state.index + d + n) % n;
  select(i, { animateIn: false, quiet: true });
  fillDossier(i);
  history.replaceState({ project: projects[i].slug }, "", `?project=${projects[i].slug}`);
  sound.play("select");
  $("#d-title").focus({ preventScroll: true });
}

dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeDossier(); });
$("#d-close").addEventListener("click", () => closeDossier());
$("#d-prev").addEventListener("click", () => stepDossier(-1));
$("#d-next").addEventListener("click", () => stepDossier(1));
dlg.addEventListener("click", (e) => {
  const a = e.target.closest('[data-proto="case"]');
  if (a) { e.preventDefault(); toast("Prototype: /work/<slug> case studies already exist in production and stay as they are."); }
});
addEventListener("popstate", () => {
  const slug = new URLSearchParams(location.search).get("project");
  const i = projects.findIndex((p) => p.slug === slug);
  if (i >= 0 && !state.open) openDossier(i, null, { push: false });
  else if (i < 0 && state.open) closeDossier({ pop: true });
});

/* ------------------------------------------------------------ trace a technology */
const techEl = $("#tech");
const traceMap = $("#trace-map");
const allNames = Object.fromEntries([...projects, ...more].map((p) => [p.slug, p]));
let activeTech = null;
techEl.innerHTML = tech
  .map(([name, slugs], i) => `<button class="switch" type="button" role="switch" aria-checked="false" data-t="${i}"><span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span><span>${esc(name)}</span><span class="count" aria-label="${slugs.length} projects">${slugs.length}</span></button>`)
  .join("");
function renderTrace() {
  if (activeTech === null) {
    traceMap.innerHTML = `<li class="hint"><b>Nothing switched on</b><small>Pick a technology on the left.</small></li>`;
    return;
  }
  const [name, slugs] = tech[activeTech];
  traceMap.innerHTML = slugs
    .map((s) => {
      const p = allNames[s];
      return `<li class="is-on"><b>${esc(p.title)}</b>${status(p)}<small>${esc(name)} · ${esc(p.kicker)}</small></li>`;
    })
    .join("");
  if (!reduced()) animate(traceMap.children, { opacity: [0, 1], translateX: [-10, 4], duration: 420, delay: stagger(50), ease: "outQuart" });
}
techEl.addEventListener("click", (e) => {
  const b = e.target.closest(".switch");
  if (!b) return;
  const i = +b.dataset.t;
  activeTech = activeTech === i ? null : i;
  techEl.querySelectorAll(".switch").forEach((s) => s.setAttribute("aria-checked", String(+s.dataset.t === activeTech)));
  sound.play(activeTech === null ? "off" : "on");
  renderTrace();
});
renderTrace();

/* ------------------------------------------------------------ profile, more */
$("#strata").innerHTML = experience
  .map((x, k) => `<li style="--k:${k}"><div><h3>${esc(x.org)}</h3><span class="role">${esc(x.role)}</span></div><span class="period">${esc(x.period)}</span><p>${esc(x.body)}</p></li>`)
  .join("");
$("#rules").innerHTML = principles.map(([h, b]) => `<li><b>${esc(h)}</b><span>${esc(b)}</span></li>`).join("");
$("#more-list").innerHTML = more
  .map((m) => `<li><h3>${esc(m.title)}</h3><span class="kick">${esc(m.kicker)}</span>${status(m)}<p>${esc(m.body)}</p><span class="meta">${esc(m.meta)}</span>${m.link ? `<a class="key key-small" href="${m.link.href}" rel="noopener">${esc(m.link.label)} ↗</a>` : ""}</li>`)
  .join("");
document.querySelector('[data-note="archive"]').addEventListener("click", (e) => { e.preventDefault(); toast("Prototype: the /archive route exists in production and stays as it is."); });

/* Résumé: shown only when the file is actually there. No broken link. */
fetch(site.resume, { method: "HEAD" })
  .then((r) => { if (r.ok && /pdf/.test(r.headers.get("content-type") ?? "")) $("#resume-link").hidden = false; })
  .catch(() => { /* missing or file:// — keep it hidden */ });

/* ------------------------------------------------------------ start */
const startSlug = new URLSearchParams(location.search).get("project");
const startIndex = projects.findIndex((p) => p.slug === startSlug);
state.index = -1;
select(startIndex >= 0 ? startIndex : 1, { animateIn: !reduced(), quiet: true });
if (startIndex >= 0) openDossier(startIndex, null, { push: false });

// Test hooks for screenshots (prototype only).
window.__proto = { select, run: () => run(projects[state.index]), inspect, openDossier, closeDossier, state };
