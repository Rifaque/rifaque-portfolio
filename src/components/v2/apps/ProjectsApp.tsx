import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiGithub, FiArrowLeft } from "react-icons/fi";
import { projects, type Project } from "@/data/portfolio";

const ProjectsApp = () => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    if (selectedProject) {
        return (
            <div className="p-5 space-y-4">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedProject(null)}
                    className="flex items-center gap-2 text-foreground/60 hover:text-foreground text-sm transition-colors"
                >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Projects
                </button>

                {/* Project Image */}
                {selectedProject.image && (
                    <div className="rounded-lg overflow-hidden aspect-video">
                        <img
                            src={selectedProject.image}
                            alt={selectedProject.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <h2 className="text-xl font-bold text-foreground">{selectedProject.name}</h2>
                <p className="text-foreground/60 text-sm leading-relaxed">{selectedProject.fullDescription}</p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies.map((tech) => (
                        <span key={tech} className="px-2 py-1 text-xs rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] text-foreground/70">
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Links */}
                <div className="flex gap-3 pt-2">
                    {selectedProject.liveUrl && (
                        <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-aurora-teal text-sm hover:underline">
                            <FiExternalLink className="w-4 h-4" /> Live Demo
                        </a>
                    )}
                    {selectedProject.githubUrl && (
                        <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-foreground/60 text-sm hover:text-foreground">
                            <FiGithub className="w-4 h-4" /> Source Code
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
                {projects.map((project, index) => (
                    <motion.button
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedProject(project)}
                        className="text-left p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] hover:border-aurora-teal/20 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-all group"
                    >
                        {/* Thumbnail */}
                        {project.image && (
                            <div className="rounded-md overflow-hidden aspect-video mb-2">
                                <img src={project.image} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                        )}
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-aurora-teal transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-foreground/50 text-xs mt-1 line-clamp-2">{project.shortDescription}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.slice(0, 2).map((t) => (
                                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.03] dark:bg-white/[0.05] text-foreground/50">{t}</span>
                            ))}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default ProjectsApp;
