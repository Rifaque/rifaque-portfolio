import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowManager, APP_DEFINITIONS } from "./WindowManagerContext";

const AltTabSwitcher = () => {
    const [open, setOpen] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const { windows, focusWindow, restoreWindow } = useWindowManager();

    const openWindows = windows.filter((w) => !w.isMinimized);

    useEffect(() => {
        let tabCount = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === "j") {
                e.preventDefault();
                if (!open && openWindows.length > 1) {
                    setOpen(true);
                    setSelectedIdx(0);
                    tabCount = 0;
                }
                tabCount++;
                setSelectedIdx(tabCount % openWindows.length);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt" && open) {
                // Select the window
                const win = openWindows[selectedIdx];
                if (win) {
                    if (win.isMinimized) {
                        restoreWindow(win.id);
                    }
                    focusWindow(win.id);
                }
                setOpen(false);
                tabCount = 0;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [open, openWindows, selectedIdx, focusWindow, restoreWindow]);

    if (openWindows.length <= 1) return null;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[4000] bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                            "fixed top-1/2 left-1/2 z-[4001]",
                            "flex gap-4 p-6",
                            "bg-white/[0.05] backdrop-blur-2xl",
                            "border border-white/[0.1] rounded-2xl",
                            "shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        )}
                    >
                        {openWindows.map((win, i) => {
                            const app = APP_DEFINITIONS[win.id];
                            return (
                                <div
                                    key={win.id}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer w-[100px]",
                                        i === selectedIdx
                                            ? "bg-white/[0.12] ring-2 ring-white/20"
                                            : "hover:bg-white/[0.06]"
                                    )}
                                    onClick={() => {
                                        focusWindow(win.id);
                                        setOpen(false);
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                                        {app?.icon}
                                    </div>
                                    <span className="text-[10px] text-white/60 truncate w-full text-center">
                                        {app?.title || win.id}
                                    </span>
                                </div>
                            );
                        })}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AltTabSwitcher;
