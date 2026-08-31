import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { cn } from "@/lib/utils";


const navLinks = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Skills", href: "#skills" },
  { name: "GitHub", href: "#github" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Determine active section
      const sections = navLinks.map((link) => link.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{
          y: isScrolled ? 0 : -100,
          opacity: isScrolled ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-50",
          "hidden md:flex items-center gap-1 px-2 py-2",
          "bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl",
          "border border-black/[0.08] dark:border-white/[0.08] rounded-full",
          "shadow-[0_4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        )}
      >
        {navLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => scrollToSection(link.href)}
            className={cn(
              "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
              activeSection === link.href.slice(1)
                ? "text-foreground"
                : "text-foreground/60 hover:text-foreground"
            )}
          >
            {link.name}
            {activeSection === link.href.slice(1) && (
              <motion.div
                layoutId="activeSection"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-aurora-teal to-aurora-purple rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}

      </motion.nav>

      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={cn(
          "fixed top-4 right-4 z-50 p-3 md:hidden",
          "bg-white/70 dark:bg-white/[0.05] backdrop-blur-xl",
          "border border-black/[0.1] dark:border-white/[0.1] rounded-full",
          "text-foreground"
        )}
      >
        {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden bg-white/95 dark:bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center h-full gap-8"
            >
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => scrollToSection(link.href)}
                  className={cn(
                    "text-2xl font-medium transition-colors",
                    activeSection === link.href.slice(1)
                      ? "aurora-text"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {link.name}
                </motion.button>
              ))}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
