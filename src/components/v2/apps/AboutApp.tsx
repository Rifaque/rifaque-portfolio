import { useState, useEffect } from "react";
import { FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { personalInfo } from "@/data/portfolio";

const AboutApp = () => {
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentRoleIndex((prev) => (prev + 1) % personalInfo.roles.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurora-teal/30 to-aurora-purple/30 flex items-center justify-center mx-auto text-4xl">
                    👨‍💻
                </div>
                <h2 className="text-2xl font-bold text-foreground">{personalInfo.name}</h2>
                <div className="h-6 relative overflow-hidden flex justify-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentRoleIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-aurora-teal text-sm font-medium absolute"
                        >
                            {personalInfo.roles[currentRoleIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bio */}
            <div className="space-y-3">
                {personalInfo.bio.split("\n\n").map((p, i) => (
                    <p key={i} className="text-foreground/60 text-sm leading-relaxed">
                        {p}
                    </p>
                ))}
            </div>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: "Experience", value: "1+ Year" },
                    { label: "Projects", value: "10+" },
                    { label: "Technologies", value: "15+" },
                    { label: "Curiosity", value: "∞" },
                ].map((fact) => (
                    <div
                        key={fact.label}
                        className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] text-center"
                    >
                        <p className="text-foreground font-bold text-lg">{fact.value}</p>
                        <p className="text-foreground/40 text-xs">{fact.label}</p>
                    </div>
                ))}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-foreground/50 text-sm">
                <FiMapPin className="w-4 h-4" />
                <span>{personalInfo.location}</span>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
                <a
                    href={personalInfo.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-foreground/60 hover:text-foreground hover:border-aurora-teal/30 transition-all text-sm"
                >
                    <FiGithub className="w-4 h-4" /> GitHub
                </a>
                <a
                    href={personalInfo.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-foreground/60 hover:text-foreground hover:border-aurora-teal/30 transition-all text-sm"
                >
                    <FiLinkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a
                    href={`mailto:${personalInfo.email}`}
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-foreground/60 hover:text-foreground hover:border-aurora-teal/30 transition-all text-sm"
                >
                    <FiMail className="w-4 h-4" /> Email
                </a>
            </div>
        </div>
    );
};

export default AboutApp;
