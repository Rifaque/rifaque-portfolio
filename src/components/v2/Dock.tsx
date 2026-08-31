import { useRef, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowManager, APP_DEFINITIONS } from "./WindowManagerContext";
import { useSettings } from "./SettingsContext";

const DOCK_APPS = ["about", "projects", "experience", "skills", "github", "contact", "terminal", "resume", "notepad", "calculator", "filemanager", "music", "settings", "browser"] as const;

interface DockProps {
    appComponents?: Record<string, React.FC>;
}

const Dock = ({ appComponents }: DockProps) => {
    const { openWindow, windows, minimizeWindow } = useWindowManager();
    const { settings } = useSettings();
    const dockRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX] = useState<number | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dockRef.current) return;
        const rect = dockRef.current.getBoundingClientRect();
        setMouseX(e.clientX - rect.left);
    }, []);

    const handleMouseLeave = () => setMouseX(null);

    const handleDockClick = (appId: string) => {
        const win = windows.find((w) => w.id === appId);
        if (win && !win.isMinimized) {
            minimizeWindow(appId);
        } else {
            openWindow(APP_DEFINITIONS[appId]);
        }
    };

    return (
        <div
            className={cn(
                "fixed bottom-3 left-0 right-0 z-[1000] flex justify-center pointer-events-none transition-transform duration-300",
                settings.dockAutoHide && !isHovered && "-translate-y-0 opacity-30 hover:opacity-100"
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto"
            >
                <div
                    ref={dockRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                        "flex items-end gap-1 px-3 pb-2 pt-2",
                        "bg-white/[0.06] backdrop-blur-2xl",
                        "border border-white/[0.1] rounded-2xl",
                        "shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                    )}
                >
                    {DOCK_APPS.map((appId) => {
                        const app = APP_DEFINITIONS[appId];
                        const isOpen = windows.some((w) => w.id === appId);
                        const isMinimized = windows.find((w) => w.id === appId)?.isMinimized;

                        return (
                            <DockIcon
                                key={appId}
                                icon={app.icon}
                                label={app.title}
                                isOpen={isOpen}
                                isMinimized={isMinimized ?? false}
                                mouseX={settings.dockMagnification ? mouseX : null}
                                dockRef={dockRef}
                                onClick={() => handleDockClick(appId)}
                                previewContent={
                                    isOpen && !isMinimized && appComponents?.[appId]
                                        ? (() => {
                                            const Comp = appComponents[appId];
                                            return <Comp />;
                                        })()
                                        : undefined
                                }
                            />
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

// ═══════════════════════════════════════
// Dock Icon with magnification
// ═══════════════════════════════════════

interface DockIconProps {
    icon: React.ReactNode;
    label: string;
    isOpen: boolean;
    isMinimized: boolean;
    mouseX: number | null;
    dockRef: React.RefObject<HTMLDivElement>;
    onClick: () => void;
    previewContent?: ReactNode;
}

const DockIcon = ({ icon, label, isOpen, isMinimized, mouseX, dockRef, onClick, previewContent }: DockIconProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconRef = useRef<HTMLButtonElement>(null);

    // Calculate magnification based on distance from cursor
    let scale = 1;
    if (mouseX !== null && dockRef.current && iconRef.current) {
        const iconRect = iconRef.current.getBoundingClientRect();
        const dockRect = dockRef.current.getBoundingClientRect();
        const iconCenter = iconRect.left + iconRect.width / 2 - dockRect.left;
        const distance = Math.abs(mouseX - iconCenter);
        const maxDistance = 80;
        const maxScale = 1.4;
        if (distance < maxDistance) {
            scale = maxScale - ((maxScale - 1) * (distance / maxDistance));
        }
    }

    return (
        <div className="relative flex flex-col items-center">
            {/* Preview Thumbnail */}
            <AnimatePresence>
                {isHovered && previewContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "absolute -top-[160px] z-[1002]",
                            "w-[200px] h-[140px] rounded-lg overflow-hidden",
                            "bg-black/60 backdrop-blur-xl",
                            "border border-white/[0.15]",
                            "shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
                            "pointer-events-none"
                        )}
                    >
                        <div
                            style={{
                                width: 800,
                                height: 560,
                                transform: "scale(0.25)",
                                transformOrigin: "top left",
                            }}
                            className="overflow-hidden"
                        >
                            {previewContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && !previewContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: -4 }}
                        exit={{ opacity: 0, y: 5 }}
                        className={cn(
                            "absolute -top-9 px-3 py-1 whitespace-nowrap rounded-lg text-xs font-medium",
                            "bg-white/[0.1] backdrop-blur-xl",
                            "border border-white/[0.1]",
                            "text-white shadow-lg z-[1001]"
                        )}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                ref={iconRef}
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-lg",
                    "transition-colors duration-200",
                    "hover:bg-white/[0.08]",
                    isMinimized && "opacity-50"
                )}
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ transformOrigin: "bottom center" }}
            >
                {icon}
            </motion.button>

            {/* Active indicator */}
            <div className="h-1 flex items-center justify-center">
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1 h-1 rounded-full bg-white/50"
                    />
                )}
            </div>
        </div>
    );
};

export default Dock;
