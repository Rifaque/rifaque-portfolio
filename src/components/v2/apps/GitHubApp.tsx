import { useState } from "react";
import { FiGithub, FiExternalLink, FiGitBranch, FiActivity, FiCode } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";
import { useTheme } from "next-themes";

const GITHUB_USERNAME = "Rifaque";

const featuredRepos = [
    { name: "querycraft", description: "Natural Language to SQL system using locally hosted LLMs", language: "Python" },
    { name: "HubZero-Next", description: "Official Hub Zero website built with Next.js & GSAP", language: "TypeScript" },
    { name: "ZeroLink", description: "Real-time chat application with MERN stack & WebSocket", language: "TypeScript" },
    { name: "Bhatkal-Time-Luxe", description: "Luxury eCommerce platform with optimized image delivery", language: "JavaScript" },
];

const langColors: Record<string, string> = {
    Python: "#3572A5",
    TypeScript: "#3178C6",
    JavaScript: "#F7DF1E",
    Java: "#B07219",
};

const GitHubApp = () => {
    const [statsError, setStatsError] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const titleColor = isDark ? "ffffff" : "1e293b";
    const textColor = isDark ? "9ca3af" : "64748b";

    return (
        <div className="p-5 space-y-4">
            {/* Stats */}
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05]">
                {!statsError ? (
                    <img
                        src={`https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&theme=transparent&hide_border=true&title_color=${titleColor}&text_color=${textColor}&icon_color=14b8a6&bg_color=00000000&hide_rank=true&cache_seconds=86400`}
                        alt="GitHub Stats"
                        className="w-full max-w-sm mx-auto"
                        loading="lazy"
                        onError={() => setStatsError(true)}
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 rounded bg-black/[0.02] dark:bg-white/[0.03]">
                            <FiGithub className="text-aurora-teal" />
                            <div>
                                <p className="text-foreground font-bold">15</p>
                                <p className="text-foreground/40 text-xs">Repos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded bg-black/[0.02] dark:bg-white/[0.03]">
                            <FiGitBranch className="text-aurora-purple" />
                            <div>
                                <p className="text-foreground font-bold">200+</p>
                                <p className="text-foreground/40 text-xs">Commits</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Contribution Graph */}
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] overflow-x-auto scrollbar-hide">
                <h4 className="text-xs font-medium text-foreground/60 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal animate-pulse" />
                    Contributions
                </h4>
                <img
                    src={`https://ghchart.rshah.org/14b8a6/${GITHUB_USERNAME}`}
                    alt="Contribution Graph"
                    className="w-full min-w-[500px] h-auto opacity-80"
                    loading="lazy"
                />
            </div>

            {/* Repos */}
            <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground/60 flex items-center gap-1.5">
                    <FiGitBranch className="text-aurora-purple" /> Repositories
                </h4>
                {featuredRepos.map((repo) => (
                    <a
                        key={repo.name}
                        href={`${personalInfo.socials.github}/${repo.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start justify-between p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] hover:border-aurora-teal/20 transition-all group"
                    >
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-aurora-teal transition-colors truncate">{repo.name}</p>
                            <p className="text-foreground/40 text-xs mt-0.5 line-clamp-1">{repo.description}</p>
                            <span className="flex items-center gap-1.5 mt-1.5 text-xs text-foreground/40">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColors[repo.language] || "#888" }} />
                                {repo.language}
                            </span>
                        </div>
                        <FiExternalLink className="w-3.5 h-3.5 text-foreground/20 group-hover:text-aurora-teal transition-colors mt-1 shrink-0 ml-2" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default GitHubApp;
