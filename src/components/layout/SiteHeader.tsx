import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { primaryNav } from "../../content/nav";

type Props = { onOpenPalette: () => void };

export function SiteHeader({ onOpenPalette }: Props) {
  // The shortcut hint is decided after hydration so the prerendered HTML and
  // the first client render agree.
  const [shortcut, setShortcut] = useState("Ctrl K");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut("⌘K");
  }, []);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="brand">
          RSX <span>Develops</span>
          <span className="sr-only">, home</span>
        </Link>
        <nav aria-label="Primary" className="site-nav">
          <ul>
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="jump" onClick={onOpenPalette} aria-haspopup="dialog">
          <span>Jump to…</span>
          <span className="kbd jump-kbd" aria-hidden="true">
            {shortcut}
          </span>
        </button>
      </div>
    </header>
  );
}
