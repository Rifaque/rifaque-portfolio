import { motion } from "framer-motion";
import { skillCategories } from "@/data/portfolio";
import { FaCode, FaReact, FaNodeJs, FaDatabase, FaTools, FaMobile } from "react-icons/fa";

const categoryIcons: Record<string, React.ReactNode> = {
    "Languages": <FaCode className="w-4 h-4" />,
    "Frontend": <FaReact className="w-4 h-4" />,
    "Backend & Systems": <FaNodeJs className="w-4 h-4" />,
    "Backend": <FaNodeJs className="w-4 h-4" />,
    "Databases & Storage": <FaDatabase className="w-4 h-4" />,
    "Databases": <FaDatabase className="w-4 h-4" />,
    "AI/ML & RAG": <FaCode className="w-4 h-4" />,
    "DevOps, Infrastructure & Tools": <FaTools className="w-4 h-4" />,
    "DevOps & Tools": <FaTools className="w-4 h-4" />,
    "App Development": <FaMobile className="w-4 h-4" />,
};

const SkillsApp = () => {
    return (
        <div className="p-5 space-y-4">
            {skillCategories.map((category, catIndex) => (
                <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIndex * 0.08 }}
                    className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-aurora-teal/20 to-aurora-purple/20 text-aurora-teal">
                            {categoryIcons[category.name] || <FaCode className="w-4 h-4" />}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {category.skills.map((skill, skillIndex) => (
                            <motion.span
                                key={skill}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: catIndex * 0.08 + skillIndex * 0.03 }}
                                className="px-2.5 py-1 text-xs rounded-md bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-foreground/70 hover:border-aurora-teal/30 hover:text-foreground transition-all cursor-default"
                            >
                                {skill}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default SkillsApp;
