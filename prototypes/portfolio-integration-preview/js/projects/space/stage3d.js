/*
 * Concept D stage: CSS 3D devices with one shared rotation per scene. Used by
 * the Projects section and by the case studies.
 *
 *   .scene (perspective) > .enter (entry motion) > .rig (visitor rotation) > devices
 *
 * Devices sit at fixed positions inside the rig, so dragging any of them
 * turns the whole composition and their arrangement never changes. Positions
 * are in container-width units (cqw) from the stage centre; phones have their
 * own positions and at most one companion. Bezel, depth and corner radius
 * are fractions of a device's width, so proportions hold at every size.
 *
 * Rotation: the horizontal angle is unbounded, so visitors can turn a scene
 * all the way round, and keep going. During a drag it is always the angle at
 * pointer-down plus the drag distance (nothing accumulates); when the drag
 * ends it is folded back to within half a turn of the default, which looks
 * identical and keeps numbers small, so Reset takes the short way home. The
 * vertical angle stays within a deliberate range. Idle scenes never move.
 *
 * Every device is a closed object: a face, a back plate turned to face
 * backwards (so its details read correctly from behind), and four edges.
 * Diagram panels are smoked glass: from behind you see the same drawing,
 * reversed and dimmed through the glass, never a second copy.
 */
import { esc, reduced } from "../shared/shell.js";

export const phone = matchMedia("(max-width: 640px)");

// Bezel, depth and corner radius as fractions of the device width.
const KIND = {
  monitor: { bz: 0.016, dp: 0.03, rk: 0.012 },
  window: { bz: 0.006, dp: 0.012, rk: 0.012 },
  tablet: { bz: 0.042, dp: 0.024, rk: 0.06 },
  phone: { bz: 0.06, dp: 0.07, rk: 0.15 },
  tv: { bz: 0.014, dp: 0.026, rk: 0.008 },
  glass: { bz: 0.022, dp: 0.014, rk: 0.022 },
};
const BAR = 0.04; // browser bar height, fraction of width

// What the back of each kind of object carries. Restrained: casing, vents,
// ports, a camera where a real one would be, and a small RSX mark.
const MARK = '<b class="bk-mark">RSX</b>';
const BACK = {
  monitor: `<i class="bk-panel"></i><i class="bk-vent"></i><i class="bk-mount"></i><i class="bk-ports"><i></i><i></i><i></i></i>${MARK}`,
  tv: `<i class="bk-vent"></i><i class="bk-ports"><i></i><i></i></i>${MARK}`,
  tablet: `<i class="bk-cam"><i></i></i>${MARK}`,
  phone: `<i class="bk-cam bk-cam-2"><i></i><i></i></i>${MARK}`,
  window: '<i class="bk-panel"></i>',
  glass: "",
};

/** Position for the current breakpoint: [x, y, z, width], or null when hidden. */
const place = (d) => (phone.matches ? d.phone : d.at);
const shellHeight = (d, w) => {
  const b = KIND[d.kind].bz * w;
  return (w - 2 * b) / d.ar + 2 * b + (d.bar ? BAR * w : 0);
};
/** An angle moved by whole turns to within half a turn of `c`. */
const fold = (a, c) => a - 360 * Math.round((a - c) / 360);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* ---------------------------------------------------------------- markup */
function deviceHTML(d) {
  const k = KIND[d.kind];
  const [x, y, z, w] = d.at;
  const ph = d.phone ? `;--px:${d.phone[0]};--py:${d.phone[1]};--pz:${d.phone[2]};--pw:${d.phone[3]}` : "";
  const style = `--dx:${x};--dy:${y};--dz:${z};--dw:${w}${ph};--ar:${d.ar};--bk:${k.bz};--dk:${k.dp};--rk:${k.rk};--ry:${d.ry ?? 0}`;
  const stand = d.kind === "monitor"
    ? '<i class="d3-stand"><i class="st-f"></i><i class="st-b"></i><i class="st-l"></i><i class="st-r"></i></i><i class="d3-foot"></i>'
    : d.kind === "tv" ? '<i class="d3-feet"></i>' : "";
  return `<div class="d3 d3-${d.kind}" data-dev="${d.id}"${d.real ? ' data-real=""' : ""}${d.phone ? "" : ' data-phone="hide"'}${d.origin ? ` data-origin="${d.origin}"` : ""} style="${style}">
      <div class="d3-body">
        <div class="d3-face">${d.bar ? `<div class="d3-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(d.bar)}</span></div>` : ""}<div class="d3-screen">${d.screen}</div></div>
        <div class="d3-back" aria-hidden="true">${BACK[d.kind]}</div><i class="d3-e d3-t"></i><i class="d3-e d3-r"></i><i class="d3-e d3-b"></i><i class="d3-e d3-l"></i>
      </div>${stand}${d.label ? `<p class="d3-label">${esc(d.label)}</p>` : ""}
    </div>`;
}

export function sceneHTML(slug, label, s, hint) {
  return `<div class="scene" data-scene="${slug}" role="group" tabindex="0" aria-label="${esc(label)}"${hint ? ` aria-describedby="${hint}"` : ""}>
    <div class="enter"><div class="rig" data-rx="${s.view[0]}" data-ry="${s.view[1]}">${s.devices.map(deviceHTML).join("")}${s.cable ? '<div class="cable3" aria-hidden="true"></div>' : ""}</div></div>
  </div>`;
}

/* ---------------------------------------------------------------- cable */
// A hanging USB cable built from short segments, each two crossed strips so it
// has body from every angle. It lives in the rig, between the host's right
// side and the tablet's left edge (the tablet is angled about that edge), at
// each object's mid-depth, so it stays plugged in at any rotation.
function seg(a, b, cls, t) {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const L = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(-dz, dx), tilt = Math.asin(dy / L);
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
  const base = `translate3d(${m.x.toFixed(3)}cqw, ${m.y.toFixed(3)}cqw, ${m.z.toFixed(3)}cqw) rotateY(${yaw.toFixed(4)}rad) rotateZ(${tilt.toFixed(4)}rad)`;
  const size = `width:${(L + 0.08).toFixed(3)}cqw;height:${t}cqw`;
  return `<i class="${cls}" style="${size};transform:${base} translate(-50%, -50%)"></i><i class="${cls}" style="${size};transform:${base} rotateX(90deg) translate(-50%, -50%)"></i>`;
}
function buildCable(scene) {
  const s = scene._def;
  const el = scene.querySelector(".cable3");
  if (!s?.cable || !el) return;
  const [from, to] = s.cable.map((id) => s.devices.find((d) => d.id === id));
  const a0 = place(from), b0 = place(to);
  if (!a0 || !b0) { el.innerHTML = ""; return; }
  const A = { x: a0[0] + a0[3] / 2, y: a0[1] + shellHeight(from, a0[3]) * 0.22, z: a0[2] - (KIND[from.kind].dp * a0[3]) / 2 };
  const B = { x: b0[0] - b0[3] / 2, y: b0[1], z: b0[2] - (KIND[to.kind].dp * b0[3]) / 2 };
  const plugA = { x: A.x + 1.4, y: A.y, z: A.z }, plugB = { x: B.x - 1.6, y: B.y, z: B.z };
  const sag = Math.max(8, Math.abs(B.y - A.y) * 0.5 + 6);
  const c1 = { x: plugA.x + 6, y: plugA.y + sag }, c2 = { x: plugB.x - 7, y: plugB.y + sag };
  const at = (t) => {
    const u = 1 - t;
    return {
      x: u * u * u * plugA.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * plugB.x,
      y: u * u * u * plugA.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * plugB.y,
      z: plugA.z + (plugB.z - plugA.z) * t,
    };
  };
  const N = 22;
  let html = seg(A, plugA, "cb-plug", 0.95) + seg(plugB, B, "cb-plug", 0.95);
  for (let i = 0; i < N; i++) html += seg(at(i / N), at((i + 1) / N), "cb", 0.5);
  el.innerHTML = html;
  el.dataset.ends = JSON.stringify([A, B].map((p) => [p.x, p.y, p.z].map((n) => +n.toFixed(2))));
}

/* ---------------------------------------------------------------- rotation */
class Turn {
  constructor(scene, view) {
    this.scene = scene;
    this.rig = scene.querySelector(".rig");
    this.view = view;
    [this.rx, this.ry] = view;
    this.p = null;
    this.raf = 0;
    this.tw = 0;
    this.suppress = false;
    this.on = {
      pointerdown: (e) => this.down(e),
      pointermove: (e) => this.move(e),
      pointerup: (e) => this.end(e),
      pointercancel: (e) => this.end(e),
      // Only the scene losing capture ends a drag: touch starts with implicit capture on
      // the device, and handing it to the scene fires a bubbling lostpointercapture.
      lostpointercapture: (e) => { if (e.target === this.scene) this.end(e); },
      dragstart: (e) => e.preventDefault(),
      keydown: (e) => this.key(e),
    };
    for (const [type, f] of Object.entries(this.on)) scene.addEventListener(type, f);
    // A drag never doubles as a click on anything underneath.
    this.click = (e) => { if (this.suppress) { e.preventDefault(); e.stopPropagation(); this.suppress = false; } };
    addEventListener("click", this.click, true);
    this.blur = () => this.end();
    addEventListener("blur", this.blur);
    this.write();
  }
  destroy() {
    this.end();
    for (const [type, f] of Object.entries(this.on)) this.scene.removeEventListener(type, f);
    removeEventListener("click", this.click, true);
    removeEventListener("blur", this.blur);
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.tw);
  }
  get turned() { return Math.abs(this.rx - this.view[0]) > 0.5 || Math.abs(fold(this.ry, this.view[1]) - this.view[1]) > 0.5; }
  write() {
    this.raf = 0;
    this.rig.style.transform = `rotateX(${this.rx.toFixed(2)}deg) rotateY(${this.ry.toFixed(2)}deg)`;
    this.scene.dataset.turned = String(this.turned);
    this.scene.dispatchEvent(new CustomEvent("turn", { bubbles: true }));
  }
  set(rx, ry) {
    this.rx = Math.max(-30, Math.min(24, rx));
    this.ry = ry;
    this.raf ||= requestAnimationFrame(() => this.write());
  }
  /** Fold the horizontal angle to within half a turn of the default (no visible change). */
  settle() {
    this.ry = fold(this.ry, this.view[1]);
    this.write();
  }
  /** Ease to an angle from wherever the scene is now; instant with reduced motion. */
  tween(rx, ry, ms) {
    cancelAnimationFrame(this.tw);
    cancelAnimationFrame(this.raf);
    const from = [this.rx, this.ry];
    const to = [Math.max(-30, Math.min(24, rx)), ry];
    this.goal = to;
    if (reduced() || ms <= 0) { [this.rx, this.ry] = to; this.tw = 0; this.write(); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = easeOut(Math.min(1, (now - t0) / ms));
      this.rx = from[0] + (to[0] - from[0]) * k;
      this.ry = from[1] + (to[1] - from[1]) * k;
      this.write();
      this.tw = k < 1 ? requestAnimationFrame(step) : 0;
      if (!this.tw) this.settle();
    };
    this.tw = requestAnimationFrame(step);
  }
  reset() {
    this.settle();
    this.tween(this.view[0], this.view[1], 420);
  }
  /** Keyboard alternative when the scene has focus: arrows turn, Home or R resets. */
  key(e) {
    const step = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [-8, 0], ArrowDown: [8, 0] }[e.key];
    // Repeated presses step from where the last one is heading, not from mid-flight.
    const [rx, ry] = this.tw ? this.goal : [this.rx, this.ry];
    if (step) { e.preventDefault(); this.tween(rx + step[0], ry + step[1], 220); }
    else if (e.key === "Home" || e.key === "r" || e.key === "R") { e.preventDefault(); this.reset(); }
  }

  down(e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(this.tw);
    this.tw = 0;
    this.p = { id: e.pointerId, type: e.pointerType, x: e.clientX, y: e.clientY, rx: this.rx, ry: this.ry, active: false };
    // Mouse: no text selection or native image drag. Touch keeps its default so the page can scroll.
    if (e.pointerType === "mouse") e.preventDefault();
  }
  move(e) {
    const p = this.p;
    if (!p || e.pointerId !== p.id) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (!p.active) {
      if (Math.hypot(dx, dy) < 5) return;
      // A mostly vertical touch movement is a scroll, not a turn.
      if (p.type !== "mouse" && Math.abs(dy) > Math.abs(dx)) { this.p = null; return; }
      p.active = true;
      try { this.scene.setPointerCapture(p.id); } catch { /* pointer already gone */ }
      this.scene.classList.add("is-dragging");
    }
    // About half a turn across the stage width.
    const k = 180 / this.scene.clientWidth;
    this.set(p.rx - (p.type === "mouse" ? dy * k * 0.5 : 0), p.ry + dx * k);
  }
  end(e) {
    const p = this.p;
    if (!p || (e?.pointerId !== undefined && e.pointerId !== p.id)) return;
    this.p = null;
    this.scene.classList.remove("is-dragging");
    try { if (this.scene.hasPointerCapture(p.id)) this.scene.releasePointerCapture(p.id); } catch { /* fine */ }
    if (p.active) {
      cancelAnimationFrame(this.raf);
      this.settle();
      this.suppress = true;
      setTimeout(() => { this.suppress = false; }, 350);
    }
  }
}

/* ---------------------------------------------------------------- mounting */
/**
 * Replace the live scene in `host`. The outgoing scene recedes and fades on
 * top of the incoming one, which settles in: the group first, then each
 * device, then labels and the cable. Every new scene starts at its default.
 */
export function mount(host, slug, label, s, { animate, hint } = {}) {
  host.querySelectorAll(".scene.leaving").forEach((el) => el.remove());
  const old = host.querySelector(".scene");
  const box = document.createElement("div");
  box.innerHTML = sceneHTML(slug, label, s, hint);
  const scene = box.firstElementChild;
  scene._def = s;
  host.append(scene);
  scene._turn = new Turn(scene, s.view);
  buildCable(scene);

  if (old) {
    old._turn?.destroy();
    if (animate) {
      old.classList.add("leaving");
      old.inert = true;
      old.setAttribute("aria-hidden", "true");
      old.removeAttribute("tabindex");
      old.querySelector(".enter").animate([{ transform: "none" }, { transform: "translateZ(-6cqw) rotateY(7deg)" }], { duration: 200, easing: "ease-in", fill: "forwards" });
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-in", fill: "forwards" }).finished.then(() => old.remove(), () => old.remove());
    } else old.remove();
  }
  if (!animate) return scene._turn;

  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const ms = (o) => ({ fill: "backwards", ...o });
  scene.animate([{ opacity: 0 }, { opacity: 1 }], ms({ duration: 260, delay: 60, easing: "ease-out" }));
  scene.querySelector(".enter").animate([{ transform: "translateZ(-10cqw) rotateY(-9deg)" }, { transform: "none" }], ms({ duration: 520, delay: 60, easing: EASE }));
  scene.querySelectorAll(".d3").forEach((d, i) =>
    d.animate([{ translate: "0 2.4cqw 0" }, { translate: "0 0 0" }], ms({ duration: 420, delay: 120 + i * 70, easing: EASE })));
  // Annotations follow the objects they describe.
  scene.querySelectorAll(".d3-label, .cable3 > i").forEach((el) =>
    el.animate([{ opacity: 0 }, { opacity: 1 }], ms({ duration: 300, delay: 420, easing: "ease-out" })));
  return scene._turn;
}

/** Rebuild cables when a scene crosses the phone breakpoint. */
export function watch() {
  phone.addEventListener("change", () => document.querySelectorAll(".scene").forEach(buildCable));
}
