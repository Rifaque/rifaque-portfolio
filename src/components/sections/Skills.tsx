import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassText from "@/components/GlassText";
import SkillsConstellation from "@/components/effects/SkillsConstellation";
import { skillCategories } from "@/data/portfolio";
import { FiGrid, FiStar } from "react-icons/fi";
import {
  FaPython, FaJsSquare, FaJava, FaReact, FaNodeJs, FaGitAlt, FaCode,
  FaDatabase, FaTools, FaMobile
} from "react-icons/fa";
import {
  SiTypescript, SiNextdotjs, SiTailwindcss, SiMongodb, SiSqlite,
  SiFirebase, SiNginx, SiCloudflare, SiPostman, SiFigma, SiFlask,
  SiFramer, SiExpress, SiMysql, SiSocketdotio, SiAndroidstudio, SiGradle,
  SiRust, SiTauri, SiFastify, SiDocker, SiTurborepo
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { TbBrandFramerMotion, TbBrandCpp } from "react-icons/tb";
import { DiCss3, DiHtml5 } from "react-icons/di";
import { BiLogoPostgresql } from "react-icons/bi";

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Languages": <FaCode className="w-5 h-5" />,
  "Frontend": <FaReact className="w-5 h-5" />,
  "Backend & Systems": <FaNodeJs className="w-5 h-5" />,
  "Backend": <FaNodeJs className="w-5 h-5" />,
  "Databases & Storage": <FaDatabase className="w-5 h-5" />,
  "Databases": <FaDatabase className="w-5 h-5" />,
  "AI/ML & RAG": <SiTauri className="w-5 h-5" />,
  "DevOps, Infrastructure & Tools": <FaTools className="w-5 h-5" />,
  "DevOps & Tools": <FaTools className="w-5 h-5" />,
  "App Development": <FaMobile className="w-5 h-5" />,
};

// Skill icon mapping
const skillIcons: Record<string, React.ReactNode> = {
  "Python": <FaPython className="w-3.5 h-3.5" />,
  "JavaScript": <FaJsSquare className="w-3.5 h-3.5" />,
  "TypeScript": <SiTypescript className="w-3.5 h-3.5" />,
  "Java": <FaJava className="w-3.5 h-3.5" />,
  "Rust": <SiRust className="w-3.5 h-3.5" />,
  "C": <TbBrandCpp className="w-3.5 h-3.5" />,
  "React": <FaReact className="w-3.5 h-3.5" />,
  "Next.js": <SiNextdotjs className="w-3.5 h-3.5" />,
  "Tailwind CSS": <SiTailwindcss className="w-3.5 h-3.5" />,
  "HTML": <DiHtml5 className="w-3.5 h-3.5" />,
  "CSS": <DiCss3 className="w-3.5 h-3.5" />,
  "Framer Motion": <TbBrandFramerMotion className="w-3.5 h-3.5" />,
  "GSAP": <SiFramer className="w-3.5 h-3.5" />,
  "Vite": <SiFramer className="w-3.5 h-3.5" />,
  "Node.js": <FaNodeJs className="w-3.5 h-3.5" />,
  "Fastify": <SiFastify className="w-3.5 h-3.5" />,
  "Express.js": <SiExpress className="w-3.5 h-3.5" />,
  "REST APIs": <FaNodeJs className="w-3.5 h-3.5" />,
  "Socket.io": <SiSocketdotio className="w-3.5 h-3.5" />,
  "Firebase Auth": <SiFirebase className="w-3.5 h-3.5" />,
  "Flask": <SiFlask className="w-3.5 h-3.5" />,
  "Retrieval Augmented Generation (RAG)": <SiTauri className="w-3.5 h-3.5" />,
  "LLM Integration": <FaCode className="w-3.5 h-3.5" />,
  "Vector Databases": <FaDatabase className="w-3.5 h-3.5" />,
  "LanceDB": <FaDatabase className="w-3.5 h-3.5" />,
  "Ollama": <FaCode className="w-3.5 h-3.5" />,
  "Embeddings": <FaCode className="w-3.5 h-3.5" />,
  "MongoDB": <SiMongodb className="w-3.5 h-3.5" />,
  "SQL": <BiLogoPostgresql className="w-3.5 h-3.5" />,
  "SQLite": <SiSqlite className="w-3.5 h-3.5" />,
  "Firestore": <SiFirebase className="w-3.5 h-3.5" />,
  "MySQL": <SiMysql className="w-3.5 h-3.5" />,
  "Tauri": <SiTauri className="w-3.5 h-3.5" />,
  "NGINX": <SiNginx className="w-3.5 h-3.5" />,
  "Linux": <VscVscode className="w-3.5 h-3.5" />,
  "Cloudflare": <SiCloudflare className="w-3.5 h-3.5" />,
  "Git": <FaGitAlt className="w-3.5 h-3.5" />,
  "Turborepo": <SiTurborepo className="w-3.5 h-3.5" />,
  "Postman": <SiPostman className="w-3.5 h-3.5" />,
  "Figma": <SiFigma className="w-3.5 h-3.5" />,
  "VS Code": <VscVscode className="w-3.5 h-3.5" />,
  "Docker": <SiDocker className="w-3.5 h-3.5" />,
  "Firebase": <SiFirebase className="w-3.5 h-3.5" />,
  "Android (Java)": <FaJava className="w-3.5 h-3.5" />,
  "Android Studio": <SiAndroidstudio className="w-3.5 h-3.5" />,
  "Gradle": <SiGradle className="w-3.5 h-3.5" />,
  "Tkinter": <FaPython className="w-3.5 h-3.5" />,
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [viewMode, setViewMode] = useState<"grid" | "constellation">("grid");

  return (
    <section id="skills" className="py-16 sm:py-24 px-4 sm:px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <GlassText as="h2" shimmer className="text-3xl sm:text-4xl md:text-5xl font-bold">
                Skills
              </GlassText>
              <div className="mt-3 sm:mt-4 w-16 sm:w-20 h-1 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-full" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid"
                    ? "bg-aurora-teal/20 text-aurora-teal"
                    : "text-foreground/50 hover:text-foreground"
                  }`}
                aria-label="Grid view"
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("constellation")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "constellation"
                    ? "bg-aurora-teal/20 text-aurora-teal"
                    : "text-foreground/50 hover:text-foreground"
                  }`}
                aria-label="Constellation view"
              >
                <FiStar className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Constellation View */}
        {viewMode === "constellation" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <SkillsConstellation />
          </motion.div>
        )}

        {/* Skills Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + categoryIndex * 0.1 }}
              >
                <GlassCard className="p-4 sm:p-6 h-full" hover={false}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-aurora-teal/20 to-aurora-purple/20 text-aurora-teal">
                      {categoryIcons[category.name] || <FaCode className="w-5 h-5" />}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          duration: 0.3,
                          delay: 0.2 + categoryIndex * 0.1 + skillIndex * 0.05,
                        }}
                        className="skill-pill text-foreground/80 flex items-center gap-1.5"
                      >
                        {skillIcons[skill] && (
                          <span className="text-aurora-teal">
                            {skillIcons[skill]}
                          </span>
                        )}
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
