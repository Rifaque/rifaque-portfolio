import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useWindowManager, APP_DEFINITIONS } from "./WindowManagerContext";

const QUICK_LINKS = [
    { label: "GitHub", url: "https://github.com/Rifaque" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/rifaque" },
];

const SpotlightSearch = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { openWindow } = useWindowManager();

    // Listen for Ctrl+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    useEffect(() => {
        if (open) {
            setQuery("");
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const results = useMemo(() => {
        const q = query.toLowerCase().trim();
        const apps = Object.values(APP_DEFINITIONS)
            .filter((app) => app.title.toLowerCase().includes(q) || app.id.includes(q))
            .map((app) => ({ type: "app" as const, id: app.id, label: app.title, icon: app.icon }));

        const links = QUICK_LINKS
            .filter((l) => l.label.toLowerCase().includes(q))
            .map((l) => ({ type: "link" as const, id: l.url, label: l.label, url: l.url }));

        return [...apps, ...links];
    }, [query]);

    const handleSelect = useCallback(
        (idx: number) => {
            const item = results[idx];
            if (!item) return;
            if (item.type === "app") {
                openWindow(APP_DEFINITIONS[item.id]);
            } else if ("url" in item) {
                window.open(item.url, "_blank");
            }
            setOpen(false);
        },
        [results, openWindow]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIdx((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            handleSelect(selectedIdx);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, scale: 0.95, x: "-50%" }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "fixed top-[20%] left-1/2 z-[3001]",
                            "w-[480px] max-w-[90vw]",
                            "bg-white/[0.06] backdrop-blur-2xl",
                            "border border-white/[0.12] rounded-2xl",
                            "shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
                            "overflow-hidden"
                        )}
                    >
                        {/* Search Input */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                            <Search size={16} className="text-white/30 shrink-0" />
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setSelectedIdx(0); }}
                                onKeyDown={handleKeyDown}
                                placeholder="Search apps, links..."
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                            />
                            <kbd className="text-[10px] text-white/20 border border-white/10 px-1.5 py-0.5 rounded">ESC</kbd>
                        </div>

                        {/* Results */}
                        <div className="max-h-[300px] overflow-auto py-1">
                            {results.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-white/20 text-center">No results</p>
                            ) : (
                                results.map((item, i) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelect(i)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                            i === selectedIdx
                                                ? "bg-white/[0.08] text-white"
                                                : "text-white/50 hover:bg-white/[0.04]"
                                        )}
                                    >
                                        {"icon" in item && <span className="shrink-0">{item.icon}</span>}
                                        <span className="truncate">{item.label}</span>
                                        <span className="ml-auto text-[10px] text-white/20">
                                            {item.type === "app" ? "App" : "Link"}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SpotlightSearch;
