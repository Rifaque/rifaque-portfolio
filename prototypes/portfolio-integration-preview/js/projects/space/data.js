/*
 * Project Space content. Reads the shared, verified lineup (../shared/
 * content.js, unchanged) and adds what this concept needs: short browsing
 * copy, the media each stage uses, and two corrections.
 *
 *  - Bhatkal Time Luxe uses captures of the current site (https://btl.hubzero.in,
 *    26 Oct 2026). The older 2025 collage is not used anywhere in this concept.
 *  - Layers by RSX shows an Android large-window editor capture (emulator)
 *    and a phone home-screen capture (emulator). Layers Studio, the browser
 *    editor, is planned: the Layers repository says no Studio source exists
 *    yet (AGENTS.md; docs/STUDIO_SPEC.md "neither implements Studio nor
 *    places it in the 1.0 release"), so it is drawn as an empty, labelled
 *    outline, never as an interface.
 */
import { projects as shared, alsoBuilt, KIND as SHARED_KIND, caseStudy } from "../shared/content.js";

const here = (p) => new URL(p, import.meta.url).href;
// Preview: every derived capture lives in the preview's own media/ folder.
const OWN = (p) => here(`../../../media/${p}`);
const SHARED_MEDIA = (p) => here(`../../../media/${p}`);

export const KIND = { ...SHARED_KIND, capture: "Debug capture", live: "Screenshot, live site", emulator: "Emulator capture", planned: "Planned" };
export { alsoBuilt, caseStudy };

const by = Object.fromEntries(shared.map((p) => [p.slug, p]));

const EXTRA = {
  atlas: {
    blurb: "A desktop app that indexes one codebase or document set and answers with evidence you can inspect, or declines when there isn't enough.",
    part: "Sole author: Rust backend, retrieval pipeline, interface, release.",
    highlights: [
      ["Hybrid retrieval", "Semantic and BM25 candidates fused with reciprocal-rank fusion, then checked for relevance."],
      ["Says when it doesn't know", "Ask can decline for lack of workspace evidence instead of answering from general model knowledge."],
      ["Cloud by consent", "Generation is local through Ollama; the optional cloud path is scanned by Secret Shield first."],
    ],
    gallery: [0, 1],
  },
  nexus: {
    blurb: "A local, voice-first assistant layer for one Windows machine, built so a model can propose but only a governed runtime can act.",
    part: "Sole author: architecture, governance model, runtime.",
    highlights: [
      ["Deterministic first", "The Command Fabric recognises and routes without a model; the Cortex is reached only when it declines."],
      ["One way to act", "Every effect passes ToolRuntime: capability gate, deny-wins policy, owner approval bound to a hash of the effect."],
      ["Auditable", "Calls, denials included, are recorded in an append-only, hash-chained ledger."],
    ],
  },
  extendspace: {
    blurb: "Streams a Windows desktop to an Android tablet over USB. The wired path comes first and is being finished; Connect is still disabled.",
    part: "Sole author: Windows host, Android companion, wire protocol, tests.",
    highlights: [
      ["A pipeline with owners", "Capture and hardware H.264 on Windows, decoding on Android, each behind an explicit session owner."],
      ["Tested, narrowly", "A 1080p60 test pattern streamed for ten minutes on one PC and one tablet; the USB link recovers from a pulled cable."],
      ["Wired first", "USB is the first milestone and the current focus. Wi-Fi is planned after it, when development resumes."],
    ],
    limits: "Connect is disabled in both apps. Tested on one PC and one tablet. Wi-Fi is planned after the wired milestone; pairing, input forwarding and the virtual display are not implemented.",
  },
  reflux: {
    blurb: "A media client where a film is one work, whatever files and sources provide it, so playback continues from any copy.",
    part: "Sole author: shared engine, identification, playback.",
    highlights: [
      ["Works, not files", "Versions from a local folder, Jellyfin or a network share resolve to one work that holds the watch state."],
      ["Careful identification", "Embedded IDs and edition tags are honoured; weak matches go to an Identify flow instead of being guessed."],
      ["Your folders stay yours", "Organisation is virtual: Reflux never renames, moves or modifies files."],
    ],
  },
  layers: {
    blurb: "An Android widget platform: one portable widget definition, validated, themed and sized by a shared runtime. A browser editor, Layers Studio, is planned.",
    part: "Sole author: runtime, editor, themes, package format.",
    highlights: [
      ["One runtime", "First-party and imported widgets share a single validated runtime rendered with RemoteViews."],
      ["Real sizes", "Widgets size from their real dimensions, with per-instance overrides and a multi-size preview workspace."],
      ["Studio, later", "Layers Studio is specified as a browser editor that opens the same .layers packages; no Studio source exists yet."],
    ],
    // Android large-window editor capture (emulator with a display override, 3 Oct 2026).
    tablet: {
      kind: "emulator", src: OWN("layers-large-window-editor.webp"), w: 1280, h: 844,
      alt: "The Layers editor in a large Android window: a widget list on the left, a preview workspace with compact, wide and large previews of a Clock widget, and a theme and surface inspector on the right.",
      caption: "Android emulator with a large-window display override, 3 Oct 2026. Not a physical tablet.",
    },
    studio: [
      "Opens the same .layers packages",
      "Visual editing with live previews at several sizes",
      "Local use, no account or backend",
    ],
  },
  "bhatkal-time-luxe": {
    // The shared entry frames the business as Kuwait/GCC; corrected here (Concept D only).
    line: "Client project · HubZero",
    purpose: "A watch-commerce website concept for a Bhatkal-based retailer, with an India-wide market focus. It began as a HubZero client project and now remains live as a showcase of my work, not an active storefront.",
    blurb: "A watch-commerce website concept for a Bhatkal-based retailer, with an India-wide market focus. Originally a HubZero client project; now a live showcase.",
    part: "Built end to end through HubZero: architecture, frontend and full-stack implementation, database and infrastructure. I designed the current storefront; the original design was by a HubZero co-founder.",
    contribution: "I built the project end to end through HubZero, covering architecture, frontend and full-stack implementation, database, and infrastructure. I designed the current storefront iteration; the original design was created by a HubZero co-founder.",
    // No role table: the contribution sentence above says it in full (and the shared entry's
    // older split, with its partial-ownership row, must never resurface).
    split: null,
    limits: "The website remains live as a showcase of my work, not an active storefront; the client did not continue the partnership. Client work: the code is not presented as a personal open-source project.",
    missing: ["The live site is not linked from the portfolio, and no repository is linked."],
    highlights: [
      ["Two deployments", "A Next.js storefront on Vercel against a separate Node.js API on a self-hosted Ubuntu server."],
      ["Catalogue", "A MongoDB data model, with images delivered through Cloudinary and imgix."],
      ["Currency, as an experiment", "After the partnership began I independently tried configurable currency presentation (KWD among others). It was not a client requirement or a sign of a Kuwait/GCC market."],
    ],
    // Current live site, captured 26 Oct 2026. Replaces the 2025 collage entirely. The lead
    // captures use the site's own currency selector set to INR, matching the India-wide focus;
    // the last one keeps the KWD view as evidence of the later currency experiment.
    live: [
      { kind: "live", src: OWN("btl-current-home-desktop-inr.webp"), w: 1440, h: 900, alt: "Bhatkal Time Luxe home page on desktop: the headline 'Timeless Design. Modern Presence.', Explore Collection and Watch Houses buttons, and a featured watch priced in rupees.", caption: "Home, desktop. Currency set to INR." },
      { kind: "live", src: OWN("btl-current-product-desktop-inr.webp"), w: 1440, h: 900, alt: "Bhatkal Time Luxe product page on desktop: a watch photo, a discounted price in rupees, specifications, and Add to Cart and Buy via WhatsApp buttons.", caption: "Product page, desktop. Currency set to INR." },
      { kind: "live", src: OWN("btl-current-new-arrivals-desktop-inr.webp"), w: 1440, h: 900, alt: "Bhatkal Time Luxe New Arrivals catalogue on desktop: a grid of watch cards with discount badges, prices in rupees and Add buttons.", caption: "New Arrivals catalogue, desktop. Currency set to INR." },
      { kind: "live", src: OWN("btl-current-home-mobile-inr.webp"), w: 390, h: 680, alt: "Bhatkal Time Luxe home page on a phone: headline, Shop Collection button, three service badges and a row of brand logos.", caption: "Home, mobile (cropped above the floating contact button)." },
      { kind: "live", src: OWN("btl-current-product-mobile-inr.webp"), w: 390, h: 844, alt: "Bhatkal Time Luxe product page on a phone: watch photo, price in rupees, brand, colourway and reference.", caption: "Product page, mobile. Currency set to INR." },
      { kind: "live", src: OWN("btl-current-product-desktop.webp"), w: 1440, h: 900, alt: "The same Bhatkal Time Luxe product page with prices shown in Kuwaiti dinar (KD), from the later currency-presentation experiment.", caption: "Product page with the currency set to KWD: my later currency experiment, not a client requirement." },
    ],
    liveNote: "Current live site, captured 26 Oct 2026 from btl.hubzero.in using the site's own currency selector. Originally HubZero client work; now a showcase, not an active storefront.",
  },
};

// BTL's shared media entry is the 2025 collage; it is replaced, never merged.
export const projects = shared.map((p) => {
  const e = EXTRA[p.slug];
  return { ...p, ...e, media: e.live ?? p.media };
});
export const sharedMedia = SHARED_MEDIA;
/** The case studies of the six featured projects: the preview's work/<slug>/ pages. */
export const caseStudyD = (slug) => here(`../../../work/${slug}/`);
