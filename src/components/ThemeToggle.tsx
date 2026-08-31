import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { cn } from "@/lib/utils";

const ThemeToggle = ({ className }: { className?: string }) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div
                className={cn(
                    "p-2 rounded-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] w-9 h-9",
                    className
                )}
            />
        );
    }

    const isDark = theme === "dark";

    return (
        <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
                "relative p-2 rounded-full transition-all duration-300",
                "bg-black/[0.04] dark:bg-white/[0.05]",
                "border border-black/[0.08] dark:border-white/[0.08]",
                "hover:border-aurora-teal/30",
                "hover:shadow-[0_0_20px_hsl(168_84%_49%/0.15)]",
                "text-foreground/70 hover:text-foreground",
                className
            )}
            whileTap={{ scale: 0.9 }}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FiMoon className="w-4 h-4" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 90, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: -90, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FiSun className="w-4 h-4" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export default ThemeToggle;
