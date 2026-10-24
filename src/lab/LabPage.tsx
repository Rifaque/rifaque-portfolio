import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { SelectedWork } from "../components/work/SelectedWork";
import { pick, selectedSlugs } from "../content/projects";

/**
 * Review route for the selected-work section. noindex (route manifest and
 * an X-Robots-Tag header), not in the sitemap, not linked from the site.
 * ?layout=pinned|stacked forces a layout for review.
 */
export default function LabPage() {
  const [params] = useSearchParams();
  const forced = params.get("layout");
  const layout = forced === "pinned" || forced === "stacked" ? forced : "auto";

  return (
    <Layout>
      <section className="container page" aria-labelledby="lab-title">
        <p className="kicker">Lab · not indexed</p>
        <h1 id="lab-title" className="page-title">
          Selected work, isolated
        </h1>
        <nav aria-label="Layout" className="lab-switch">
          <Link to="/lab" aria-current={layout === "auto" ? "page" : undefined}>
            Auto
          </Link>
          <Link to="/lab?layout=pinned" aria-current={layout === "pinned" ? "page" : undefined}>
            Pinned
          </Link>
          <Link to="/lab?layout=stacked" aria-current={layout === "stacked" ? "page" : undefined}>
            Stacked
          </Link>
        </nav>
      </section>
      <div className="container">
        <h2 className="sr-only">Selected work</h2>
        <SelectedWork projects={pick(selectedSlugs)} layout={layout} />
      </div>
    </Layout>
  );
}
