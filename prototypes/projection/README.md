# Projection: creative prototype (Stage A.1)

A working, isolated prototype of the approved Projection direction for RSX Develops, refined for a second review. Nothing in the production app (`src/`), the knowledge base, the other prototypes or Git was changed. Stage A built 2026-10-25; Stage A.1 the same day.

## How to view

From the repository root:

```
python -m http.server 8765 --bind 127.0.0.1
```

Open <http://localhost:8765/prototypes/projection/>. Bind to `127.0.0.1` only: the server exposes the whole repository, including the private notes file. A server is needed (ES modules; images are referenced in place from `knowledge-base/assets/`).

Case studies are separate pages at `work/<slug>/` (for example <http://localhost:8765/prototypes/projection/work/atlas/>), mirroring the production routes `/work/<slug>`.

Review switches: `?theme=dark|light`, `?motion=reduce`, `?webgl=off`, `?nointro`, `?clean` (hides the Prototype panel), `?project=<slug>`, `?view=front|inside|state`, `?heroview=r|s|x`, `?sound=test`, `?debug` (exposes `window.__hero.seek(ms)` to freeze the entrance at a given time). The **Prototype** panel (bottom right) simulates reduced motion and no-WebGL and replays the entrance.

---

## What changed in Stage A.1, and why

### Identity and palette
- **Mono is the only palette.** The accent is the foreground itself (white on black, black on white); cobalt and sodium are gone. Hue is used only for project status, always with a glyph and text.
- Depth comes from material and light rather than colour: matte Lambert walls against a satin solid; plate faces, edges and a hatch in the work drawing; three line weights; surface steps from `--surf` to `--surf-3`.
- "RSX Develops is a personal identity, not a company" is gone from the footer and contact block. The footer reads "© 2026 Rifaque Akrami"; contact says "Working as: RSX Develops".

### Layout
- **One container and one 12-column grid** (`--max: 1240px`, centred) for the header, every section and the footer. On ultrawide screens the room still fills the hero, but the solid is placed at the centre of the grid's object column (`heroFrame()` measures it), so text and object stay together at 1440, 1920 and 2560.
- Anchor jumps land at section headings (`scroll-margin-top`), so "Work" shows the whole bench in a 900 px viewport.
- Below 900 px the introduction comes first, then the solid, then its controls.

### Hero and the RSX solid
- **The entrance shows how the solid is made.** The room starts dim. R, X and S each cross the room as a thin plate in the shape of the letter, moving along the axis it is projected on. A cell is set only once all three plates have passed through it, which is exactly the rule that defines the solid. The room light comes up as the shadows resolve (about 1.6 s, once per session, never needed to read or use the page). The earlier falling blocks and an intermediate extrusion version (it bloomed into a white haze) were dropped.
- Walls moved from 7.5 to 9 units out, so no shadow letter hides behind the solid; R, S and X all read at normal size.
- The solid has a satin finish against matte walls. The light on the wall being looked at rises 12% (state shown by light, not hue). Camera moves to R, S and X zoom in slightly so the letter fills the view.
- Drag now scales with the stage size, smooths the release velocity and returns with a near-critically-damped spring (no wobble).
- The exact shadow construction is unchanged (`verify()` still reports 0 uncovered pixels).

### Work: a project you open up
The box with three faces is replaced. Each project is now a **stack of plates** drawn by a small orthographic renderer (`js/stack.js`, SVG with exact affine transforms, no WebGL):

| View | What happens | What it shows |
|---|---|---|
| **What it is** | The stack is seen straight down: only the top plate, face-on and full size | The real interface (Atlas; the delivered 2025 BTL interface), or a labelled illustration |
| **How it works** | The object tilts into an axonometric and its plates separate | The project's layers in request order, each with an HTML label and leader line |
| **Where it stands** | Same structure; each plate is marked built (solid), partial (hatched) or not built (dashed), and unfinished parts appear as ghost plates | Verified state per layer, from the knowledge base; a legend explains the marks |

- The view is kept when you switch projects, so "Where it stands" compares honestly: Atlas shows five solid layers; ExtendSpace shows five built layers plus Connect (partial), Wi-Fi, pairing and input, and the virtual display (not built).
- Hovering or focusing a label slides its plate out of the stack. Sideways drag turns the axonometric; dragging down on the front view opens it.
- Every label is a real, focusable HTML element; the drawing is never the only carrier of information. The state notes per layer are in `content.js` (`STRUCTURE`), each taken from the project's limits and verified detail.
- The project and view are kept in the URL (`?project=…&view=…`, replaced, not pushed).

### Case studies are pages again
- `work/<slug>/index.html` for all eight projects (generated by `tools/make-pages.mjs`), so each case study works opened directly, refreshed, bookmarked or shared, with its own title and normal browser history.
- From the bench, the drawing carries into the case study's figure with a **cross-document View Transition** (`@view-transition`, no library); Back carries it home. Browsers without support simply navigate. Reduced motion turns it off.
- Each case study adds the layer list with its built, partial or not-built state, the ghost parts, and previous/next links. Old `?work=<slug>` links redirect to the page.

### How I Work
The four principles are one set: a square cut into quarters, numbered I to IV, the statement set large and the explanation under it. "Nexus" and "Atlas" in the first principle and in the bio link to those projects on the bench. Wording is unchanged from the knowledge base.

### Experience and education
The graph is replaced by a **chronological ledger**, newest first: dates in their own column (with "year only" where months are not recorded), then title, kind and organisation, a one-line note, and a slim bar drawn to scale against a shared 2022-to-now axis. Bars are styled by kind (employment solid; with HubZero or a team hatched; personal outlined; education toned; year-only dashed) with a legend. Overlaps read straight down the page, and nothing is truncated or annotated on the graphic.

### Bill of materials
The 8 × 24 matrix is replaced by a **two-way technical index**: the eight projects once, then technologies grouped into six families, each chip with the number of projects using it. Choose a technology to light its projects; choose a project to light its technologies; a sentence states the result, with links onto the bench. It is about a third of the old height, keyboard-operable (`aria-pressed`), and wraps naturally on phones. The associations are unchanged.

## Motion system

| Tool | Used for |
|---|---|
| CSS transitions | hover, press, toggles, indicators, theme cross-fade |
| Motion `animate` (springs) | the work drawing moving between views; interruptible |
| WAAPI | a project being set down on the bench |
| Cross-document View Transitions | the drawing becoming the case-study figure |
| Three.js | the hero only (lazy-loaded) |

No new libraries. Nothing animates at rest (0 animation frames requested in 2 s idle). Reduced motion: no entrance, views change immediately, no view transitions.

## Checks run (Stage A.1, 2026-10-25)

All automated checks are in `tools/qa.mjs` (headless Chromium from the repository's own Playwright, software WebGL). The report is `screenshots/qa-report.json`.

| Check | Result |
|---|---|
| Console errors and warnings | 0 across all pages, views, sizes and themes |
| Horizontal overflow | 0 px at 320, 390, 768, 1024, 1440, 1920 and 2560, both themes, front and Where it stands views, home and case-study pages |
| axe-core 4.14 | 0 violations: home in both themes and all three work views, home at 390, a case-study page in both themes (one name mismatch on the technology chips was found and fixed) |
| Keyboard | Tab order runs skip link, header, hero actions, view buttons, project list, view tabs; arrows move project and view with focus; plate labels focusable only when visible; Bill of Materials chips toggle with Enter |
| Case studies | From the bench to `work/atlas/`; Back restores `?project=atlas&view=…` with Atlas selected; direct load and reload of `work/nexus/`; previous/next links; `?work=querycraft` redirects |
| Theme | Switch persists in `localStorage`, applies before first paint, and carries to case-study pages |
| Reduced motion | Views change immediately; no entrance; View Transitions off |
| No WebGL | SVG drawing of the same room and solid; view buttons hidden with a note |
| Sound | Off by default; switch sets `aria-pressed` and the stored preference; no errors while playing |
| Exact solid | 0 uncovered letter pixels |

**Not verified:** Firefox, Safari, real phones or tablets, screen readers, and the sounds by ear. The View Transition was not visually checked in headless Chromium (the navigation and both pages were). Note for re-running checks: the Playwright browser used during development throttled animation frames when its window was in the background, so motion was verified headlessly instead.

## Screenshots (`screenshots/`)

`<width>-<theme>-<nn>-<state>.png` at **1440 × 900, 1920 × 1080, 768 × 1024 and 390 × 844**, dark and light:
01 hero · 02 hero looking along x (R) · 03 work, Atlas, What it is · 04 Nexus, How it works · 05 ExtendSpace, Where it stands · 06 case study (Reflux) · 07 How I Work · 08 experience · 09 Bill of Materials (Ollama selected) · 10 contact.

Plus at 1440 dark: 11 the entrance at 280, 560, 820 and 1080 ms; 12 the solid mid-drag; 13 the work drawing opening mid-motion. 14 no-WebGL (both themes); `2560-*-15` ultrawide hero (both themes). Stage A captures are kept in `screenshots/stage-a/`.

## Files

| Path | Role |
|---|---|
| `index.html` | Home page |
| `work/<slug>/index.html` | Case-study pages (generated) |
| `css/tokens.css`, `css/app.css` | Mono tokens for both environments; layout, components, case-study page |
| `js/app.js` | Home: hero wiring, bench, principles, ledger, materials index |
| `js/stack.js` | The work drawing: plates, projection, labels, views, drag |
| `js/hero.js` | Three.js room, solid, entrance, camera views, drag; SVG poster and fallback |
| `js/study.js` | Case-study page |
| `js/shell.js` | Shared theme, sound switch, résumé check, status glyphs |
| `js/content.js` | All copy and facts, with per-layer state and the ledger |
| `js/triplet.js`, `js/illustrations.js`, `js/sound.js` | Unchanged roles: the exact solid, labelled illustrations, sound |
| `tools/make-pages.mjs`, `tools/qa.mjs` | Page generator; checks and screenshots |

## Content decisions applied

From the brief and the knowledge base: Rifaque Akrami as the displayed name; the approved hero line; Bhatkal Time Luxe shown with the **delivered 2025 interface** (the knowledge base's composite of genuine 2025 screenshots), not the current live site, with the contribution wording and "not every current change is mine"; Nexus proprietary private alpha; Reflux proprietary with its public repository linked; Layers "ten basic widget types planned for V1; not all implemented"; QueryCraft collaborative with HubZero context; MIT for Atlas, BlueTap and ExtendSpace; AITM affiliated with VTU, CGPA 8.36; general relocation wording. The résumé link appears only when the PDF exists.

## Still open (factual, not guessed)

1. **BTL 2025 composite.** The knowledge base marks it "likely the delivered 2025 UI; check with owner". Please confirm it shows the work you delivered.
2. **Copyright name.** The footer now reads "© 2026 Rifaque Akrami". If a legal name is needed there, it is "Rifaque Ahmed Akrami".
3. **Reflux device wording.** Still "verified mainly on emulators"; the knowledge base also records a physical phone and tablet pass.
4. **QueryCraft repository.** Not linked (undecided in the knowledge base). Period shown as Aug 2025 to Jan 2026; earlier site versions said Jul 2025.
5. **Nexus start month.** Shown as Jun 2026, which the knowledge base asks to confirm.
6. **Per-layer state notes** (`STRUCTURE` in `content.js`) paraphrase the knowledge base's limits; please read them once, as they are the newest wording.
7. **Project order.** Atlas first, then Nexus, Reflux, ExtendSpace, Layers, BlueTap, then the HubZero pair.
8. **Knowledge-base updates** (the old electric-blue rule, the Reflux link decision) are not recorded yet; no knowledge-base files were edited in this stage.

## Known limitations

- Content is rendered by script in this prototype; production should prerender it (both the home page and `/work/<slug>`).
- The hero costs 131 KB gzip of Three.js, loaded after first paint; the SVG drawing is shown first.
- The BTL composite is a 340 KB PNG and should be converted for production.
- The plate drawing redraws SVG attributes per frame only during transitions; tested smooth in Chromium, not profiled on low-end phones.

---

## Background: Stage A concepts (summary)

Three concepts were explored: **Projection** (chosen: one object, several true views), **Line** (a transit-map site drawn by one continuous stroke) and **Strata** (a scroll descent through a cross-section). Projection was chosen because its hero is an object only this person would make, and because one idea, viewing something from another side, carries through the identity, the work and the case studies without becoming decoration. Library evaluation at Stage A: Three.js 0.186.1 (131 KB gzip, hero only), Motion 14.1.0 `animate` (19 KB, used), Anime.js 4.5.0 (15 KB, not used: it overlaps Motion and WAAPI), and no UIverse components (all controls are original).
