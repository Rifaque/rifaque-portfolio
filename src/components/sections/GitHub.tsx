import { useState } from "react";
import { motion } from "framer-motion";
import { FiGithub, FiStar, FiGitBranch, FiExternalLink, FiCode, FiActivity } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";
import GlassText from "@/components/GlassText";
import GlassCard from "@/components/GlassCard";
import { useTheme } from "next-themes";

const GITHUB_USERNAME = "Rifaque";

// Featured repos to display
const featuredRepos = [
  {
    name: "querycraft",
    description: "Natural Language to SQL system using locally hosted LLMs",
    language: "Python",
    stars: 0,
    forks: 0,
  },
  {
    name: "HubZero-Next",
    description: "Official Hub Zero website built with Next.js & GSAP",
    language: "TypeScript",
    stars: 0,
    forks: 0,
  },
  {
    name: "ZeroLink",
    description: "Real-time chat application with MERN stack & WebSocket",
    language: "TypeScript",
    stars: 0,
    forks: 0,
  },
  {
    name: "Bhatkal-Time-Luxe",
    description: "Luxury eCommerce platform with optimized image delivery",
    language: "JavaScript",
    stars: 0,
    forks: 0,
  },
];

const languageColors: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Java: "#B07219",
  HTML: "#E34C26",
  CSS: "#1572B6",
};

// Static stats for fallback
const staticStats = {
  publicRepos: 15,
  totalCommits: "200+",
  languages: ["Python", "TypeScript", "JavaScript", "Java", "HTML/CSS"],
};

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="flex items-center gap-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.05] dark:border-white/[0.05]">
    <Icon className="w-5 h-5 text-aurora-teal" />
    <div>
      <p className="text-foreground font-semibold">{value}</p>
      <p className="text-foreground/40 text-xs">{label}</p>
    </div>
  </div>
);

const GitHub = () => {
  const [statsError, setStatsError] = useState(false);
  const [langsError, setLangsError] = useState(false);
  const { theme } = useTheme();

  // Theme-aware GitHub stats colors
  const isDark = theme === "dark";
  const titleColor = isDark ? "ffffff" : "1e293b";
  const textColor = isDark ? "9ca3af" : "64748b";
  const bgColor = "00000000";

  return (
    <section id="github" className="py-16 sm:py-24 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <FiGithub className="w-6 h-6 sm:w-8 sm:h-8 text-foreground/60" />
            <GlassText as="h2" className="text-2xl sm:text-3xl md:text-4xl font-bold">
              GitHub Activity
            </GlassText>
          </div>
          <p className="text-foreground/50 max-w-2xl mx-auto text-sm sm:text-base px-2">
            My open source contributions and coding activity
          </p>
        </motion.div>

        {/* GitHub Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10"
        >
          {/* Stats Card */}
          <GlassCard className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px]">
            {!statsError ? (
              <div className="relative w-full flex justify-center">
                <img
                  src={`https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=transparent&hide_border=true&title_color=${titleColor}&text_color=${textColor}&icon_color=14b8a6&bg_color=${bgColor}&hide_rank=true&cache_seconds=86400`}
                  alt="GitHub Stats"
                  className="w-full max-w-md rounded-xl"
                  loading="lazy"
                  onError={() => setStatsError(true)}
                />
              </div>
            ) : (
              <div className="w-full">
                <h4 className="text-foreground font-medium mb-4 flex items-center gap-2">
                  <FiActivity className="text-aurora-teal" />
                  GitHub Stats
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={FiGithub} label="Public Repos" value={staticStats.publicRepos} />
                  <StatCard icon={FiGitBranch} label="Commits" value={staticStats.totalCommits} />
                </div>
              </div>
            )}
          </GlassCard>

          {/* Top Languages */}
          <GlassCard className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[160px] sm:min-h-[180px]">
            {!langsError ? (
              <div className="relative w-full flex justify-center">
                <img
                  src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&theme=transparent&hide_border=true&title_color=${titleColor}&text_color=${textColor}&bg_color=${bgColor}&langs_count=8&cache_seconds=86400`}
                  alt="Top Languages"
                  className="w-full max-w-md rounded-xl"
                  loading="lazy"
                  onError={() => setLangsError(true)}
                />
              </div>
            ) : (
              <div className="w-full">
                <h4 className="text-foreground font-medium mb-4 flex items-center gap-2">
                  <FiCode className="text-aurora-purple" />
                  Top Languages
                </h4>
                <div className="flex flex-wrap gap-2">
                  {staticStats.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] rounded-full text-sm text-foreground/70 flex items-center gap-2"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: languageColors[lang] || "#888" }}
                      />
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Contribution Graph */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 sm:mb-12"
        >
          <GlassCard className="p-4 sm:p-6 overflow-hidden">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-aurora-teal animate-pulse" />
              Contribution Graph
            </h3>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide">
              <img
                src={`https://ghchart.rshah.org/14b8a6/${GITHUB_USERNAME}`}
                alt="GitHub Contribution Graph"
                className="w-full min-w-[600px] sm:min-w-[700px] h-auto rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </div>
            <p className="text-foreground/40 text-xs sm:text-sm mt-3 sm:mt-4 text-center">
              Contribution activity over the past year
            </p>
          </GlassCard>
        </motion.div>

        {/* Featured Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
            <FiGitBranch className="text-aurora-purple" />
            Featured Repositories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {featuredRepos.map((repo, index) => (
              <motion.a
                key={repo.name}
                href={`${personalInfo.socials.github}/${repo.name}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="group"
              >
                <GlassCard className="p-4 sm:p-5 h-full transition-all duration-300 group-hover:border-aurora-teal/30 group-hover:shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiGithub className="w-5 h-5 text-foreground/60" />
                      <span className="font-medium text-foreground group-hover:text-aurora-teal transition-colors">
                        {repo.name}
                      </span>
                    </div>
                    <FiExternalLink className="w-4 h-4 text-foreground/30 group-hover:text-aurora-teal transition-colors" />
                  </div>
                  <p className="text-foreground/50 text-sm mb-4 line-clamp-2">
                    {repo.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: languageColors[repo.language] || "#888" }}
                      />
                      <span className="text-foreground/50">{repo.language}</span>
                    </span>
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-1 text-foreground/40">
                        <FiStar className="w-3.5 h-3.5" />
                        {repo.stars}
                      </span>
                    )}
                    {repo.forks > 0 && (
                      <span className="flex items-center gap-1 text-foreground/40">
                        <FiGitBranch className="w-3.5 h-3.5" />
                        {repo.forks}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* View Full Profile Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <a
            href={personalInfo.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] hover:border-aurora-teal/30 rounded-full text-foreground/70 hover:text-foreground transition-all duration-300 group"
          >
            <FiGithub className="w-5 h-5" />
            <span>View Full GitHub Profile</span>
            <FiExternalLink className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHub;
