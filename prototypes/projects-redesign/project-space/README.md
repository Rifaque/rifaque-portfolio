# Concept D: Project Space

A fourth Projects-section concept that combines Concept A's persistent
project sidebar and three-column composition with Concept B's device-aware
stage. Prototype only: plain HTML, CSS and JavaScript, no new dependencies,
nothing here is production code.

Open: `http://localhost:8765/prototypes/projects-redesign/project-space/`
(or `http://127.0.0.1:8765/...`), served from the repository root with
`python -m http.server 8765 --bind 127.0.0.1`.

## Composition

| Sidebar (from A) | Stage (from B) | Info |
| --- | --- | --- |
| Six projects in order; HubZero group label before Bhatkal Time Luxe; status glyph per project | The selected project in the environment it runs on: a real capture, a labelled illustration, or a dashed outline that says there is nothing to show | Name, one or two sentences, my part, platforms, status, **Explore project** |

- **Explore project** opens a modal overlay (`<dialog>`): larger media with a
  thumbnail strip, what it does, my part (BTL as a split table), three
  highlights, status/platforms/period/licence/limits, and verified links.
  Close button, Esc and backdrop all close it; focus returns to Explore; the
  selection and scroll position are kept.
- URL: `?project=<slug>` and `&open=1`, both pushed. Back closes the overlay,
  then steps back through earlier selections; Forward restores them. Deep
  links work; an unknown slug falls back to Atlas.
- 1100px and below: the sidebar becomes a horizontal row of 44px chips, the
  stage spans the width, and the info sits below it. 640px and below: no
  scaled-down composition; the main device is full width with at most one
  companion, and the overlay is full screen.
- Motion: the text changes at once (a 220ms fade marks it). The outgoing
  scene recedes and fades (200ms) over the incoming one, which settles in
  (520ms): the group first, then each device (70ms stagger), then labels, the
  cable and the supporting strip. The overlay rises in (280ms). Reduced
  motion (OS setting or `?motion=reduce`) makes switching, reset and the
  overlay instant. Theme changes use the shared View Transition cross-fade.
- Sound: on by default, initialised only on the first pointer or key press;
  quiet cues on selection and on opening the overlay; the header button mutes.
- Monochrome: status glyphs are told apart by shape only on this page.

## 3D stage

CSS 3D only, no dependencies. `scenes.js` says what each project shows and
where (positions, screens, default angle); `stage3d.js` builds the devices
and owns rotation and transitions; `stage3d.css` styles them; `space.js`
wires the page. The case studies reuse all three.

- **Structure**: `.scene` (perspective) > `.enter` (entry motion only) >
  `.rig` (the visitor's rotation) > devices. Bezel, depth and corner radius
  are fractions of a device's width; positions are in container-width units
  from the stage centre, so a scene scales as one.
- **Closed objects**: every device is a face (bezel and screen), a back plate
  and four edge faces. The back plate is turned 180 degrees, so its details
  read correctly from behind:
  - monitors: raised rear casing, a vent band, a stand mount, three port
    cut-outs and a small RSX mark, on a stand with four sides and a flat
    foot behind the casing;
  - tablets: a single camera and the RSX mark; phones: a two-lens camera
    module and the mark; the TV: vents, ports, mark and feet;
  - the Atlas Workspaces window: a plain rear panel.
  No manufacturer names, serial numbers or specifications. Device labels
  are hidden from behind (`backface-visibility`) rather than shown mirrored.
- **Full rotation**: horizontal turning is unbounded. During a drag the angle
  is always the angle at pointer-down plus the drag distance, so nothing
  accumulates or drifts. On release it is folded to within half a turn of the
  default: the same transform on screen, small numbers in memory, and Reset
  takes the short way back. Vertical turning is held between -30 and 24
  degrees. About half a turn per stage width.
- **Input**: pointer events with capture after a 5px threshold; on touch a
  mostly vertical movement is left to the page (`touch-action: pan-y`), so
  scrolling still works. Pointer cancel, lost capture and window blur end a
  drag; a click straight after a drag is swallowed, so Explore and other
  controls never activate from a drag. One transform write per frame; idle
  scenes never move.
- **Controls**: dragging is the interaction; there are no turn buttons and no
  instructions. A small Reset view appears beside the caption only once the
  scene has been turned, eases back (instant with reduced motion) and hands
  focus to the scene as it hides. The scene stays focusable, and arrow keys,
  Home and R still work there for keyboard users, but they are not
  advertised.
- **Quiet surroundings**: one compact caption line carries the disclosures
  (Screenshot, Illustration, Debug capture, Emulator capture, Screenshot,
  live site, Planned). Device labels remain only on ExtendSpace (Windows
  host, Android tablet). ExtendSpace's order of work and pipeline are one
  line each; Layers Studio is one Planned line; Nexus and Reflux keep a
  small "as text" disclosure for their drawings. Device-back marks are a
  little stronger so they stay legible.
- **Glass diagram panels** (Nexus, Reflux): a smoked, translucent front sheet
  carries the one drawing; a translucent rear sheet sits behind it. From
  behind you see that same drawing through the glass, reversed and dimmed;
  nothing is drawn twice. The front stays the legible view, and each drawing
  also has an "... as text" version beside the scene, outside the 3D object.
- **USB cable** (ExtendSpace): 22 short segments along a hanging curve plus
  two plugs, each made of two crossed strips so it has body from any angle.
  It lives in the rig, from the host's right side to the tablet's left edge
  (the axis the tablet is angled about) at each object's mid-depth, so it
  stays plugged in through a full turn. It is rebuilt when the stage crosses
  the phone breakpoint.

| Project | Scene (desktop and tablet) | Phones |
| --- | --- | --- |
| Atlas | Monitor with the Ask capture; the Workspaces capture as a second window behind it | Monitor only |
| Nexus | The governed request-path drawing on a glass panel, in front of a monitor whose screen is a plain text label, "No published interface" | Drawing only |
| ExtendSpace | Windows host monitor (screen: a labelled **Illustration** of the host role, "Connect: disabled"), a USB cable in the same group, and the tablet with the genuine debug capture; below it, the order of work (1 USB, wired: current focus; 2 Wi-Fi, wireless: planned after the wired milestone, when development resumes) and the pipeline | Host and tablet, cable kept |
| Reflux | The work/version/source drawing on a central glass panel; a desktop monitor, an Android TV and a phone around it, each screen "No capture published" | Drawing and phone |
| Layers by RSX | Tablet with the large-window editor capture and phone with the home-screen capture (both emulator); Layers Studio as a flat dashed note below the scene, never a device | Tablet and phone |
| Bhatkal Time Luxe | Desktop monitor with a browser bar and the current home page; phone with the current product page | Monitor and phone |

No genuine ExtendSpace host interface capture exists (only tablet-side
captures in `../extend-space/artifacts`), so the host screen is a plainly
labelled illustration. The cable runs from the host's right side to the
tablet's left edge, the axis the tablet is angled about, so it stays
attached at any rotation.

Breakpoints: above 1100px the stage sits in the three-column layout
(16:10.5); 640 to 1100px it is full width under the chip row (16:9.6); below
640px each scene uses its own phone positions (1:0.92) with one main device
and at most one companion. Short landscape screens size the stage by height.

## Bhatkal Time Luxe media

The 2025 collage (`knowledge-base/assets/bhatkal-time-luxe/btl-2025-ui-composite.png`)
predates the Jul to Aug 2025 redesign and is **not used**. `data.js` replaces
the shared media entry outright, and `tools/verify.mjs` fails if the collage's
name appears in the page, the case studies or their sources. The older
Projection case-study pages are not linked; Explore links to the new case
studies in `case-studies/`.

Captured 26 Oct 2026 from https://btl.hubzero.in with
headless Chromium (`tools/capture-btl.mjs`), viewport captures only, all
responses HTTP 200. Originals are kept unmodified in `media/captures/`:

| Original | Page | Viewport |
| --- | --- | --- |
| `btl-home-1440.png` | `/` | 1440 × 900 |
| `btl-new-arrivals-1440.png` | `/new-arrivals` | 1440 × 900 |
| `btl-new-arrivals-grid-1440.png` | `/new-arrivals`, scrolled 640px | 1440 × 900 |
| `btl-brands-1440.png` | `/brands` | 1440 × 900 (not used) |
| `btl-home-390.png` | `/` | 390 × 844 |
| `btl-product-1440.png` | `/product/67f2ba0c0b835fcd943706f3` (Rolex Mens Watch) | 1440 × 900 |
| `btl-product-390.png` | same product | 390 × 844 |

Product cards are not links, so the product URL was reached by selecting a
card in the catalogue and captured the same day at the same viewport sizes.

Derived copies used by the page (`media/`, WebP):

| File | From | Transformation |
| --- | --- | --- |
| `btl-current-home-desktop.webp` | `btl-home-1440.png` | WebP, full frame |
| `btl-current-product-desktop.webp` | `btl-product-1440.png` | WebP, full frame |
| `btl-current-new-arrivals-desktop.webp` | `btl-new-arrivals-grid-1440.png` | WebP, full frame |
| `btl-current-home-mobile.webp` | `btl-home-390.png` | Cropped to 0,0,390,680, above the floating WhatsApp button |
| `btl-current-product-mobile.webp` | `btl-product-390.png` | WebP, full frame |

INR views (26 Oct 2026, `tools/capture-btl-inr.mjs`): the same pages, viewports
and framing, with the site's own currency selector (KWD, INR, USD, EUR, GBP)
set to INR in the headless session; the phone captures reuse that session's
stored choice. Nothing else on the site was changed. Log:
`media/captures/capture-log-inr.json` (prices recorded, contact data redacted).

| File | From | Transformation |
| --- | --- | --- |
| `btl-current-home-desktop-inr.webp` | `btl-home-1440-inr.png` | WebP, full frame |
| `btl-current-product-desktop-inr.webp` | `btl-product-1440-inr.png` | WebP, full frame |
| `btl-current-new-arrivals-desktop-inr.webp` | `btl-new-arrivals-grid-1440-inr.png` | WebP, full frame |
| `btl-current-home-mobile-inr.webp` | `btl-home-390-inr.png` | Cropped to 0,0,390,680, above the floating WhatsApp button |
| `btl-current-product-mobile-inr.webp` | `btl-product-390-inr.png` | WebP, full frame |

The INR captures lead everywhere. `btl-current-product-desktop.webp` (KWD) is
kept, in the gallery and the case study, as evidence of the later currency
experiment and captioned as such. The other KWD copies stay on disk unused.

Privacy: the site's footer and contact page carry a personal phone number
and a WhatsApp link. Neither is in any captured viewport except the floating
WhatsApp button (an icon, no number) on the 390px home page, which is cropped
out of the derived copy. The capture log records only that contact data was
seen; the number itself is redacted.

Framing and attribution (from the owner, 26 Oct 2026; Concept D only):

- A watch-commerce website concept for a Bhatkal-based retailer, with an
  India-wide market focus. It began as a HubZero client project. (The shared
  `content.js` still says Kuwait and the GCC; `data.js` overrides it.)
- Original design by a HubZero co-founder; the current storefront iteration
  (the one captured here) designed by Rifaque.
- Built end to end by Rifaque through HubZero: architecture, frontend and
  full-stack implementation, database and infrastructure.
- After the partnership began he independently experimented with configurable
  currency presentation. KWD was used in that experiment; it was not a client
  requirement or evidence of a Kuwait/GCC market.
- The client did not continue the partnership. The site remains live as a
  showcase of his work, not an active storefront.

The earlier partial-ownership disclaimer is removed everywhere. Production
content and the knowledge base still carry older wording and were not
changed.

Links: Reflux's public repository lags local work and, per the owner decision
recorded in the knowledge base, is not linked; the case study already omitted
it, and the Project Space modal now does too.

## Layers by RSX media and Studio status

- `layers-large-window-editor.webp`: from
  `../layers/android/.gradle-local/product-design/tablet-editor-latest.png`
  (1280 × 900, 3 Oct 2026), cropped to 0,28,1280,872 to remove the status
  and gesture bars. It is an Android emulator with a large-window display
  override, not a physical tablet, and is captioned so. Original untouched.
- Phone home-screen widgets: the existing `../media/layers-emulator-launcher-*.webp`.
- Layers Studio is shown only as an empty dashed outline labelled
  **Planned**. Evidence: the Layers README calls Studio "a future
  browser-based editor, not a 1.0 requirement"; `AGENTS.md` says no Studio
  source exists; `docs/STUDIO_SPEC.md` (v0.1, 2 Oct 2026) "neither implements
  Studio nor places it in the 1.0 release". The listed capabilities (opens
  .layers packages, visual editing with live previews at several sizes, local
  use without an account) come from that spec.

## Other media

Atlas Ask view (knowledge base, path masked in the original) and the masked
Workspaces copy; ExtendSpace debug capture; Nexus and Reflux drawings from
`../shared/illustrations.js`. All are read in place and unchanged.

## Files

```
project-space/
  index.html       page
  space.css        Project Space layout and overlay
  stage3d.css      3D devices, backs, stands, glass, cable, strips around a scene
  space.js         page wiring: selection, info, overlay, URL state
  scenes.js        per-project compositions (devices, positions, screens, default view),
                   ExtendSpace order of work, text versions of the drawings
  stage3d.js       device geometry, full rotation, cable, transitions
  case-studies/    six case-study prototypes (below)
  data.js          short copy, highlights and media on top of ../shared/content.js
  README.md
  media/           derived WebP copies (above)
  media/captures/  BTL originals and capture-log.json
  tools/capture-btl.mjs, tools/verify.mjs
```

Shared files (`../shared/*`) are imported unchanged. Two local corrections:
the shared header lists concepts A to C, so this page adds a "D" link at
runtime; and the shared stylesheet shows the muted glyph while sound is on,
which `space.css` corrects for this page only.

## Phones

Same structure as desktop, composed for a narrow screen (no new breakpoints:
the existing 1100px and 640px ones):

1. Header, then a compact Projects heading.
2. The project chips in one row that scrolls on its own: no visible
   scrollbar, a soft edge fade only on a side with more chips, 44px targets,
   and the selected chip centred in the row (re-centred once web fonts load);
   the page itself never scrolls sideways or jumps.
3. The 3D stage with phone-specific positions (one main device, at most one
   companion), `touch-action: pan-y pinch-zoom` so sideways drags turn the
   scene while vertical scrolling and pinch-zoom still work.
4. Evidence captions, each label above its text, full width.
5. Project details in one column, then Explore, then Also built.

Reset view becomes a 36px icon button (accessible name "Reset view") in the
stage's top-right corner, a spot every phone composition leaves clear, still
shown only once the scene has been turned. Case-study figure captions stack
the same way, and wide diagrams keep a readable minimum width inside their
own sideways-scrolling box, which becomes keyboard-focusable and named only
when it actually scrolls.

## Case studies

New, isolated prototypes; the Projection case-study pages are untouched and
no longer linked from D. One page per featured project, all on one system
(`case-studies/cs.css`, `cs.js`, `diagrams.js`):

| Page | Opening 3D object | Visuals through the page |
| --- | --- | --- |
| `case-studies/atlas/` | Ask capture on a monitor, Workspaces window behind | Workspaces capture; retrieval diagram; Ask capture with the evidence panel; cloud-boundary diagram |
| `case-studies/nexus/` | Request path on glass, label-only monitor | Layers-and-authority diagram; request path; approval-hash diagram |
| `case-studies/extendspace/` | Host, USB cable, tablet with the debug capture | Order-of-work diagram (wired, then Wi-Fi); pipeline; debug capture; recovery diagram |
| `case-studies/reflux/` | Media model on glass with platform outlines | A second, single glass panel; identification diagram; playback diagram |
| `case-studies/layers/` | Tablet editor and phone widgets (emulator) | Runtime pipeline; editor capture; two widget captures; implemented-versus-planned diagram |
| `case-studies/bhatkal-time-luxe/` | Desktop storefront and phone product page | Architecture diagram; catalogue and product captures; a second 3D phone beside the mobile home capture |

Facts come from each project's knowledge-base entry (published copy and
verified detail) and the earlier D research; nothing is added that those do
not say. `cs.js` fills status, real media (paths, alt text and labels from
`data.js`), diagrams, links and the 3D objects, which are the Project Space
scenes mounted with the same `stage3d.js`. Diagrams are labelled
Illustration; captures keep their Screenshot, Debug capture, Emulator capture
or Screenshot, live site labels. Each page links back to Project Space and to
the previous and next case study.

## Future task, not implemented: hero loading gate

Recorded for later; nothing here touches the hero, the Projection prototype
or production. The hero uses the Projection concept: a three-wall room with
an object casting R, S and X shadows. Intended behaviour:

1. On first entry, that same object appears centred as the loading gate.
2. When the page is actually ready, it moves into its final hero position.
3. It stays one object with one identity through the transition, never two
   unrelated renderings.
4. No artificial minimum delay.
5. Reduced motion is respected, and the gate does not replay on every
   internal navigation.

## Verify

```
node prototypes/projects-redesign/project-space/tools/verify.mjs
```

Loads on both hosts; switches all six; checks every scene and gallery image;
BTL current-site only; Layers Studio labelled and empty; overlay close
button, Esc, backdrop, focus restore, focus containment, scroll kept;
Back/Forward and deep links; keyboard selection; reduced motion; theme and
sound controls; overflow at 320 to 2560px in both themes; full-screen
overlay on phones; axe (desktop, light, overlay, phone); console errors.

3D stage: default angle in every scene; dragging every device in every scene
turns the shared group with arrangement and device transforms unchanged;
reset; full rotation past two revolutions with no jumps and an invisible
fold on release; vertical limits; no turn buttons; pointercancel and window
blur end a drag; rapid drags never stick; a drag ending over Explore does
not open it; switching never inherits an angle; rapid switching settles on
one correct scene; keyboard turning on the focused scene; theme change keeps
the angle; idle stillness; fronts, sides and backs face the right way; rear
details and RSX marks; glass panels with one drawing and a text version;
the cable ends at both ports and stays connected and visible through a full
turn; reduced-motion reset; device counts on desktop, tablet, phone and
landscape; touch swipes turn sideways and scroll vertically (Chrome touch
emulation over the DevTools protocol, not a physical device); only genuine
captures as scene images; no collage filename, BTL disclaimer, wireless
claim or phone number in sources or the capture log.

Polish pass (final): Reset view hidden at the default and shown once turned,
keyboard-reachable, focus moves to the scene after reset; no rotation
instructions or shortcuts shown anywhere; devices never reach the project
list or info column at eight angles in every scene at 1280, 1440 and 1920.

Phones (320, 360, 390, 427; both themes; all six projects and case studies):
chip row scrolls locally with no scrollbar, first and last chips reachable,
selecting centres the chip without moving the page; captions full width with
the label above; devices inside the stage and not tiny; no element past the
viewport (checked element by element, because the shared stylesheet clips body
overflow); pinch-zoom allowed on the stage; Reset view corner control; 200%
text size; case-study captions, readable scrollable diagrams with keyboard
access; landscape phones and tablets portrait and landscape.

Final content audit: Bhatkal Time Luxe framing (Bhatkal-based, India-wide;
Kuwait/GCC only ever denied), showcase status, design attribution, the
currency experiment, INR captures leading with the KWD capture labelled as
the experiment; Reflux repository not linked; no placeholder URLs.

Case studies: each page loads with status, sections, diagrams and labelled
media; every internal link resolves; the first 3D object turns and resets,
with Reset view shown only once turned; no rotation instructions;
page-specific copy checks; the Explore modal links to the new page; no
overflow at 320, 390, 768, 1024 and 1440 in both themes; axe on desktop and
phone.
