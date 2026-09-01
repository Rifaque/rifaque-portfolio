import Section, { Reveal } from "@/components/Section";
import { personalInfo, education } from "@/data/portfolio";

const About = () => (
  <Section id="about" eyebrow="About" heading="How I got here">
    <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16 2xl:gap-24">
      <Reveal className="min-w-0">
        <div className="max-w-2xl space-y-5">
          {personalInfo.bio.map((paragraph, i) => (
            <p
              key={i}
              className="text-[0.95rem] leading-[1.75] text-foreground/70 sm:text-base lg:text-[1.05rem]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>

      {/* Education is real and relevant, and it is not the headline. */}
      <Reveal delay={0.08} className="min-w-0">
        <aside className="border-t border-foreground/[0.1] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:pl-10">
          <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/40">
            Education
          </h3>
          <p className="mt-4 text-[0.95rem] font-medium text-foreground">
            {education.degree}, {education.field}
          </p>
          <p className="mt-1 text-sm text-foreground/60">{education.university}</p>
          <dl className="mt-4 space-y-1.5 text-sm text-foreground/50">
            <div className="flex gap-2">
              <dt className="text-foreground/40">Years</dt>
              <dd>{education.dates}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-foreground/40">CGPA</dt>
              <dd>{education.cgpa}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-foreground/40">Final year</dt>
              <dd>{education.finalYearProject}</dd>
            </div>
          </dl>

          <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-foreground/40">
            Training
          </h3>
          <p className="mt-3 text-[0.95rem] text-foreground/70">
            {education.training.name}
          </p>
          <p className="mt-1 text-sm text-foreground/45">
            {education.training.issuer} · {education.training.date}
          </p>
          <p className="mt-1 text-sm text-foreground/45">
            {education.training.note}
          </p>
        </aside>
      </Reveal>
    </div>
  </Section>
);

export default About;
