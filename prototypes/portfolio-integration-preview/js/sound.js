/*
 * Sound. One module owns enablement, the audio context, cue design and
 * playback limits. Everything else calls sound.play("cue") and nothing more.
 *
 * Character: the site is built around a solid made of blocks, so cues are
 * short knocks of a hard material (a filtered noise transient plus a tuned
 * body), not beeps. All cues are synthesised with the Web Audio API at play
 * time: no audio files, nothing to license.
 *
 * Rules:
 *  - Off by default; never plays on load. Only the visible switch turns it on.
 *  - The AudioContext is created inside that click (autoplay policies). If a
 *    stored "on" preference exists, the context still waits for a gesture.
 *  - Per-cue cooldown plus a global voice cap: rapid input never stacks.
 *  - No cue carries information that is not also visible.
 *  - Off under automation unless ?sound=test.
 */

const KEY = "rsx-sound";
const VOLUME = 0.22;
const MAX_VOICES = 3;

// [body frequency Hz, decay s, gain, click brightness Hz]
const CUES = {
  press: { cool: 60, hits: [[520, 0.05, 0.5, 4200]] },
  select: { cool: 80, hits: [[660, 0.06, 0.45, 5200], [990, 0.05, 0.18, 6000, 0.028]] },
  turn: { cool: 160, hits: [[330, 0.09, 0.5, 2600]] },
  settle: { cool: 400, hits: [[247, 0.12, 0.55, 1800], [370, 0.08, 0.2, 2400, 0.045]] },
  open: { cool: 300, hits: [[392, 0.08, 0.45, 3200], [587, 0.12, 0.35, 4200, 0.06]] },
  close: { cool: 300, hits: [[587, 0.07, 0.35, 4200], [392, 0.12, 0.4, 3200, 0.055]] },
  on: { cool: 120, hits: [[740, 0.05, 0.4, 5600], [1110, 0.04, 0.18, 6400, 0.03]] },
  off: { cool: 120, hits: [[740, 0.05, 0.35, 5600], [494, 0.06, 0.2, 3600, 0.03]] },
  theme: { cool: 500, hits: [[294, 0.16, 0.35, 1600], [440, 0.2, 0.22, 2200, 0.07], [587, 0.24, 0.14, 2800, 0.14]] },
};

const automated = typeof navigator !== "undefined" && navigator.webdriver && !/[?&]sound=test/.test(location.search);

let ctx = null;
let master = null;
let noise = null;
let enabled = false;
let voices = 0;
const last = new Map();
const listeners = new Set();

const read = () => { try { return localStorage.getItem(KEY) === "on"; } catch { return false; } };
const write = (v) => { try { localStorage.setItem(KEY, v ? "on" : "off"); } catch { /* storage unavailable */ } };

function ensureContext() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    // A gentle low-pass keeps every cue soft on laptop speakers.
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 7000;
    master.connect(lp).connect(ctx.destination);
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
    return true;
  } catch {
    ctx = null;
    return false;
  }
}

function emit() { for (const fn of listeners) fn(enabled); }

function hit(t0, [freq, decay, gain, bright, offset = 0]) {
  const t = t0 + offset;
  // Transient: a few ms of filtered noise, the "contact".
  const n = ctx.createBufferSource();
  n.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = bright;
  bp.Q.value = 1.4;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(gain * 0.9, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  n.connect(bp).connect(ng).connect(master);
  n.start(t);
  n.stop(t + 0.05);
  // Body: a short tuned resonance, the "material".
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq * 1.04, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.02);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(gain * 0.6, t + 0.004);
  og.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(og).connect(master);
  o.start(t);
  o.stop(t + decay + 0.02);
  return offset + decay;
}

export const sound = {
  get enabled() { return enabled; },
  get available() { return !automated && !!(window.AudioContext || window.webkitAudioContext); },
  init() {
    if (automated) return emit();
    if (read()) {
      enabled = true;
      const arm = () => { if (enabled && ensureContext()) ctx.resume?.(); };
      window.addEventListener("pointerdown", arm, { once: true, capture: true });
      window.addEventListener("keydown", arm, { once: true, capture: true });
    }
    emit();
  },
  /** Call from the sound switch's click handler only. */
  set(on) {
    if (on && (automated || !ensureContext())) { enabled = false; emit(); return false; }
    enabled = on;
    write(on);
    if (on) ctx.resume?.();
    emit();
    return enabled;
  },
  subscribe(fn) { listeners.add(fn); fn(enabled); return () => listeners.delete(fn); },
  play(name) {
    if (!enabled || !ctx || ctx.state !== "running") return;
    const cue = CUES[name];
    if (!cue) return;
    const now = performance.now();
    if (now - (last.get(name) ?? 0) < cue.cool || voices >= MAX_VOICES) return;
    last.set(name, now);
    const t0 = ctx.currentTime + 0.005;
    let end = 0;
    for (const h of cue.hits) end = Math.max(end, hit(t0, h));
    voices++;
    setTimeout(() => { voices--; }, end * 1000 + 40);
  },
};
