import { archive, archiveIntro } from "../content/profile";

export default function Archive() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">Archive</p>
        <h1 className="page-title">Earlier work</h1>
        <p className="page-lede">{archiveIntro}</p>
      </header>
      <ol className="archive">
        {archive.map((a) => (
          <li key={a.id}>
            <p className="mono archive-when">{a.period}</p>
            <div>
              <h2 className="archive-name">{a.name}</h2>
              <p>{a.description}</p>
              <p className="mono archive-stack">{a.stack.join(" · ")}</p>
            </div>
            <a className="btn" href={a.source} rel="noopener">
              Source<span className="sr-only"> for {a.name}</span> <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
