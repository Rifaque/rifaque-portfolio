# Projects section: three concept prototypes

Three separate, working alternatives for the Projects section of the RSX Develops portfolio, for review. Nothing outside this directory was changed. No dependencies were added and nothing needs building.

## Run

From the repository root:

```
python -m http.server 8765 --bind 127.0.0.1
```

Keep the server bound to `127.0.0.1`: it serves everything under the repository root.

- Comparison page: <http://localhost:8765/prototypes/projects-redesign/>
- Concept A, Capability Carousel: <http://localhost:8765/prototypes/projects-redesign/capability-carousel/>
- Concept B, Interactive Project Space: <http://localhost:8765/prototypes/projects-redesign/interactive-project-space/>
- Concept C, Technical Evidence Explorer: <http://localhost:8765/prototypes/projects-redesign/technical-evidence-explorer/>

Switches: `?theme=dark|light`, `?motion=reduce`. Deep links: A uses `#<slug>`, B and C use `?project=<slug>` (C also `&part=<id>`).

## Structure

| Path | Role |
|---|---|
| `index.html` | Comparison landing page |
| `shared/content.js` | The verified lineup, media references, per-project facts (one source for all three concepts) |
| `shared/base.css`, `shared/shell.js` | Mono tokens, 1240px container, header with the approved wordmark, theme control naming its action, compact sound control, Also built line |
| `shared/illustrations.js` | Labelled technical illustrations (Nexus, Reflux, ExtendSpace pipeline) |
| `capability-carousel/` | Concept A (`index.html`, `carousel.css`, `carousel.js`) |
| `interactive-project-space/` | Concept B (`index.html`, `space.css`, `space.js`) |
| `technical-evidence-explorer/` | Concept C (`index.html`, `explorer.css`, `explorer.js`) |
| `media/` | Derived (cropped or masked) copies; originals untouched |
| `tools/look.mjs` | Headless review captures (uses the repository's existing Playwright) |

Read in place, never modified: `knowledge-base/assets/` (Atlas Ask view, BTL 2025 composite), `public/rsx-develops-brand-assets/` (wordmarks, one favicon link), and the Projection prototype's fonts and case-study pages (linked as "Case study").

## Lineup

Featured, in this order: Atlas, Nexus, ExtendSpace, Reflux, Layers by RSX, Bhatkal Time Luxe (HubZero). Also built: QueryCraft (three-person final-year project with HubZero members; primary technical contributor; retired) and BlueTap (pre-release; tap-to-connect not implemented). DevPilot is not included anywhere.

## Media provenance

| Project | Media | Class | Source | Derived copy and transformation |
|---|---|---|---|---|
| Atlas | Ask view | Authentic, current (v1.0) | `knowledge-base/assets/atlas/atlas-1.0-ask.webp` | none (read in place; path already masked) |
| Atlas | Workspaces | Authentic, current | `../assets/Atlas Home Page.png` (outside this repo) | `media/atlas-workspaces-paths-masked.webp`: the two local folder paths (rows at y 339–361 and 438–462, x 284–640) filled with the surrounding background colour `rgb(17,18,20)`; WebP |
| Atlas | `atlas-thumbnail.png` | Authentic, outdated (pre-1.0) | `../assets/`, `../projectscreenshots/` | not used |
| Nexus | Request path | Technical illustration | drawn in `shared/illustrations.js` | n/a |
| Nexus | Surface captures | Authentic, not publishable (personal content behind the overlay) | `../nexus/.blackbox/` | not used |
| ExtendSpace | Tablet debug "Live stream over USB", 13 Oct 2026 | Authentic, current (debug build) | `../extend-space/artifacts/experiment-01/live/sustained-1080p60.tablet.png` | `media/extendspace-usb-stream-test-pattern.webp`: cropped to the streamed test-pattern window (box 440,480 to 2760,1832 of 3200 × 2136), removing the tablet status bar, desktop icons and other windows; scaled to 1600 px wide |
| ExtendSpace | Pipeline | Technical illustration | `shared/illustrations.js` | n/a |
| Reflux | Media model, worked example | Technical illustration, illustrative names | `shared/illustrations.js`, knowledge base | n/a |
| Layers by RSX | Launcher pages 1–3, 4 Oct 2026 | Authentic, Android **emulator** (`audit-emulator.txt`: emulator 37.2.12.0, `android-36.1` x86_64 image) | `../layers/android/.gradle-local/autonomous/audit-launcher-final-page{1,2,3}.png` | `media/layers-emulator-launcher-{1,2,3}.webp`: cropped to y 70–1560 (status bar and dock removed), scaled to 720 px wide. Pages 4–5 not used: they include Notes and Photos, which are branch-only |
| Bhatkal Time Luxe | Delivered 2025 interface | Authentic composite (confirmed by the owner) | `knowledge-base/assets/bhatkal-time-luxe/btl-2025-ui-composite.png` | none |
| Bhatkal Time Luxe | Live-site captures, 25 Oct 2026 | Authentic, not representative of only Rifaque's work | `knowledge-base/assets/bhatkal-time-luxe/` | not used |
| QueryCraft | Old composite | Unverified metrics visible | git history | not used |
| BlueTap | none | Planned capture | n/a | n/a |

Originals were hashed before and after processing and are unchanged.

## Known issues (recorded, not fixed here)

- The Projection prototype's hero drag is blocked on desktop: its `.hero-object` grid layer sits above the canvas and receives the pointer (see the previous audit).
- The theme toggle in the Projection prototype doesn't name its action, and its theme switch is staggered. These concepts use a coordinated View Transition and an action label as a demonstration only.
- Sound is intended to be on by default, so here it starts enabled but creates its audio context only on the visitor's first pointer or key press, as browsers require. It is limited to one quiet cue on project selection.
