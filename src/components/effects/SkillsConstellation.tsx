import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillCategories } from "@/data/portfolio";
import { useMousePosition } from "@/hooks/useMousePosition";
import GlassCard from "@/components/GlassCard";
import { 
  FaPython, FaJsSquare, FaJava, FaReact, FaNodeJs, FaGitAlt, FaCode,
  FaDatabase, FaTools, FaMobile
} from "react-icons/fa";
import { 
  SiTypescript, SiNextdotjs, SiTailwindcss, SiMongodb, SiSqlite, 
  SiFirebase, SiNginx, SiCloudflare, SiPostman, SiFigma, SiFlask,
  SiFramer, SiExpress, SiMysql, SiSocketdotio, SiAndroidstudio, SiGradle
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
import { TbBrandFramerMotion, TbBrandCpp } from "react-icons/tb";
import { DiCss3, DiHtml5 } from "react-icons/di";
import { BiLogoPostgresql } from "react-icons/bi";
import { IconType } from "react-icons";

interface Star {
  x: number;
  y: number;
  name: string;
  category: string;
  baseX: number;
  baseY: number;
  size: number;
  brightness: number;
}

interface SelectedSkill {
  skill: Star;
  x: number;
  y: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Languages: "168, 84%, 49%",
  Frontend: "258, 90%, 66%",
  Backend: "330, 86%, 70%",
  Databases: "160, 84%, 39%",
  "DevOps & Tools": "200, 80%, 50%",
  "App Development": "280, 70%, 60%",
};

const CATEGORY_ICONS: Record<string, IconType> = {
  Languages: FaCode,
  Frontend: FaReact,
  Backend: FaNodeJs,
  Databases: FaDatabase,
  "DevOps & Tools": FaTools,
  "App Development": FaMobile,
};

const SKILL_ICONS: Record<string, IconType> = {
  // Languages
  "Python": FaPython,
  "JavaScript": FaJsSquare,
  "TypeScript": SiTypescript,
  "Java": FaJava,
  "C": TbBrandCpp,
  // Frontend
  "React": FaReact,
  "Next.js": SiNextdotjs,
  "Tailwind CSS": SiTailwindcss,
  "HTML": DiHtml5,
  "CSS": DiCss3,
  "Framer Motion": TbBrandFramerMotion,
  "GSAP": SiFramer,
  // Backend
  "Node.js": FaNodeJs,
  "Express.js": SiExpress,
  "REST APIs": FaNodeJs,
  "Socket.io": SiSocketdotio,
  "Firebase Auth": SiFirebase,
  "Flask": SiFlask,
  // Databases
  "MongoDB": SiMongodb,
  "SQL": BiLogoPostgresql,
  "SQLite": SiSqlite,
  "Firestore": SiFirebase,
  "MySQL": SiMysql,
  // DevOps & Tools
  "NGINX": SiNginx,
  "Linux": VscVscode,
  "Cloudflare": SiCloudflare,
  "Git": FaGitAlt,
  "Postman": SiPostman,
  "Figma": SiFigma,
  "VS Code": VscVscode,
  "Firebase": SiFirebase,
  "Imgix": SiCloudflare,
  // App Development
  "Android (Java)": FaJava,
  "Android Studio": SiAndroidstudio,
  "Gradle": SiGradle,
  "Tkinter": FaPython,
};

const SkillsConstellation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>();
  const mousePosition = useMousePosition();
  const [hoveredSkill, setHoveredSkill] = useState<Star | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SelectedSkill | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    const categoryCount = skillCategories.length;
    const angleStep = (2 * Math.PI) / categoryCount;
    const centerX = width / 2;
    const centerY = height / 2;
    const categoryRadius = Math.min(width, height) * 0.32;

    skillCategories.forEach((category, catIndex) => {
      const categoryAngle = angleStep * catIndex - Math.PI / 2;
      const categoryCenterX = centerX + Math.cos(categoryAngle) * categoryRadius;
      const categoryCenterY = centerY + Math.sin(categoryAngle) * categoryRadius;

      category.skills.forEach((skill, skillIndex) => {
        const skillAngle = (2 * Math.PI * skillIndex) / category.skills.length;
        const skillRadius = 50 + Math.random() * 35;
        const x = categoryCenterX + Math.cos(skillAngle) * skillRadius;
        const y = categoryCenterY + Math.sin(skillAngle) * skillRadius;

        stars.push({
          x,
          y,
          baseX: x,
          baseY: y,
          name: skill,
          category: category.name,
          size: 3 + Math.random() * 2,
          brightness: 0.6 + Math.random() * 0.4,
        });
      });
    });

    return stars;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setDimensions({ width: rect.width, height: rect.height });
      starsRef.current = initStars(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initStars]);

  // Handle click on stars
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find clicked star
    for (const star of starsRef.current) {
      const dx = star.x - clickX;
      const dy = star.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 20) {
        setSelectedSkill({ skill: star, x: star.x, y: star.y });
        return;
      }
    }
    
    // Clicked elsewhere, close detail
    setSelectedSkill(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rect = container.getBoundingClientRect();
      const relativeMouseX = mousePosition.x - rect.left;
      const relativeMouseY = mousePosition.y - rect.top;

      let closestStar: Star | null = null;
      let closestDist = Infinity;

      // Draw connections first (behind stars)
      const categoryStars: Record<string, Star[]> = {};
      starsRef.current.forEach((star) => {
        if (!categoryStars[star.category]) categoryStars[star.category] = [];
        categoryStars[star.category].push(star);
      });

      // Draw category center connections
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      Object.entries(categoryStars).forEach(([category, stars]) => {
        const color = CATEGORY_COLORS[category] || "168, 84%, 49%";
        
        // Calculate category center
        let catCenterX = 0, catCenterY = 0;
        stars.forEach(star => {
          catCenterX += star.x;
          catCenterY += star.y;
        });
        catCenterX /= stars.length;
        catCenterY /= stars.length;

        // Draw line from global center to category center
        const distToCenter = Math.sqrt(
          Math.pow(catCenterX - centerX, 2) + Math.pow(catCenterY - centerY, 2)
        );
        const mouseDistToCenter = Math.sqrt(
          Math.pow(relativeMouseX - centerX, 2) + Math.pow(relativeMouseY - centerY, 2)
        );
        const centerAlpha = Math.max(0.05, 0.15 - mouseDistToCenter / 1000);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(catCenterX, catCenterY);
        ctx.strokeStyle = `hsla(${color}, ${centerAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw connections between skills in same category
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              // Pulse effect based on mouse proximity
              const midX = (stars[i].x + stars[j].x) / 2;
              const midY = (stars[i].y + stars[j].y) / 2;
              const mouseDist = Math.sqrt(
                Math.pow(relativeMouseX - midX, 2) + Math.pow(relativeMouseY - midY, 2)
              );
              const pulseAlpha = (1 - dist / 120) * (0.2 + Math.max(0, 0.3 - mouseDist / 200));
              
              ctx.beginPath();
              ctx.moveTo(stars[i].x, stars[i].y);
              ctx.lineTo(stars[j].x, stars[j].y);
              ctx.strokeStyle = `hsla(${color}, ${pulseAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      });

      // Draw center node
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
      centerGradient.addColorStop(0, "hsla(168, 84%, 49%, 0.6)");
      centerGradient.addColorStop(0.5, "hsla(258, 90%, 66%, 0.3)");
      centerGradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = centerGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(168, 84%, 49%, 0.9)";
      ctx.fill();

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Floating animation
        const time = Date.now() * 0.001;
        const floatAmplitude = 3;
        star.x = star.baseX + Math.sin(time * 0.5 + star.baseX * 0.01) * floatAmplitude;
        star.y = star.baseY + Math.cos(time * 0.5 + star.baseY * 0.01) * floatAmplitude;

        // Calculate distance to mouse
        const dx = star.x - relativeMouseX;
        const dy = star.y - relativeMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Track closest star for hover
        if (dist < closestDist && dist < 35) {
          closestDist = dist;
          closestStar = star;
        }

        // Brightness increases when mouse is near
        const proximityBrightness = Math.max(0, 1 - dist / 120);
        const totalBrightness = star.brightness + proximityBrightness * 0.6;
        const isHovered = closestStar === star && closestDist < 35;
        const isSelected = selectedSkill?.skill.name === star.name;

        const color = CATEGORY_COLORS[star.category] || "168, 84%, 49%";

        // Draw outer glow (larger when hovered/selected)
        const glowMultiplier = isHovered || isSelected ? 4 : 3;
        const outerGlow = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.size * (glowMultiplier + proximityBrightness * 2)
        );
        outerGlow.addColorStop(0, `hsla(${color}, ${totalBrightness * 0.5})`);
        outerGlow.addColorStop(0.5, `hsla(${color}, ${totalBrightness * 0.2})`);
        outerGlow.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (glowMultiplier + proximityBrightness * 2), 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Draw star core with ring effect
        const coreSize = star.size * (1.2 + proximityBrightness * 0.4);
        
        // Ring
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, coreSize + 4, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${color}, 0.5)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Core
        ctx.beginPath();
        ctx.arc(star.x, star.y, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${color}, ${Math.min(1, totalBrightness)})`;
        ctx.fill();

        // Inner bright spot
        ctx.beginPath();
        ctx.arc(star.x, star.y, coreSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(0, 0%, 100%, ${totalBrightness * 0.8})`;
        ctx.fill();
      });

      setHoveredSkill(closestStar);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePosition, dimensions, selectedSkill]);

  const HoveredSkillIcon = hoveredSkill ? SKILL_ICONS[hoveredSkill.name] : null;
  const SelectedSkillIcon = selectedSkill ? SKILL_ICONS[selectedSkill.skill.name] : null;
  const SelectedCategoryIcon = selectedSkill ? CATEGORY_ICONS[selectedSkill.skill.category] : null;

  return (
    <div ref={containerRef} className="relative w-full h-[500px] md:h-[600px]">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 cursor-pointer" 
        onClick={handleCanvasClick}
      />

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredSkill && !selectedSkill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute pointer-events-none z-10"
            style={{
              left: hoveredSkill.x,
              top: hoveredSkill.y - 60,
              transform: "translateX(-50%)",
            }}
          >
            <GlassCard className="px-4 py-3 flex items-center gap-3">
              {HoveredSkillIcon && (
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    background: `hsla(${CATEGORY_COLORS[hoveredSkill.category]}, 0.2)`,
                    color: `hsl(${CATEGORY_COLORS[hoveredSkill.category]})`
                  }}
                >
                  <HoveredSkillIcon className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="text-white font-medium text-sm">{hoveredSkill.name}</p>
                <p className="text-white/50 text-xs">{hoveredSkill.category}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected skill detail panel */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-20"
            style={{
              left: Math.min(Math.max(selectedSkill.x, 120), dimensions.width - 120),
              top: Math.min(Math.max(selectedSkill.y - 80, 20), dimensions.height - 150),
              transform: "translateX(-50%)",
            }}
          >
            <GlassCard className="p-4 min-w-[200px] border-aurora-teal/20 shadow-[0_0_40px_hsl(168_84%_49%/0.15)]">
              <button
                onClick={() => setSelectedSkill(null)}
                className="absolute top-2 right-2 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
              
              <div className="flex items-center gap-3 mb-3">
                {SelectedSkillIcon && (
                  <div 
                    className="p-3 rounded-xl"
                    style={{ 
                      background: `hsla(${CATEGORY_COLORS[selectedSkill.skill.category]}, 0.2)`,
                      color: `hsl(${CATEGORY_COLORS[selectedSkill.skill.category]})`
                    }}
                  >
                    <SelectedSkillIcon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h4 className="text-white font-semibold">{selectedSkill.skill.name}</h4>
                  <div className="flex items-center gap-1.5 text-white/50 text-xs">
                    {SelectedCategoryIcon && <SelectedCategoryIcon className="w-3 h-3" />}
                    <span>{selectedSkill.skill.category}</span>
                  </div>
                </div>
              </div>

              {/* Skill level indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Proficiency</span>
                  <span 
                    className="font-medium"
                    style={{ color: `hsl(${CATEGORY_COLORS[selectedSkill.skill.category]})` }}
                  >
                    {Math.round(selectedSkill.skill.brightness * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedSkill.skill.brightness * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ 
                      background: `linear-gradient(90deg, hsl(${CATEGORY_COLORS[selectedSkill.skill.category]}), hsl(${CATEGORY_COLORS[selectedSkill.skill.category]} / 0.5))`
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category legend with icons */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-4">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <div key={category} className="flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full">
              {Icon && <Icon className="w-3 h-3" style={{ color: `hsl(${color})` }} />}
              <span className="text-white/60 text-xs">{category}</span>
            </div>
          );
        })}
      </div>

      {/* Click hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/30 text-xs">
        Click on a star to see details
      </div>
    </div>
  );
};

export default SkillsConstellation;
