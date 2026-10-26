/**
 * Project Space 3D stage: CSS 3D devices with one shared rotation per scene,
 * ported from the accepted Concept D prototype (stage3d.js).
 *
 *   .ps-scene (perspective) > .ps-enter (entry motion) > .ps-rig (rotation) > devices
 *
 * Devices sit at fixed positions inside the rig, so dragging any of them turns
 * the whole composition and their arrangement never changes. Positions are in
 * container-width units (cqw) from the stage centre; phones have their own
 * positions and at most one companion. Bezel, depth and corner radius are
 * fractions of a device's width.
 *
 * Rotation: the horizontal angle is unbounded (a scene can be turned all the
 * way round); during a drag it is the angle at pointer-down plus the drag
 * distance, and on release it is folded back to within half a turn of the
 * default, which looks identical. The vertical angle stays within -30..24
 * degrees. Idle scenes never move. A focused scene also turns with the arrow
 * keys (Home or R resets); this is not advertised.
 *
 * Every device is a closed object: a face, a back plate turned to face
 * backwards (so its details read correctly from behind), four edges. Diagram
 * panels are smoked glass: from behind you see the same drawing through the
 * glass, reversed and dimmed, never a second copy.
 *
 * The markup builders run on the server too (prerendered scenes); the Turn
 * controller and cable only on the client.
 */
import { diagram, esc } from "./diagrams";
import { KIND_LABEL, isReal, type Device, type DeviceKind, type Kind, type Place, type Scene, type Screen } from "./data";

const KIND: Record<DeviceKind, { bz: number; dp: number; rk: number }> = {
  monitor: { bz: 0.016, dp: 0.03, rk: 0.012 },
  window: { bz: 0.006, dp: 0.012, rk: 0.012 },
  tablet: { bz: 0.042, dp: 0.024, rk: 0.06 },
  phone: { bz: 0.06, dp: 0.07, rk: 0.15 },
  tv: { bz: 0.014, dp: 0.026, rk: 0.008 },
  glass: { bz: 0.022, dp: 0.014, rk: 0.022 },
};
const BAR = 0.04;

const MARK = '<b class="ps-bk-mark">RSX</b>';
const BACK: Record<DeviceKind, string> = {
  monitor: `<i class="ps-bk-panel"></i><i class="ps-bk-vent"></i><i class="ps-bk-mount"></i><i class="ps-bk-ports"><i></i><i></i><i></i></i>${MARK}`,
  tv: `<i class="ps-bk-vent"></i><i class="ps-bk-ports"><i></i><i></i></i>${MARK}`,
  tablet: `<i class="ps-bk-cam"><i></i></i>${MARK}`,
  phone: `<i class="ps-bk-cam ps-bk-cam-2"><i></i><i></i></i>${MARK}`,
  window: '<i class="ps-bk-panel"></i>',
  glass: "",
};

export const tagHTML = (k: Kind) => `<span class="ps-tag${isReal(k) ? " ps-tag-real" : ""}">${esc(KIND_LABEL[k])}</span>`;

const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const place = (d: Device): Place | null => (isPhone() ? d.phone : d.at);
const shellHeight = (d: Device, w: number) => {
  const b = KIND[d.kind].bz * w;
  return (w - 2 * b) / d.ar + 2 * b + (d.bar ? BAR * w : 0);
};
const fold = (a: number, c: number) => a - 360 * Math.round((a - c) / 360);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* ---------------------------------------------------------------- markup */
function screenHTML(s: Screen): string {
  if (s.type === "shot") {
    const m = s.media;
    return `<img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(m.alt)}" draggable="false" decoding="async">`;
  }
  if (s.type === "drawing") return diagram(s.media.id, s.media.alt);
  if (s.type === "html") return s.html;
  if (s.none) return `<div class="ps-scr-note ps-scr-none"><b>${esc(s.title)}</b><span>No capture published</span></div>`;
  const parts = [s.tag ? tagHTML(s.tag) : "", `<b>${esc(s.title)}</b>`, s.badge ? `<span class="ps-tag">${esc(s.badge)}</span>` : "", s.off ? `<span class="ps-scr-off">${esc(s.off)}</span>` : ""];
  return `<div class="ps-scr-note${s.host ? " ps-scr-host" : ""}">${parts.join("")}</div>`;
}

function deviceHTML(d: Device): string {
  const k = KIND[d.kind];
  const [x, y, z, w] = d.at;
  const ph = d.phone ? `;--px:${d.phone[0]};--py:${d.phone[1]};--pz:${d.phone[2]};--pw:${d.phone[3]}` : "";
  const style = `--dx:${x};--dy:${y};--dz:${z};--dw:${w}${ph};--ar:${d.ar};--bk:${k.bz};--dk:${k.dp};--rk:${k.rk};--ry:${d.ry ?? 0}`;
  const stand =
    d.kind === "monitor"
      ? '<i class="ps-stand"><i class="ps-st-f"></i><i class="ps-st-b"></i><i class="ps-st-l"></i><i class="ps-st-r"></i></i><i class="ps-foot"></i>'
      : d.kind === "tv"
        ? '<i class="ps-feet"></i>'
        : "";
  const bar = d.bar ? `<div class="ps-d3-bar" aria-hidden="true"><i></i><i></i><i></i><span>${esc(d.bar)}</span></div>` : "";
  return `<div class="ps-d3 ps-d3-${d.kind}" data-dev="${d.id}"${d.screen.type === "shot" ? ' data-real=""' : ""}${d.phone ? "" : ' data-phone="hide"'}${d.origin ? ` data-origin="${d.origin}"` : ""} style="${style}">
      <div class="ps-d3-body">
        <div class="ps-d3-face">${bar}<div class="ps-d3-screen">${screenHTML(d.screen)}</div></div>
        <div class="ps-d3-back" aria-hidden="true">${BACK[d.kind]}</div><i class="ps-e ps-e-t"></i><i class="ps-e ps-e-r"></i><i class="ps-e ps-e-b"></i><i class="ps-e ps-e-l"></i>
      </div>${stand}${d.label ? `<p class="ps-d3-label">${esc(d.label)}</p>` : ""}
    </div>`;
}

/** The scene markup (server and client). */
export function sceneHTML(slug: string, label: string, s: Scene): string {
  return `<div class="ps-scene" data-scene="${slug}" role="group" tabindex="0" aria-label="${esc(label)}">
    <div class="ps-enter"><div class="ps-rig" data-rx="${s.view[0]}" data-ry="${s.view[1]}" style="transform: rotateX(${s.view[0]}deg) rotateY(${s.view[1]}deg)">${s.devices.map(deviceHTML).join("")}${s.cable ? '<div class="ps-cable" aria-hidden="true"></div>' : ""}</div></div>
  </div>`;
}

/* ---------------------------------------------------------------- cable */
type P3 = { x: number; y: number; z: number };
function seg(a: P3, b: P3, cls: string, t: number) {
  const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
  const L = Math.hypot(dx, dy, dz);
  const yaw = Math.atan2(-dz, dx), tilt = Math.asin(dy / L);
  const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
  const base = `translate3d(${m.x.toFixed(3)}cqw, ${m.y.toFixed(3)}cqw, ${m.z.toFixed(3)}cqw) rotateY(${yaw.toFixed(4)}rad) rotateZ(${tilt.toFixed(4)}rad)`;
  const size = `width:${(L + 0.08).toFixed(3)}cqw;height:${t}cqw`;
  return `<i class="${cls}" style="${size};transform:${base} translate(-50%, -50%)"></i><i class="${cls}" style="${size};transform:${base} rotateX(90deg) translate(-50%, -50%)"></i>`;
}
/** A hanging USB cable from the host's right side to the tablet's left edge, at mid-depth. */
function buildCable(scene: SceneEl) {
  const s = scene._def;
  const el = scene.querySelector<HTMLElement>(".ps-cable");
  if (!s?.cable || !el) return;
  const [from, to] = s.cable.map((id) => s.devices.find((d) => d.id === id)!);
  const a0 = place(from), b0 = place(to);
  if (!a0 || !b0) { el.innerHTML = ""; return; }
  const A = { x: a0[0] + a0[3] / 2, y: a0[1] + shellHeight(from, a0[3]) * 0.22, z: a0[2] - (KIND[from.kind].dp * a0[3]) / 2 };
  const B = { x: b0[0] - b0[3] / 2, y: b0[1], z: b0[2] - (KIND[to.kind].dp * b0[3]) / 2 };
  const pA = { x: A.x + 1.4, y: A.y, z: A.z }, pB = { x: B.x - 1.6, y: B.y, z: B.z };
  const sag = Math.max(8, Math.abs(B.y - A.y) * 0.5 + 6);
  const c1 = { x: pA.x + 6, y: pA.y + sag }, c2 = { x: pB.x - 7, y: pB.y + sag };
  const at = (t: number): P3 => {
    const u = 1 - t;
    return {
      x: u * u * u * pA.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * pB.x,
      y: u * u * u * pA.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * pB.y,
      z: pA.z + (pB.z - pA.z) * t,
    };
  };
  const N = 22;
  let html = seg(A, pA, "ps-cb-plug", 0.95) + seg(pB, B, "ps-cb-plug", 0.95);
  for (let i = 0; i < N; i++) html += seg(at(i / N), at((i + 1) / N), "ps-cb", 0.5);
  el.innerHTML = html;
  el.dataset.ends = JSON.stringify([A, B].map((p) => [p.x, p.y, p.z].map((n) => +n.toFixed(2))));
}

/* ---------------------------------------------------------------- rotation */
type SceneEl = HTMLElement & { _def?: Scene; _turn?: Turn };

export class Turn {
  rx: number;
  ry: number;
  private p: { id: number; type: string; x: number; y: number; rx: number; ry: number; active: boolean } | null = null;
  private raf = 0;
  private tw = 0;
  private goal: [number, number];
  private suppress = false;
  private rig: HTMLElement;
  private on: [string, (e: Event) => void][];
  private onClick = (e: Event) => { if (this.suppress) { e.preventDefault(); e.stopPropagation(); this.suppress = false; } };
  private onBlur = () => this.end();

  constructor(private scene: SceneEl, private view: [number, number], private onTurn?: (turned: boolean) => void) {
    this.rig = scene.querySelector<HTMLElement>(".ps-rig")!;
    [this.rx, this.ry] = view;
    this.goal = [...view];
    this.on = [
      ["pointerdown", (e) => this.down(e as PointerEvent)],
      ["pointermove", (e) => this.move(e as PointerEvent)],
      ["pointerup", (e) => this.end(e as PointerEvent)],
      ["pointercancel", (e) => this.end(e as PointerEvent)],
      // Touch starts with implicit capture on the device; handing it to the scene fires a
      // bubbling lostpointercapture, so only the scene's own loss ends a drag.
      ["lostpointercapture", (e) => { if (e.target === this.scene) this.end(e as PointerEvent); }],
      ["dragstart", (e) => e.preventDefault()],
      ["keydown", (e) => this.key(e as KeyboardEvent)],
    ];
    for (const [type, f] of this.on) scene.addEventListener(type, f);
    window.addEventListener("click", this.onClick, true);
    window.addEventListener("blur", this.onBlur);
    this.write();
  }
  destroy() {
    this.end();
    for (const [type, f] of this.on) this.scene.removeEventListener(type, f);
    window.removeEventListener("click", this.onClick, true);
    window.removeEventListener("blur", this.onBlur);
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.tw);
  }
  get turned() {
    return Math.abs(this.rx - this.view[0]) > 0.5 || Math.abs(fold(this.ry, this.view[1]) - this.view[1]) > 0.5;
  }
  private write() {
    this.raf = 0;
    this.rig.style.transform = `rotateX(${this.rx.toFixed(2)}deg) rotateY(${this.ry.toFixed(2)}deg)`;
    this.scene.dataset.turned = String(this.turned);
    this.onTurn?.(this.turned);
  }
  private set(rx: number, ry: number) {
    this.rx = Math.max(-30, Math.min(24, rx));
    this.ry = ry;
    this.raf ||= requestAnimationFrame(() => this.write());
  }
  private settle() {
    this.ry = fold(this.ry, this.view[1]);
    this.write();
  }
  tween(rx: number, ry: number, ms: number) {
    cancelAnimationFrame(this.tw);
    cancelAnimationFrame(this.raf);
    const from = [this.rx, this.ry];
    const to: [number, number] = [Math.max(-30, Math.min(24, rx)), ry];
    this.goal = to;
    if (reducedMotion() || ms <= 0) {
      [this.rx, this.ry] = to;
      this.tw = 0;
      this.write();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
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
  private key(e: KeyboardEvent) {
    const step = ({ ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [-8, 0], ArrowDown: [8, 0] } as Record<string, [number, number]>)[e.key];
    const [rx, ry] = this.tw ? this.goal : [this.rx, this.ry];
    if (step) {
      e.preventDefault();
      this.tween(rx + step[0], ry + step[1], 220);
    } else if (e.key === "Home" || e.key === "r" || e.key === "R") {
      e.preventDefault();
      this.reset();
    }
  }
  private down(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(this.tw);
    this.tw = 0;
    this.p = { id: e.pointerId, type: e.pointerType, x: e.clientX, y: e.clientY, rx: this.rx, ry: this.ry, active: false };
    if (e.pointerType === "mouse") e.preventDefault();
  }
  private move(e: PointerEvent) {
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
    const k = 180 / this.scene.clientWidth;
    this.set(p.rx - (p.type === "mouse" ? dy * k * 0.5 : 0), p.ry + dx * k);
  }
  private end(e?: PointerEvent) {
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
 * Replace the live scene in `host`. The outgoing scene recedes and fades over
 * the incoming one, which settles in: the group, then each device, then the
 * labels and cable. Every new scene starts at its own default angle.
 */
export function mount(host: HTMLElement, slug: string, label: string, s: Scene, opts: { animate: boolean; onTurn?: (turned: boolean) => void }): Turn {
  host.querySelectorAll(".ps-scene.leaving").forEach((el) => el.remove());
  const old = host.querySelector<SceneEl>(".ps-scene");
  const box = document.createElement("div");
  box.innerHTML = sceneHTML(slug, label, s);
  const scene = box.firstElementChild as SceneEl;
  scene._def = s;
  host.append(scene);
  scene._turn = new Turn(scene, s.view, opts.onTurn);
  buildCable(scene);

  if (old) {
    old._turn?.destroy();
    if (opts.animate) {
      old.classList.add("leaving");
      old.inert = true;
      old.setAttribute("aria-hidden", "true");
      old.removeAttribute("tabindex");
      old.querySelector(".ps-enter")?.animate([{ transform: "none" }, { transform: "translateZ(-6cqw) rotateY(7deg)" }], { duration: 200, easing: "ease-out", fill: "forwards" });
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: "ease-out", fill: "forwards" }).finished.then(() => old.remove(), () => old.remove());
    } else old.remove();
  }
  if (!opts.animate) return scene._turn;

  const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
  const ms = (o: KeyframeAnimationOptions): KeyframeAnimationOptions => ({ fill: "backwards", ...o });
  scene.animate([{ opacity: 0 }, { opacity: 1 }], ms({ duration: 260, delay: 60, easing: "ease-out" }));
  scene.querySelector(".ps-enter")?.animate([{ transform: "translateZ(-10cqw) rotateY(-9deg)" }, { transform: "none" }], ms({ duration: 520, delay: 60, easing: EASE }));
  scene.querySelectorAll(".ps-d3").forEach((d, i) => d.animate([{ translate: "0 2.4cqw 0" }, { translate: "0 0 0" }], ms({ duration: 420, delay: 120 + i * 70, easing: EASE })));
  scene.querySelectorAll(".ps-d3-label, .ps-cable > i").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], ms({ duration: 300, delay: 420, easing: "ease-out" })));
  return scene._turn;
}

/** Rebuild cables when the page crosses the phone breakpoint. Returns a cleanup. */
export function watchBreakpoint(): () => void {
  const mq = window.matchMedia("(max-width: 640px)");
  const redraw = () => document.querySelectorAll<SceneEl>(".ps-scene").forEach(buildCable);
  mq.addEventListener("change", redraw);
  return () => mq.removeEventListener("change", redraw);
}

/** A single device from a scene, centred on its own stage (case studies). */
export function soloScene(s: Scene, id: string, w: number, pw: number): Scene {
  const d = s.devices.find((x) => x.id === id)!;
  return { view: [-6, -22], devices: [{ ...d, at: [0, 0, 0, w], phone: [0, 0, 0, pw], ry: 0, origin: undefined, label: undefined }], cap: [] };
}
