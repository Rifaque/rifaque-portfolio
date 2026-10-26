# Signal Path: visual prototype (Milestone 1)

An isolated prototype for reviewing the visual direction of the RSX Develops rebuild. It is **not** production code: no framework, no build step, no dependencies, and nothing loaded from the network. The production app (Milestone 2 onwards) will be written fresh. Only decisions carry over, not this code.

Built 2026-10-25. Content comes from `knowledge-base/` (see "Content" below).

## How to view

Either works:

1. **Local server (recommended; needed for URL state with `?project=`)**, from the repository root:
   ```
   python -m http.server 8765 --bind 127.0.0.1
   ```
   Then open <http://127.0.0.1:8765/prototypes/signal-path/>. Bind to `127.0.0.1` only: the server exposes the whole repository folder, including the private notes file, to anything that can reach it.
2. **Direct file**: double-click `index.html`. Everything renders; Chrome may refuse history changes on `file://`, which the prototype tolerates (the dossier still opens and closes, but the address bar won't update).

Prototype-only URL switches: `?accent=amber|vermilion|copper`, `?type=geist|alt`, `?motion=reduce`, `?clean` (hides the prototype control panel), `?project=nexus|atlas|reflux|extendspace` (opens that dossier on load). The **Prototype** panel (bottom right) switches accent, type pairing and simulated reduced motion live. `accents.html` is the side-by-side comparison board.

## Files

| Path | What it does |
|---|---|
| `index.html` | Page shell: opening, ribbon section, sample HubZero/smaller entries, contact footer, the dossier `<dialog>`, prototype controls |
| `accents.html` | Accent board: three accents × ink/paper with live WCAG contrast ratios; Geist vs Bahnschrift specimens |
| `css/signal.css` | Tokens for both atmospheres, accents, type pairings, ribbon, dossier, responsive and reduced-motion rules |
| `js/projects.js` | Content for the four ribbon projects (full dossiers) and four compact entries, plus the four illustrations as inline SVG |
| `js/app.js` | Ribbon geometry and input, selection, dossier open/close/prev/next, URL state, focus management, prototype controls |
| `fonts/` | Geist and Geist Mono (latin variable woff2) with their SIL OFL licences, copied from the local npm cache (no install, no network) |
| `screenshots/` | Captured review images (listed below) |

Images are referenced in place from `knowledge-base/assets/`; nothing was duplicated.

## What it tests

1. **Opening.** A compact typographic band (name, positioning line, CTAs) with a ticked rail along its lower edge, so the ribbon enters the first viewport instead of sitting below a full-height hero.
2. **Connected ribbon.** The four segments form one chain: each segment's left edge is the previous one's right edge, posed with CSS 3D. The selected segment faces the viewer; the others fold away along a smooth curve and fall into shadow. The chain is recomputed every frame, so it stays connected mid-animation and mid-drag. Continuous top and bottom rails, hinge nodes at each fold and lead-in/lead-out lines carry the "signal path".
3. **Selection.** The lit rail is in the accent colour, with a one-shot sweep when a project is selected. A status strip under the ribbon doubles as the "Right now" list, and a readout gives the title, status, question, summary and actions.
4. **Hand-off.** The paper atmosphere opens out of the selected segment (a clip-path from the segment's rectangle to the full viewport, 720 ms). The dark page recedes slightly (scale 0.965, dimmed), and the dossier content fades up once the paper is open. Closing reverses it into the current segment.
5. **Dossier (reading environment).** Warm paper, ink type. Sections: Why it exists · How it works (a numbered path, the signal motif drawn in ink) · Decisions and trade-offs · Stack, and why it matters · Status and limits · Explore. Every visual carries a **Screenshot** or **Illustration** tag.
6. **Accents.** Sodium amber, signal vermilion and oxidised copper-green, each with one tuning for ink and one for paper.
7. **Status without colour.** Status glyphs are monochrome shapes plus text, so no accent can be confused with a status.
8. **Type.** Geist + Geist Mono versus Bahnschrift + Cascadia Mono.

## Interaction contract as built

- **Pointer:** click a side segment to select it; click the selected one (or "Open the dossier") to open.
- **Touch:** horizontal swipe on the ribbon (`touch-action: pan-y`), tap as for pointer.
- **Keyboard:** Tab reaches every segment (focusing one selects it); ←/→/Home/End move along the ribbon; Enter opens; inside the dossier, focus is contained by the native modal dialog; Esc closes; focus returns to the trigger.
- **Visible controls:** previous/next buttons with a counter, and the status strip (each item selects).
- **Scrolling:** horizontal wheel moves the ribbon; vertical wheel and touch scrolling are never intercepted.
- **URL:** opening pushes `?project=<slug>`, so Back closes and Forward reopens; prev/next inside the dossier replaces the URL (no extra history entries); a direct link or reload with `?project=` opens that dossier, and closing it strips the parameter.
- **Reduced motion** (system setting, or the panel toggle): ribbon moves instantly; the dossier cross-fades (opacity only) with no clip or page scaling; the selection sweep and smooth scrolling are off.
- **Rendering:** no animation loop when idle (measured: zero `requestAnimationFrame` calls in 1.5 s at rest).

## Checks run (2026-10-25, Chromium via Playwright, real results)

| Check | Result |
|---|---|
| Horizontal overflow at 320 / 390 / 768 / 1024 / 1440 / 1920 px, page and open dossier | 0 px at every width; no clipped dossier elements |
| Tab order | skip link → brand → nav → hero CTAs → ribbon controls → 4 segments → status strip (prev button correctly skipped while disabled) |
| ArrowRight / End / Home on the ribbon | Selection and focus move together; focus ring visible |
| Enter on a segment | Dossier opens, URL `?project=atlas`, focus on the dossier heading, page behind inert |
| 40 × Tab inside the dossier | Focus never left the dossier |
| Esc | Closes, URL restored, focus returned to the Atlas segment |
| Next inside dossier | URL `?project=reflux`, ribbon follows, history length unchanged |
| Browser Back / Forward | Back closed it; Forward reopened Reflux |
| Close button | Closes, URL restored |
| Direct URL `?project=extendspace` + reload | Opens ExtendSpace; licence shows "Not shown until verified"; Esc strips the parameter |
| Mouse drag across the ribbon | Moves selection (to ExtendSpace in the test) |
| Vertical wheel over the ribbon | Not prevented (page scrolls normally) |
| Reduced motion | Ribbon pose applied instantly; dossier animation is opacity only; page behind untransformed |
| Console | No errors or warnings |
| Contrast (computed) | All text pairs ≥ 4.5:1: fg 16.4, muted 7.5, faint 5.3 on ink; ink text 15.2, muted 6.9, faint 5.1 on paper; accents 6.5–9.2 on ink and 4.8–5.5 on paper (lowest: vermilion on paper-2, 4.76) |
| Retired `#3ABEFF` / any blue | Absent (full list of hex values checked) |
| Private-data scan (phone, compensation, employer offer, relocation, home server) | Absent |
| Network-loaded resources | None; the only external URLs are the three verified Atlas links |

**Not run:** axe (no dependencies allowed this milestone); Firefox and WebKit (only Chromium was available through the tooling); real touch hardware and real screen readers; performance profiling. These belong to Milestone 3 onwards.

## Screenshots

Viewports: **1440×900**, **768×1024**, **390×844** (CSS px, device scale 1). The full-page board captures are slightly narrower because the scrollbar is excluded.

| State | 1440 | 768 | 390 |
|---|---|---|---|
| Opening | `1440-01-opening.png` | `768-01-opening.png` | `390-01-opening.png` |
| Ribbon, initial (Nexus) | `1440-02-ribbon-initial.png` | `768-02-…` | `390-02-…` |
| Selected (Atlas) | `1440-03-selected-atlas.png` | `768-03-…` | `390-03-…` |
| Navigating, mid-move | `1440-04-navigating-mid-move.png` | `768-04-…` | `390-04-…` |
| Hand-off, frozen at 45 % | `1440-05-handoff-mid-transition.png` | `768-05-…` | `390-05-…` |
| Dossier (Atlas, top) | `1440-06-dossier-atlas.png` | `768-06-…` | `390-06-…` |
| Dossier, How it works | `1440-07-dossier-how-it-works.png` | `768-07-…` | `390-07-…` |
| Returned to ribbon after Esc | `1440-08-returned-to-ribbon.png` | `768-08-…` | `390-08-…` |

Also: `1440-09-dossier-nexus-direct-url.png`, `1440-10-dossier-nexus-decisions.png`, `1440-accent-{amber,vermilion,copper}-{ribbon,dossier}.png`, `1440-type-alt-bahnschrift-ribbon.png`, `1440-prototype-controls.png`, `1440-accent-board-full.png` (1425×1910), `390-accent-board-full.png` (375×5382).

## Known limitations

- **Content is injected by script** (fine for a prototype). Production must prerender it so it is present without JavaScript.
- **The hand-off is a clip-path reveal**, not a shared-element morph: the segment's own image does not travel into the dossier figure. A true morph (or the View Transitions API) is a Milestone 5 question.
- **CSS 3D only, no WebGL.** Segments are flat planes folded at hinges; there is no bending within a segment. Whether WebGL bending adds enough to justify itself is a Milestone 5 decision.
- **Reflux and ExtendSpace illustrations are small inside a turned-away segment;** their labels are only legible once selected or in the dossier.
- **Bahnschrift and Cascadia Mono are Windows system fonts and cannot be redistributed.** If that pairing wins, production needs a licensable web-font equivalent.
- **"Full case study" links point at `/work/<slug>`,** which doesn't exist yet. The prototype shows a note instead of navigating.
- **Only Nexus, Atlas, Reflux and ExtendSpace have dossiers.** Bhatkal Time Luxe, QueryCraft, Layers and BlueTap appear as compact entries to test attribution wording only.
- **Mobile ribbon segments are small** (80 % of the width, 16:10). A taller mobile composition may be worth testing.

## Content: sources and open questions (not resolved here)

All project text is from `knowledge-base/projects/*.md` (published copy checked 2026-10-24) plus the owner decisions in the Milestone 1 brief. Nothing was written back to the knowledge base.

Questions found while building:

1. **Nexus status.** Shown as "Private alpha · active development" (knowledge base). The brief says the status still needs clarification, and the previous brief mentioned development "resuming". Confirm before production copy.
2. **Nexus licence.** Shown as "Proprietary", per the brief. This is not yet recorded in the knowledge base.
3. **Role lines.** The "Sole author" wording for Nexus and Atlas comes from the September 2026 site ("Personal project · sole author"). The lists of areas after it ("architecture, governance model, runtime…", "Rust backend, retrieval pipeline…") are my summaries. Reflux and ExtendSpace say "Personal project" only. Please confirm or reword.
4. **Reflux device verification.** The prototype uses the published "verified mainly on emulators". The knowledge base also records a physical Nothing Phone (2a) and Xiaomi Pad 7 pass. Which should production say?
5. **Layers.** Shown as "Pre-release · V1 in development; ten basic widget types in scope for V1" (brief). The knowledge base still lists the older seven-merged/ten-family discrepancy.
6. **Bhatkal Time Luxe.** Shown only as a compact entry: "HubZero client work. Visual design by a HubZero co-founder." The brief's "I built its frontend" differs from the knowledge base and resume ("architecture, full-stack development and infrastructure"). The role wording, and who made the later live-site changes, are still open before any screenshot is shown.
7. **ExtendSpace and BlueTap licences.** Not shown ("Not shown until verified").
8. **Education** (AITM, affiliated with VTU; CGPA 8.36) is not shown in this prototype, by design.
