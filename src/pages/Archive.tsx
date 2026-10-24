import { Layout } from "../components/layout/Layout";
import { ExternalLink } from "../components/ExternalLink";
import { archive, archiveIntro } from "../content/archive";

export default function Archive() {
  return (
    <Layout>
      <section className="container page" aria-labelledby="archive-title">
        <p className="kicker">Archive</p>
        <h1 id="archive-title" className="page-title">
          Earlier work
        </h1>
        <p className="page-lede">{archiveIntro}</p>
        <ol className="archive">
          {archive.map((a) => (
            <li key={a.id} className="archive-row">
              <p className="archive-when">{a.period}</p>
              <div>
                <h2 className="archive-name">{a.name}</h2>
                <p className="archive-desc">{a.description}</p>
                <p className="archive-stack">{a.stack.join(" · ")}</p>
              </div>
              <ExternalLink href={a.source} className="text-link archive-link">
                Source<span className="sr-only"> for {a.name}</span>
              </ExternalLink>
            </li>
          ))}
        </ol>
      </section>
    </Layout>
  );
}
