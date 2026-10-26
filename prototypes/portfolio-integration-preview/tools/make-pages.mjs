// Writes work/<slug>/index.html for the six featured projects of the
// portfolio integration preview. Each page is Concept D's case study
// (prototypes/projects-redesign/project-space/case-studies/<slug>/index.html,
// read only) with its writing kept exactly; only the page wrapper changes to
// Projection's: its head, header (navigation, theme, sound) and footer, and
// the preview's stylesheet and script paths. Run from anywhere:
//   node prototypes/portfolio-integration-preview/tools/make-pages.mjs
// QueryCraft and BlueTap keep Projection's own pages (work/querycraft, work/bluetap).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const preview = join(here, "..");
const source = join(preview, "..", "projects-redesign", "project-space", "case-studies");
const SLUGS = ["atlas", "nexus", "extendspace", "reflux", "layers", "bhatkal-time-luxe"];

const one = (s, re, what) => {
  const m = s.match(re);
  if (!m) throw new Error(`${what}: not found`);
  return m;
};

const page = (slug, title, main) => `<!doctype html>
<html lang="en-GB" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Case study · Rifaque Akrami</title>
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#08090b">
<script>
  (function () {
    var d = document.documentElement, t = "dark", m;
    try { if (localStorage.getItem("rsx-theme") === "light") t = "light"; } catch (e) {}
    if ((m = /[?&]theme=(dark|light)/.exec(location.search))) t = m[1];
    d.dataset.theme = t;
    if (/[?&]motion=reduce/.test(location.search)) d.dataset.motion = "reduce";
    document.querySelector('meta[name="theme-color"]').content = t === "light" ? "#f4f5f7" : "#08090b";
  })();
</script>
<link rel="icon" href="../../brand/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="../../brand/favicon-32-dark.png">
<link rel="apple-touch-icon" href="../../brand/favicon-180-dark.png">
<link rel="stylesheet" href="../../css/tokens.css">
<link rel="stylesheet" href="../../css/app.css">
<link rel="stylesheet" href="../../css/stage3d.css">
<link rel="stylesheet" href="../../css/projects.css">
<link rel="stylesheet" href="../../css/cs.css">
</head>
<body data-project="${slug}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap top-row">
    <a class="mark" href="../../" aria-label="RSX Develops, home"><img class="wm wm-dark" src="../../brand/rsx-develops-wordmark-dark.png" srcset="../../brand/rsx-develops-wordmark-dark-2x.png 2x" width="774" height="109" alt=""><img class="wm wm-light" src="../../brand/rsx-develops-wordmark-light.png" srcset="../../brand/rsx-develops-wordmark-light-2x.png 2x" width="612" height="94" alt=""></a>
    <nav class="nav" aria-label="Sections">
      <a href="../../?project=${slug}#work" data-sound="press">Work</a>
      <a href="../../#about" data-sound="press">About</a>
      <a href="../../#experience" data-sound="press">Experience</a>
      <a href="../../#contact" data-sound="press">Contact</a>
    </nav>
    <div class="prefs">
      <button class="pref" id="theme-switch" type="button" aria-label="Switch to light theme" title="Switch to light theme">
        <svg class="pref-icon" viewBox="0 0 20 20" aria-hidden="true"><circle class="i-sun" cx="10" cy="10" r="3.6"/><path class="i-rays" d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7"/><path class="i-moon" d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1z"/></svg>
        <span class="pref-label">Light</span>
      </button>
      <button class="pref pref-square" id="sound-switch" type="button" data-on="false" aria-label="Enable sound" title="Enable sound">
        <svg class="pref-icon" viewBox="0 0 20 20" aria-hidden="true"><path class="i-spk" d="M3.5 7.5h3l4-3.2v11.4l-4-3.2h-3z"/><path class="i-wave" d="M13.4 7.2a4 4 0 0 1 0 5.6M15.6 5a7 7 0 0 1 0 10"/><path class="i-mute" d="M13.5 7.5l4 5M17.5 7.5l-4 5"/></svg>
      </button>
    </div>
  </div>
</header>
${main}
<footer class="foot"><div class="wrap foot-row"><p>© 2026 Rifaque Akrami</p></div></footer>
<script type="module" src="../../js/projects/space/case-studies/cs.js"></script>
</body>
</html>
`;

for (const slug of SLUGS) {
  const src = readFileSync(join(source, slug, "index.html"), "utf8");
  const title = one(src, /<h1>([^<]+)<\/h1>/, `${slug} title`)[1];
  let main = one(src, /<main id="main" class="cs wrap">[\s\S]*?<\/main>/, `${slug} main`)[0];
  // The concept's "← Project Space" link becomes a breadcrumb to this page's Projects section.
  const crumb = one(main, /<p class="cs-crumb"><a data-back href="\.\.\/\.\.\/">← Project Space<\/a><\/p>/, `${slug} crumb`)[0];
  // Start dates confirmed by the owner on 26 Oct 2026 (month precision); the concept pages say "2026 to now".
  const PERIOD = { reflux: "Oct 2026 to now", extendspace: "Oct 2026 to now", layers: "Oct 2026 to now" };
  if (PERIOD[slug]) {
    const from = "<dt>Period</dt><dd>2026 to now</dd>";
    if (!main.includes(from)) throw new Error(`${slug} period: not found`);
    main = main.replace(from, `<dt>Period</dt><dd>${PERIOD[slug]}</dd>`);
  }
  main = main.replace(crumb, `<nav class="crumbs cs-crumb" aria-label="Breadcrumb"><a data-back href="../../#work">Projects</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span></nav>`);
  const dir = join(preview, "work", slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(slug, title, main));
}
console.log(`wrote ${SLUGS.length} case-study pages`);
