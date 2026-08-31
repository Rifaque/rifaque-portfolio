import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import GlassCard from "@/components/GlassCard";
import GlassText from "@/components/GlassText";
import { personalInfo } from "@/data/portfolio";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const paragraphs = personalInfo.bio.split("\n\n");

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-12"
        >
          <GlassText as="h2" shimmer className="text-3xl sm:text-4xl md:text-5xl font-bold">
            About
          </GlassText>
          <div className="mt-3 sm:mt-4 w-16 sm:w-20 h-1 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-full" />
        </motion.div>

        {/* Content Card */}
        <GlassCard hover={false} className="p-5 sm:p-8 md:p-12">
          <div className="space-y-6">
            {paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="text-foreground/70 text-base sm:text-lg leading-relaxed"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Quick Facts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-foreground/[0.06] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">1+</p>
              <p className="text-foreground/50 text-xs sm:text-sm mt-1">Year Experience</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">10+</p>
              <p className="text-foreground/50 text-xs sm:text-sm mt-1">Projects Completed</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">15+</p>
              <p className="text-foreground/50 text-xs sm:text-sm mt-1">Technologies</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">∞</p>
              <p className="text-foreground/50 text-xs sm:text-sm mt-1">Curiosity</p>
            </div>
          </motion.div>
        </GlassCard>
      </div>
    </section>
  );
};

export default About;
