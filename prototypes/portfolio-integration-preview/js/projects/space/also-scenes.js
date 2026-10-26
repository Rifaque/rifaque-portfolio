/*
 * Portfolio integration preview: 3D objects for the two Also built case
 * studies, in the same scene language as Project Space (stage3d.js devices).
 *
 * Neither project has a published capture, so both screens are illustrations:
 * abstract, original drawings of the workflow, labelled as such, never an
 * imitation of a real interface.
 *  - QueryCraft: a question becomes a proposed query with an explanation; it
 *    is validated and runs only when the user chooses Run.
 *  - BlueTap: a home-screen widget assigned to already-paired earbuds; tapping
 *    to connect is drawn dashed because it is not implemented.
 */
import { esc } from "../shared/shell.js";

const ILL = '<span class="tag">Illustration</span>';

const QUERYCRAFT = `<div class="scr-flow scr-qc">
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

const BLUETAP = `<div class="scr-flow scr-bt">
  ${ILL}
  <div class="bt-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="bt-widget">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10-5 4V3l5 4L7 17"/></svg>
    <span><b>Earbuds</b><small>Already paired · assigned</small></span>
  </div>
  <p class="bt-not">Tap to connect: not built yet</p>
  <div class="bt-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
</div>`;

/** One device, centred on its own stage (as the case studies' single objects). */
const solo = (d, cap) => ({ view: [-6, -22], devices: [{ ...d, at: [0, 0, 0, d.w], phone: [0, 0, 0, d.pw], ry: 0 }], cap: [["illustration", cap]] });

export const ALSO_SCENES = {
  querycraft: () => solo(
    { id: "desktop", kind: "monitor", w: 58, pw: 86, ar: 16 / 10, screen: QUERYCRAFT },
    "Illustration, not a screenshot: generation as a proposal, validated before it runs",
  ),
  bluetap: () => solo(
    { id: "phone", kind: "phone", w: 24, pw: 44, ar: 9 / 19.5, screen: BLUETAP },
    "Illustration, not a screenshot: assigning and styling work; tap to connect is not built",
  ),
};
export const ALSO_AR = { querycraft: "16 / 9", bluetap: "16 / 10" };
