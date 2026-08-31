import { FiDownload, FiExternalLink } from "react-icons/fi";
import { personalInfo } from "@/data/portfolio";

const ResumeApp = () => {
    return (
        <div className="p-6 flex flex-col items-center justify-center h-full gap-6">
            {/* Icon */}
            <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-aurora-teal/10 to-aurora-purple/10 border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center">
                <span className="text-5xl">📄</span>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-foreground">{personalInfo.name}</h2>
                <p className="text-foreground/50 text-sm">Resume / CV</p>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <a
                    href={personalInfo.resume}
                    download
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-aurora-teal/20 to-aurora-purple/20 border border-aurora-teal/20 text-foreground hover:border-aurora-teal/40 hover:shadow-[0_0_20px_hsl(168_84%_49%/0.2)] transition-all"
                >
                    <FiDownload className="w-4 h-4" /> Download Resume
                </a>
                {personalInfo.resume && (
                    <a
                        href={personalInfo.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] text-foreground/70 hover:text-foreground hover:border-aurora-teal/30 transition-all"
                    >
                        <FiExternalLink className="w-4 h-4" /> Open in New Tab
                    </a>
                )}
            </div>
        </div>
    );
};

export default ResumeApp;
