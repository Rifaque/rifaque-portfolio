import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { footerNav, nav, site, support } from "../content/site";
import type { RouteMeta } from "../content/routes";
import { currentTheme, setTheme, sound, toast, type Theme } from "../lib/prefs";
import wmDark from "../assets/brand/rsx-develops-wordmark-dark.png";
import wmDark2x from "../assets/brand/rsx-develops-wordmark-dark-2x.png";
import wmLight from "../assets/brand/rsx-develops-wordmark-light.png";
import wmLight2x from "../assets/brand/rsx-develops-wordmark-light-2x.png";

/**
 * The page frame of the accepted design: a floating header (the approved
 * wordmark, the section links, a theme switch that names the theme it leads
 * to, and an icon-only sound switch), the page, and a quiet footer.
 */
export function Layout({ route, children }: { route: RouteMeta; children: ReactNode }) {
  // Controls marked data-sound play that cue (only once the visitor has turned sound on).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-sound]");
      const name = el?.dataset.sound;
      if (name && name !== "none") sound.play(name as Parameters<typeof sound.play>[0]);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="site" data-route={route.path}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header home={route.path === "/"} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="foot">
        <div className="wrap foot-row">
          <p>
            © 2026 {site.displayName}
            {footerNav.map((n) => (
              <span key={n.to}>
                {" · "}
                <Link to={n.to}>{n.label}</Link>
              </span>
            ))}
          </p>
          <p className="foot-quiet">
            If my open-source work is useful to you, you can support it:{" "}
            {support.map((s, i) => (
              <span key={s.href}>
                {i > 0 && ", "}
                <a href={s.href} rel="noopener">
                  {s.label}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </footer>
    </div>
  );
}

function Header({ home }: { home: boolean }) {
  // The prerendered page shows the dark theme's controls; the stored theme is read after hydration.
  const [theme, setThemeState] = useState<Theme>("dark");
  const [soundOn, setSoundOn] = useState(false);
  useEffect(() => {
    setThemeState(currentTheme());
    sound.init();
    return sound.subscribe(setSoundOn);
  }, []);

  const next: Theme = theme === "light" ? "dark" : "light";
  const soundLabel = soundOn ? "Mute sound" : "Enable sound";

  const toggleTheme = () => {
    sound.play("theme");
    setTheme(next);
    setThemeState(next);
  };
  const toggleSound = () => {
    const on = !sound.enabled;
    if (!on) sound.play("off");
    const ok = sound.set(on);
    if (on && ok) sound.play("on");
    if (on && !ok) toast(sound.available ? "Sound couldn't start in this browser." : "Sound isn't available here.");
  };

  return (
    <header className="top">
      <div className="wrap top-row">
        {/* Lazy: React would otherwise preload both themes' 2x files; the visible one still loads at once. */}
        <Link className="mark" to="/" aria-label={home ? "RSX Develops, back to the top" : "RSX Develops, home"} onClick={() => home && window.scrollTo({ top: 0 })}>
          <img className="wm wm-dark" src={wmDark} srcSet={`${wmDark2x} 2x`} width={774} height={109} alt="" loading="lazy" />
          <img className="wm wm-light" src={wmLight} srcSet={`${wmLight2x} 2x`} width={612} height={94} alt="" loading="lazy" />
        </Link>
        <nav className="nav" aria-label="Primary">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} data-sound="press">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="prefs">
          <button className="pref" id="theme-switch" type="button" aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`} onClick={toggleTheme}>
            <svg className="pref-icon" viewBox="0 0 20 20" aria-hidden="true">
              <circle className="i-sun" cx="10" cy="10" r="3.6" />
              <path className="i-rays" d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" />
              <path className="i-moon" d="M15.5 12.6A6.5 6.5 0 0 1 7.4 4.5a6.5 6.5 0 1 0 8.1 8.1z" />
            </svg>
            <span className="pref-label">{next === "light" ? "Light" : "Dark"}</span>
          </button>
          <button className="pref pref-square" id="sound-switch" type="button" data-on={String(soundOn)} aria-label={soundLabel} title={soundLabel} onClick={toggleSound}>
            <svg className="pref-icon" viewBox="0 0 20 20" aria-hidden="true">
              <path className="i-spk" d="M3.5 7.5h3l4-3.2v11.4l-4-3.2h-3z" />
              <path className="i-wave" d="M13.4 7.2a4 4 0 0 1 0 5.6M15.6 5a7 7 0 0 1 0 10" />
              <path className="i-mute" d="M13.5 7.5l4 5M17.5 7.5l-4 5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
