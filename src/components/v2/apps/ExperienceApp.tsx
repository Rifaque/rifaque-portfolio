import { experiences } from "@/data/portfolio";

const ExperienceApp = () => (
    <div className="p-5">
        <ol className="space-y-6 border-l border-foreground/[0.1] pl-5">
            {experiences.map((job) => (
                <li key={job.id} className="relative">
                    <span
                        aria-hidden
                        className="absolute -left-[calc(1.25rem+3.5px)] top-1.5 h-1.5 w-1.5 rounded-full bg-aurora-teal"
                    />
                    <p className="font-mono text-[10px] text-foreground/45">
                        {job.dates} · {job.location}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-foreground">
                        {job.role}
                    </h3>
                    <p className="text-xs text-foreground/55">{job.company}</p>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                        {job.summary}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                        {job.highlights.map((item, i) => (
                            <li
                                key={i}
                                className="flex gap-2 text-xs leading-relaxed text-foreground/55"
                            >
                                <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aurora-teal/70" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <ul className="mt-3 flex flex-wrap gap-1">
                        {job.technologies.map((tech) => (
                            <li
                                key={tech}
                                className="rounded border border-foreground/10 px-1.5 py-0.5 text-[10px] text-foreground/45"
                            >
                                {tech}
                            </li>
                        ))}
                    </ul>
                </li>
            ))}
        </ol>
    </div>
);

export default ExperienceApp;
