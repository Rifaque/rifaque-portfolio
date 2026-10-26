import type { Scene } from "./data";
import { esc } from "./diagrams";

/*
 * 3D objects for the two Also built case studies (QueryCraft, BlueTap), in the
 * Project Space scene language. Neither project has a published capture, so
 * both screens are illustrations: abstract, original drawings of the
 * workflow, labelled as such, never an imitation of a real interface.
 *  - QueryCraft: a question becomes a proposed query with an explanation; it
 *    is validated and runs only when the user chooses Run.
 *  - BlueTap: a home-screen widget assigned to already-paired earbuds; tapping
 *    to connect is drawn dashed because it is not implemented.
 */
const ILL = '<span class="ps-tag">Illustration</span>';

const QUERYCRAFT = `<div class="ps-scr-flow ps-scr-qc">
  ${ILL}
  <p class="qc-q"><span>Question</span>${esc("Which orders shipped late last month?")}</p>
  <div class="qc-card">
    <span class="qc-h">Proposed query <i>local model</i></span>
    <code>SELECT … FROM orders WHERE …</code>
    <span class="qc-why">With an explanation of what it does</span>
    <span class="qc-row"><i class="qc-ok">Validated</i><i class="qc-run">Run</i></span>
  </div>
  <p class="qc-foot">Nothing runs until the user chooses Run.</p>
</div>`;

const BLUETAP = `<div class="ps-scr-flow ps-scr-bt">
  ${ILL}
  <div class="bt-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="bt-widget">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg>
    <span><b>Earbuds</b><small>Already paired · assigned</small></span>
  </div>
  <p class="bt-not">Tap to connect: not built yet</p>
  <div class="bt-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
</div>`;

export type AlsoScene = { scene: Scene; ar: string; label: string };

export const alsoScenes: Record<string, AlsoScene> = {
  querycraft: {
    ar: "16 / 9",
    label: "QueryCraft: an illustration in 3D",
    scene: {
      view: [-6, -22],
      devices: [{ id: "desktop", kind: "monitor", at: [0, 0, 0, 58], phone: [0, 0, 0, 86], ar: 16 / 10, ry: 0, screen: { type: "html", html: QUERYCRAFT } }],
      cap: [["illustration", "Illustration, not a screenshot: generation as a proposal, validated before it runs"]],
    },
  },
  bluetap: {
    ar: "16 / 10",
    label: "BlueTap: an illustration in 3D",
    scene: {
      view: [-6, -22],
      devices: [{ id: "phone", kind: "phone", at: [0, 0, 0, 24], phone: [0, 0, 0, 44], ar: 9 / 19.5, ry: 0, screen: { type: "html", html: BLUETAP } }],
      cap: [["illustration", "Illustration, not a screenshot: assigning and styling work; tap to connect is not built"]],
    },
  },
};
