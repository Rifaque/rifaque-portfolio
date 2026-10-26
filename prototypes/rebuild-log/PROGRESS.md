# Rebuild progress log (unattended session, 2026-10-25)

Local planning notes for the RSX Develops rebuild. Not part of the knowledge base, and contains no private information.

## Starting state
- `main` @ `1772c04`, 6 commits, `ahead 3` of origin. 5 staged renames from the old implementation are left untouched.
- Untracked: `.agents/`, `.claude/`, `knowledge-base/`, `prototypes/`, `skills-lock.json`.
- Local Playwright browser cache has chromium-1248, firefox-1555 and webkit-2370, which match `@playwright/test@1.64.1`, so no browser download is needed.

## Log
- Phase 2 started: stack = React 19 + TypeScript + Vite + React Router + build-time prerender (renderToString per route), Vitest, Playwright + axe-core.
- React Router 6.30 had two advisories (GHSA-wrjc-x8rr-h8h6, GHSA-337j-9hxr-rhxg), both fixed in 7.18. Switched to `react-router@7.18.4` (library mode); `npm audit`: 0 vulnerabilities.
- Phases 2–3 built: content model, 11 prerendered routes + 404, sitemap, robots, vercel.json, check-dist guard. `npm run build` passes; 30 unit tests pass. First Chromium e2e run: 41 passed, 18 failed (axe label mismatch on the logo link; dossier timing).

## Design correction (owner message, mid-session)
The first production homepage read as editorial. Causes found in the code:
1. `.hero`: a 3-line 4.4rem headline beside a lede column (magazine opener); the ribbon started at y≈590 of 900.
2. Mono uppercase eyebrows and labels everywhere.
3. A ruler tick strip under the hero, and 1px rules above every section.
4. Thin-line diagrams on near-black panels: low visual mass; the only real interface was a side panel.
5. Selected project's identity in text columns below the ribbon (`.readout`).
6. Hero → work → text rows → contact, separated by hairlines.
7. Muted beige on black with amber hairlines.

Three compositions considered:
- **A. Receding corridor (chosen).** The ribbon is the viewport. The selected panel is huge, slightly left of centre; earlier projects fold out of frame on the left; later ones recede on a long diagonal into depth. A giant project name and actions overlap the panel's lower edge. Selection slides the wall and relights the room. Interfaces render as lit screens; illustrated projects as warm paper plates (which become the paper dossier).
- **B. Panoramic cylinder.** A concave screen around the camera, with the selected panel centred. Closest to the old ribbon, so least change.
- **C. Spatial deck.** Plates stacked in depth; the selected one pulls forward. Breaks the continuous ribbon; risks a generic card stack.

A was chosen: it is the most project-first and spatial, keeps the connected-strip geometry, and gives the screenshot/illustration distinction a material form.

## After the corridor rework
- Ribbon geometry: asymmetric fold (`src/lib/ribbon.ts`); earlier projects fold away steeply; later ones recede, turning further with distance.
- Opens on Atlas (the one ribbon project with a real interface); ribbon order unchanged.
- Dossier hardened: open/close settle with a timed fallback if frames stall; a reopen during close stays open.
- Ribbon: selections initiated by the ribbon update the target synchronously (fixed an arrow-key race); input modality tracked directly (WebKit's :focus-visible was unreliable in focus handlers).
- Tests: `npx vitest run` 30/30; `npx playwright test` 113/113 (Chromium 59, Firefox 27, WebKit 27).

## Reference review: salsabeel.hubzero.in and iyad.hubzero.in (inspected 2026-10-25, Chromium, 1440×900 and 390×844)
Both returned 200. Screenshots kept in the session scratchpad only (their work, not ours).

Observed (concrete):
- **Salsabeel.** A loading gate ("Powering up" chip). The portfolio is one object from her discipline: an isometric PCB where projects are switches SW0–SW7, skills are memory M0–M5, and résumé/contact are connectors J2/J3. "How I debug" is a working bench oscilloscope showing a real finding from a project (a 50 µs settle window vs the 1.52 ms needed), with per-project tabs. Floating glass pill nav; dark navy with gold/teal.
- **Iyad.** A loading cover ("100%"; the first viewport was blank at 2.5 s). Giant condensed display type, a cut-out portrait with orbiting topic pills, a dot grid, a skills marquee. Projects on a framed stage: a coverflow of real photos (centre card raised, sides receding) with a detail panel (02 / 04, tags, status, "View project"), a progress bar, and "Drag through them". "How I work": dials and tool switches that list the projects where a tool was used. Pill nav; a storage-consent prompt.

What makes them work: each site turns its subject into an *object you operate* (a board, an instrument, a switchboard), not a page you read. Evidence is shown as a reading taken from real work. Navigation feels physical (switches, dials, drag).

Adopted, adapted to RSX:
1. **Live diagrams (from the scope-as-evidence idea).** The selected plate's diagram runs a one-shot signal pulse along its real path (e.g. Request → Command Fabric → ToolRuntime → Effect). The illustration becomes an instrument tracing the architecture in the knowledge base. Off under reduced motion; never loops.
2. **Stack switchboard (from tool switches → projects).** A row of technology switches; choosing one routes the signal to the projects that used it, each with the "why it mattered" line from its record. Membership is computed from the project records, so it cannot drift from the content.
3. **Floating pill header over the scene (both sites).** The header no longer takes a band of height; the corridor fills the first viewport behind it.
4. **Explicit drag affordance (from "Drag through them").** One short hint and a progress rail on the tab strip.

Rejected: loading gates (content must come first), stats tiles (vanity numbers; CGPA kept secondary), a portrait hero, a marquee, a cookie prompt (the site stores nothing), and condensed display fonts (Geist stays).

## Final state (end of session, 2026-10-25)
- Implemented: stack switchboard, live diagram pulse, floating pill header, drag/swipe hint. Fixed: tile plate background, duplicate credit on HubZero case studies, QueryCraft label crowding, 320px overflow (switch grid).
- Verification: `npx tsc --noEmit` ok; `npx vitest run` 31/31; `npm run build` (prerender 11 routes + 404, check-dist ok); `npx playwright test` 116/116 (Chromium full suite, Firefox and WebKit @core); `npm audit` 0 vulnerabilities.
- Performance (local server, unthrottled network): home FCP/LCP 208 ms at 1440×900, 620 ms with 4× CPU throttle; CLS ≤ 0.012; JS 110 kB gzip, CSS 8.9 kB gzip.
- Screenshots: `prototypes/rebuild-log/screenshots/after/` (1440×900, 768×1024, 390×844, plus 320×700) and `before/` (the editorial version).

## Resume
```
npm install                 # Playwright browsers already cached (chromium-1248, firefox-1555, webkit-2370)
npm run build               # client + SSR build, prerender, check-dist
npm run serve               # http://127.0.0.1:4173 (production-like routing)
npx vitest run && npx playwright test
```
