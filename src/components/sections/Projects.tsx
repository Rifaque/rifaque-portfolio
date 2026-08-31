import { useState, useRef } from "react";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiExternalLink, FiGithub, FiX, FiFolder, FiCalendar } from "react-icons/fi";
import LiquidGlassCard from "@/components/effects/LiquidGlassCard";
import GlassCard from "@/components/GlassCard";
import GlassText from "@/components/GlassText";
import { projects, type Project } from "@/data/portfolio";

const categories = ["all", "web", "ai", "desktop"] as const;

const ProjectCard = ({ project, onSelect }: { project: Project; onSelect: () => void }) => {
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovering(false);
  };

  return (
    <div className="relative">
      <LiquidGlassCard
        className="p-6 cursor-pointer h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onSelect}
        intensity="normal"
      >
        {/* Project Screenshot */}
        <div className="relative aspect-video rounded-lg mb-4 overflow-hidden">
          <img
            src={project.image || "/projectscreenshots/fallback.png"}
            alt={`${project.name} screenshot`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">{project.name}</h3>
        <p className="text-foreground/60 text-sm mb-4 line-clamp-2">{project.shortDescription}</p>

        {/* Tech Pills */}
        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="skill-pill text-xs text-foreground/70">
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="skill-pill text-xs text-foreground/50">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      </LiquidGlassCard>

      {/* Hover Detail Card */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 top-full left-0 right-0 mt-2"
          >
            <GlassCard className="p-4 border-aurora-teal/20 shadow-[0_0_40px_hsl(168_84%_49%/0.15)]">
              <p className="text-foreground/70 text-sm mb-3">{project.hoverDescription}</p>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-aurora-teal text-sm hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-foreground/70 text-sm hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiGithub className="w-4 h-4" />
                    Code
                  </a>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProjectModal = ({ project, onClose }: { project: Project; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 dark:bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="w-full sm:max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="p-4 sm:p-8 border-aurora-teal/20 rounded-t-2xl sm:rounded-2xl" hover={false}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-foreground/50 hover:text-foreground transition-colors glass-panel rounded-full"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Hero Screenshot */}
          {project.image && (
            <div className="relative aspect-[1280/450] rounded-xl overflow-hidden mb-6 -mx-4 sm:mx-0 -mt-4 sm:mt-0">
              <img
                src={project.image}
                alt={`${project.name} screenshot`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )}

          {/* Category & Date Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="skill-pill flex items-center gap-1.5 text-xs sm:text-sm text-aurora-teal">
              <FiFolder className="w-3.5 h-3.5" />
              {project.category}
            </span>
            <span className="skill-pill flex items-center gap-1.5 text-xs sm:text-sm text-foreground/70">
              <FiCalendar className="w-3.5 h-3.5" />
              {project.dates}
            </span>
          </div>

          {/* Project Title */}
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 pr-8">{project.name}</h3>

          {/* Divider */}
          <div className="h-px bg-foreground/10 my-5 sm:my-6" />

          {/* About Section */}
          <div className="mb-5 sm:mb-6">
            <h4 className="text-xs sm:text-sm uppercase tracking-wider text-aurora-teal font-medium mb-3">
              About This Project
            </h4>
            <div className="space-y-4 text-foreground/70 text-sm sm:text-base leading-relaxed">
              {project.fullDescription.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-foreground/10 my-5 sm:my-6" />

          {/* Tech Stack Section */}
          <div className="mb-5 sm:mb-6">
            <h4 className="text-xs sm:text-sm uppercase tracking-wider text-aurora-teal font-medium mb-3">
              Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span key={tech} className="skill-pill text-xs sm:text-sm text-foreground/80">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-foreground/10 my-5 sm:my-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button aurora-glow rounded-lg flex items-center justify-center gap-2 text-foreground w-full sm:w-auto"
              >
                <FiExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button rounded-lg flex items-center justify-center gap-2 text-foreground/80 w-full sm:w-auto"
              >
                <FiGithub className="w-4 h-4" />
                View Code
              </a>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [filter, setFilter] = useState<typeof categories[number]>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const featuredProjects = projects.filter((p) => p.featured);

  const filteredAllProjects = filter === "all"
    ? projects
    : projects.filter((p) => p.category === filter);

  return (
    <section id="projects" className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <GlassText as="h2" shimmer className="text-4xl md:text-5xl font-bold">
            Projects
          </GlassText>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-full" />
        </motion.div>

        {/* Featured Projects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <h3 className="text-xl font-semibold text-foreground/80 mb-6">Featured</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <ProjectCard
                  project={project}
                  onSelect={() => setSelectedProject(project)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Other Projects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold text-foreground/80">All Projects</h3>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`skill-pill capitalize transition-all duration-200 ${filter === category
                      ? "border-aurora-teal/40 text-foreground shadow-[0_0_15px_hsl(168_84%_49%/0.2)]"
                      : "text-foreground/60"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAllProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProjectCard
                    project={project}
                    onSelect={() => setSelectedProject(project)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
