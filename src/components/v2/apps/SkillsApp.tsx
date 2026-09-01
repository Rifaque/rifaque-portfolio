import { skillEvidence, alsoWorkedWith, skillsIntro } from "@/data/portfolio";

const SkillsApp = () => (
    <div className="space-y-5 p-5">
        <p className="text-xs leading-relaxed text-foreground/45">{skillsIntro}</p>
        <dl className="space-y-3">
            {skillEvidence.map((skill) => (
                <div
                    key={skill.name}
                    className="border-t border-foreground/[0.08] pt-3"
                >
                    <dt className="text-sm font-medium text-foreground">{skill.name}</dt>
                    <dd className="mt-1 text-xs text-foreground/50">
                        {skill.evidence.join(" · ")}
                    </dd>
                </div>
            ))}
        </dl>
        <p className="border-t border-foreground/[0.08] pt-3 text-xs text-foreground/40">
            <span className="text-foreground/60">Also worked with:</span>{" "}
            {alsoWorkedWith.join(" · ")}
        </p>
    </div>
);

export default SkillsApp;
