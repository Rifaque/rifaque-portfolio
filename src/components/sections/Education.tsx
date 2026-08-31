import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiAward } from "react-icons/fi";
import GlassCard from "@/components/GlassCard";
import GlassText from "@/components/GlassText";
import { education } from "@/data/portfolio";

const Education = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showDetails, setShowDetails] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowDetails(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowDetails(false);
  };

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <GlassText as="h2" shimmer className="text-4xl md:text-5xl font-bold">
            Education
          </GlassText>
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-full" />
        </motion.div>

        {/* Education Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <GlassCard
            className="p-8"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-aurora-teal/20 to-aurora-purple/20">
                <FiAward className="w-6 h-6 text-aurora-teal" />
              </div>
              <div>
                <span className="text-aurora-teal text-sm font-medium">{education.dates}</span>
                <h3 className="text-2xl font-semibold text-foreground mt-1">{education.degree}</h3>
                <p className="text-foreground/80 mt-1">{education.field}</p>
                <p className="text-foreground/60 mt-2">{education.institution}</p>
                <p className="text-foreground/40 text-sm mt-1">{education.location}</p>
              </div>
            </div>
          </GlassCard>

          {/* Hover Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 top-full left-0 right-0 mt-2"
              >
                <GlassCard className="p-6 border-aurora-teal/20 shadow-[0_0_40px_hsl(168_84%_49%/0.15)]">
                  <h4 className="text-foreground font-medium mb-3">Achievements</h4>
                  <ul className="space-y-2">
                    {education.achievements.map((achievement, index) => (
                      <li key={index} className="text-foreground/70 text-sm flex items-start gap-2">
                        <span className="text-aurora-teal mt-1">▹</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
