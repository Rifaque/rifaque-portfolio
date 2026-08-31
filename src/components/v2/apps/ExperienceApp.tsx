import { motion } from "framer-motion";
import { experiences } from "@/data/portfolio";

const ExperienceApp = () => {
    return (
        <div className="p-5 space-y-4">
            {/* Timeline */}
            <div className="relative space-y-6">
                {/* Timeline line */}
                <div className="absolute left-4 top-3 bottom-3 w-px bg-gradient-to-b from-aurora-teal/50 via-aurora-purple/30 to-transparent" />

                {experiences.map((exp, index) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-10"
                    >
                        {/* Timeline dot */}
                        <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-purple shadow-[0_0_10px_hsl(168_84%_49%/0.4)]" />

                        <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                            <span className="text-aurora-teal text-xs font-medium">{exp.dates}</span>
                            <h3 className="text-sm font-semibold text-foreground mt-1">{exp.role}</h3>
                            <p className="text-foreground/50 text-xs">{exp.company} • {exp.location}</p>
                            <p className="text-foreground/40 text-xs mt-2">{exp.shortDescription}</p>

                            {/* Expandable details */}
                            <div className="mt-3 space-y-1.5">
                                {exp.fullDescription.map((item, i) => (
                                    <p key={i} className="text-foreground/50 text-xs flex items-start gap-2">
                                        <span className="text-aurora-teal mt-0.5">▹</span>
                                        {item}
                                    </p>
                                ))}
                            </div>

                            {/* Tech */}
                            <div className="flex flex-wrap gap-1 mt-3">
                                {exp.technologies.map((tech) => (
                                    <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.03] dark:bg-white/[0.05] text-foreground/50">{tech}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ExperienceApp;
