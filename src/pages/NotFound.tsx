import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";

/**
 * Rendered for unknown paths. In production Vercel serves the prerendered
 * copy of this page (404.html) with a real 404 status.
 */
export default function NotFound() {
  return (
    <Layout notFound>
      <section className="container page notfound" aria-labelledby="nf-title">
        <p className="kicker">404</p>
        <h1 id="nf-title" className="page-title">
          This page doesn't exist.
        </h1>
        <p className="page-lede">
          It may have moved when the site was rebuilt. Everything that used to be here is reachable from the home page.
        </p>
        <ul className="notfound-links">
          <li>
            <Link to="/" className="btn btn--primary">
              Go to the home page
            </Link>
          </li>
          <li>
            <Link to="/#work" className="btn">
              Selected work
            </Link>
          </li>
          <li>
            <Link to="/archive" className="btn">
              Archive
            </Link>
          </li>
        </ul>
      </section>
    </Layout>
  );
}
