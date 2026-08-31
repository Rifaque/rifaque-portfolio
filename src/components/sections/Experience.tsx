import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import GlassText from "@/components/GlassText";
import { experiences, type Experience as ExperienceType } from "@/data/portfolio";

const ExperienceCard = ({ experience, index }: { experience: ExperienceType; index: number }) => {
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

  const isLeft = index % 2 === 0;

  return (
    <div className={`relative flex items-center gap-8 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
      {/* Timeline Line & Dot */}
      <div className="hidden md:flex flex-col items-center absolute left-1/2 -translate-x-1/2 top-0 bottom-0">
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-purple shadow-[0_0_15px_hsl(168_84%_49%/0.5)]" />
        <div className="flex-1 w-px bg-gradient-to-b from-aurora-teal/50 to-transparent" />
      </div>

      {/* Card */}
      <div className={`w-full md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-0" : "md:pl-0"}`}>
        <div className="relative">
          <GlassCard
            className="p-6"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span className="text-aurora-teal text-sm font-medium">{experience.dates}</span>
            <h3 className="text-xl font-semibold text-foreground mt-1">{experience.role}</h3>
            <p className="text-foreground/60 mt-1">{experience.company} • {experience.location}</p>
            <p className="text-foreground/50 text-sm mt-3">{experience.shortDescription}</p>
          </GlassCard>

          {/* Hover Detail */}
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
                  <ul className="space-y-2 mb-4">
                    {experience.fullDescription.map((item, i) => (
                      <li key={i} className="text-foreground/70 text-sm flex items-start gap-2">
                        <span className="text-aurora-teal mt-1">▹</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech) => (
                      <span key={tech} className="skill-pill text-xs text-foreground/70">
                        {tech}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-24 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <GlassText as="h2" shimmer className="text-4xl md:text-5xl font-bold">
            Experience
          </GlassText>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-full" />
        </motion.div>

        {/* Timeline */}
        <div className="relative space-y-12">
          {/* Mobile Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-aurora-teal/50 via-aurora-purple/30 to-transparent md:hidden" />

          {experiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="relative pl-10 md:pl-0"
            >
              {/* Mobile Dot */}
              <div className="absolute left-2 top-6 w-4 h-4 rounded-full bg-gradient-to-br from-aurora-teal to-aurora-purple shadow-[0_0_15px_hsl(168_84%_49%/0.5)] md:hidden" />

              <ExperienceCard experience={experience} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
