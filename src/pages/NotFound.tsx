import { Link } from "react-router";

/** Unknown paths. In production the prerendered 404.html is served with a real 404 status. */
export default function NotFound() {
  return (
    <div className="page page--ink">
      <header className="page-head">
        <p className="kicker">404</p>
        <h1 className="page-title">This page doesn't exist.</h1>
        <p className="page-lede">It may have moved when the site was rebuilt. Everything is reachable from the home page.</p>
        <div className="actions">
          <Link className="btn btn--primary" to="/">
            Go to the home page
          </Link>
          <Link className="btn" to="/#work">
            Selected work
          </Link>
          <Link className="btn" to="/archive">
            Archive
          </Link>
        </div>
      </header>
    </div>
  );
}
