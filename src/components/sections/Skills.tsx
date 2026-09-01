import Section, { Reveal } from "@/components/Section";
import { skillEvidence, alsoWorkedWith, skillsIntro } from "@/data/portfolio";

const Skills = () => (
  <Section id="skills" eyebrow="Skills" heading="Attached to evidence" lede={skillsIntro}>
    <Reveal>
      {/*
        One column on phones so each skill and its evidence read as a pair,
        two on tablets, three from large, four on very wide displays.
      */}
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-6 lg:grid-cols-3 2xl:grid-cols-4">
        {skillEvidence.map((skill) => (
          <div
            key={skill.name}
            className="border-t border-foreground/[0.1] pt-4"
          >
            <dt className="text-[0.95rem] font-medium text-foreground">
              {skill.name}
            </dt>
            <dd className="mt-1.5 text-sm text-foreground/50">
              {skill.evidence.join(" · ")}
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>

    <Reveal delay={0.08}>
      <p className="mt-10 text-sm text-foreground/45">
        <span className="text-foreground/70">Also worked with:</span>{" "}
        {alsoWorkedWith.join(" · ")}. Real but not recent — I would not put them
        forward as current strengths.
      </p>
    </Reveal>
  </Section>
);

export default Skills;
