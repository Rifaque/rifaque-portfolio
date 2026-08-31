import { motion } from "framer-motion";
import { useState } from "react";
import { TypeAnimation } from "react-type-animation";
import { FiGithub, FiLinkedin, FiMail, FiDownload, FiMonitor } from "react-icons/fi";
import GlassText from "@/components/GlassText";
import { personalInfo } from "@/data/portfolio";
import ShutdownTransition from "@/components/ShutdownTransition";

const socialLinks = [
  { icon: FiGithub, href: personalInfo.socials.github, label: "GitHub" },
  { icon: FiLinkedin, href: personalInfo.socials.linkedin, label: "LinkedIn" },
];

const Hero = () => {
  const [showShutdown, setShowShutdown] = useState(false);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-foreground/60 text-base sm:text-lg mb-3 sm:mb-4"
        >
          Hi, I'm
        </motion.p>

        {/* Name with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassText
            as="h1"
            shimmer
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6"
          >
            {personalInfo.name}
          </GlassText>
        </motion.div>

        {/* Typewriter with Aurora Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-10 sm:h-12 md:h-14 mb-6 sm:mb-8"
        >
          <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium aurora-text">
            <TypeAnimation
              sequence={personalInfo.roles.flatMap((role) => [role, 2000])}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </span>
        </motion.div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-foreground/60 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
        >
          I build exceptional digital experiences with modern technologies.
          Passionate about clean code, beautiful design, and innovative solutions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          <button
            onClick={scrollToContact}
            className="glass-button rounded-full text-foreground font-medium flex items-center gap-2 aurora-glow w-full sm:w-auto justify-center"
          >
            Let's Connect
            <FiMail className="w-4 h-4" />
          </button>
          <a
            href="#projects"
            className="glass-button rounded-full text-foreground/80 font-medium w-full sm:w-auto text-center"
          >
            View Projects
          </a>
          <a
            href={personalInfo.resume}
            download
            className="glass-button rounded-full text-foreground/80 font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <FiDownload className="w-4 h-4" />
            Resume
          </a>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShutdown(true)}
            className="glass-button rounded-full text-foreground font-medium flex items-center gap-2 w-full sm:w-auto justify-center aurora-glow-purple"
          >
            <FiMonitor className="w-4 h-4" />
            Launch Desktop
          </motion.button>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-3 relative z-10"
        >
          {/* GitHub & LinkedIn */}
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="p-3 rounded-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-foreground/70 hover:text-foreground hover:border-aurora-teal/30 hover:shadow-[0_0_20px_hsl(168_84%_49%/0.15)] transition-all duration-300"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}

          {/* HARD-CODED EMAIL (no Framer weirdness) */}
          <a
            href="mailto:rifaque.rs@gmail.com"
            aria-label="Email"
            className="p-3 rounded-full bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-foreground/70 hover:text-foreground hover:border-aurora-teal/30 hover:shadow-[0_0_20px_hsl(168_84%_49%/0.15)] transition-all duration-300 relative z-20"
          >
            <FiMail className="w-5 h-5" />
          </a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-foreground/50 rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Shutdown Transition Overlay */}
      {showShutdown && <ShutdownTransition />}
    </section>
  );
};

export default Hero;
