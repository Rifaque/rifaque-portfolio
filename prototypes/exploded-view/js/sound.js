/*
 * Sound: one module owns enablement, volume, the audio context and playback
 * limits. Components call sound.play("select") and nothing else.
 *
 * Every cue is synthesised with the Web Audio API at play time: no files, no
 * third-party assets, no licence to track. Cues are short (40–260 ms), quiet
 * and pitched around one tonal centre, so the set sounds like one instrument.
 *
 * Rules:
 *  - Off by default. Nothing plays until the visitor switches sound on.
 *  - The AudioContext is created inside that click, which satisfies autoplay
 *    policies; if it can't be created, sound stays off and the switch says so.
 *  - Off under automation (navigator.webdriver) unless ?sound=test is set.
 *  - Per-cue cooldown and a voice cap, so rapid input never stacks sounds.
 *  - No cue is the only signal of anything: every state is also visible.
 */

const KEY = "rsx-sound";
const VOLUME = 0.16;
const MAX_VOICES = 4;

// Frequencies sit on an A-minor pentatonic around A4 so cues never clash.
const N = { A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880 };

/** Each cue: a list of notes [freq, startOffset s, duration s, gain, type]. */
const CUES = {
  press: { cool: 50, notes: [[N.A4, 0, 0.05, 0.5, "triangle"]] },
  select: { cool: 70, notes: [[N.E5, 0, 0.06, 0.45, "sine"], [N.A5, 0.012, 0.05, 0.12, "sine"]] },
  open: { cool: 300, notes: [[N.A4, 0, 0.09, 0.4, "sine"], [N.E5, 0.07, 0.14, 0.35, "sine"]] },
  close: { cool: 300, notes: [[N.E5, 0, 0.08, 0.35, "sine"], [N.A4, 0.06, 0.13, 0.3, "sine"]] },
  on: { cool: 90, notes: [[N.D5, 0, 0.05, 0.45, "triangle"], [N.G5, 0.035, 0.05, 0.25, "sine"]] },
  off: { cool: 90, notes: [[N.G4, 0, 0.05, 0.45, "triangle"], [N.D4, 0.035, 0.05, 0.25, "sine"]] },
  theme: { cool: 400, notes: [[N.C5, 0, 0.18, 0.22, "sine"], [N.G5, 0.05, 0.22, 0.14, "sine"]] },
  step: { cool: 40, notes: [[N.A4, 0, 0.045, 0.32, "sine"]] },
  done: { cool: 400, notes: [[N.A4, 0, 0.1, 0.3, "sine"], [N.C5, 0.08, 0.1, 0.28, "sine"], [N.E5, 0.16, 0.2, 0.26, "sine"]] },
  fault: { cool: 400, notes: [[N.E4, 0, 0.1, 0.35, "triangle"], [N.C4, 0.08, 0.16, 0.3, "triangle"]] },
};

const automated = typeof navigator !== "undefined" && navigator.webdriver && !/[?&]sound=test/.test(location.search);

let ctx = null;
let master = null;
let enabled = false;
let voices = 0;
const last = new Map();
const listeners = new Set();

function read() {
  try { return localStorage.getItem(KEY) === "on"; } catch { return false; }
}
function write(v) {
  try { localStorage.setItem(KEY, v ? "on" : "off"); } catch { /* storage unavailable: fine */ }
}

function ensureContext() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);
    return true;
  } catch {
    ctx = null;
    return false;
  }
}

function emit() { for (const fn of listeners) fn(enabled); }

export const sound = {
  get enabled() { return enabled; },
  get available() { return !automated && !!(window.AudioContext || window.webkitAudioContext); },
  /** Call once at startup. Restores the stored choice, but the context waits for a gesture. */
  init() {
    if (automated) return;
    if (read()) {
      enabled = true;
      // Browsers need a gesture before audio; arm on the first one.
      const arm = () => { if (enabled && ensureContext()) ctx.resume?.(); };
      window.addEventListener("pointerdown", arm, { once: true, capture: true });
      window.addEventListener("keydown", arm, { once: true, capture: true });
    }
    emit();
  },
  /** Must be called from a user gesture (the sound switch). */
  set(on) {
    if (on && (automated || !ensureContext())) { enabled = false; emit(); return false; }
    enabled = on;
    write(on);
    if (on) ctx.resume?.();
    emit();
    return enabled;
  },
  subscribe(fn) { listeners.add(fn); fn(enabled); return () => listeners.delete(fn); },
  play(name, { at = 0, pitch = 1 } = {}) {
    if (!enabled || !ctx || ctx.state !== "running") return;
    const cue = CUES[name];
    if (!cue) return;
    const now = performance.now();
    if (!at && now - (last.get(name) ?? 0) < cue.cool) return;
    if (voices >= MAX_VOICES) return;
    last.set(name, now);
    const t0 = ctx.currentTime + 0.005 + at;
    let end = 0;
    for (const [f, off, dur, g, type] of cue.notes) {
      const o = ctx.createOscillator();
      const v = ctx.createGain();
      o.type = type;
      o.frequency.value = f * pitch;
      // Fast attack, exponential release: a soft "tok", never a beep.
      v.gain.setValueAtTime(0.0001, t0 + off);
      v.gain.exponentialRampToValueAtTime(g, t0 + off + 0.006);
      v.gain.exponentialRampToValueAtTime(0.0001, t0 + off + dur);
      o.connect(v).connect(master);
      o.start(t0 + off);
      o.stop(t0 + off + dur + 0.02);
      end = Math.max(end, off + dur);
    }
    voices++;
    setTimeout(() => { voices--; }, (at + end) * 1000 + 40);
  },
};
