import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowManager, APP_DEFINITIONS } from "./WindowManagerContext";
import { useSettings } from "./SettingsContext";
import { personalInfo } from "@/data/portfolio";
import { CopyPlus, Github, Linkedin, Mail, Bell } from "lucide-react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface ContextMenuState {
    x: number;
    y: number;
    isOpen: boolean;
}

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    { id: 1, title: "Welcome!", message: "Welcome to Rifaque's Desktop. Try Ctrl+K for search.", time: "Just now", read: false },
    { id: 2, title: "Tip", message: "Double-click desktop icons to open apps.", time: "1m ago", read: false },
    { id: 3, title: "Try Terminal", message: "Type 'help' in the terminal for available commands.", time: "2m ago", read: false },
    { id: 4, title: "Settings", message: "Customize your theme and dock in the Settings app.", time: "3m ago", read: true },
    { id: 5, title: "Alt+J", message: "Switch between windows with Alt+J.", time: "5m ago", read: true },
];

const ContextMenu = ({ state, onClose }: { state: ContextMenuState; onClose: () => void }) => {
    const { openWindow } = useWindowManager();

    const menuItems = [
        {
            label: "Open All Windows",
            icon: <CopyPlus size={16} />,
            action: () => {
                Object.values(APP_DEFINITIONS).forEach((app) => openWindow(app));
            },
        },
        { type: "separator" as const },
        {
            label: "GitHub",
            icon: <Github size={16} />,
            action: () => window.open(personalInfo.socials.github, "_blank"),
        },
        {
            label: "LinkedIn",
            icon: <Linkedin size={16} />,
            action: () => window.open(personalInfo.socials.linkedin, "_blank"),
        },
        {
            label: "Email",
            icon: <Mail size={16} />,
            action: () => window.open(`mailto:${personalInfo.email}`, "_blank"),
        },
    ];

    return (
        <AnimatePresence>
            {state.isOpen && (
                <>
                    <div className="fixed inset-0 z-[2000]" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                            "fixed z-[2001] min-w-[200px] py-1.5",
                            "bg-white/[0.08] backdrop-blur-2xl",
                            "border border-white/[0.1] rounded-xl",
                            "shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
                        )}
                        style={{
                            left: Math.min(state.x, window.innerWidth - 220),
                            top: Math.min(state.y, window.innerHeight - 250),
                        }}
                    >
                        {menuItems.map((item, idx) => {
                            if ("type" in item && item.type === "separator") {
                                return <div key={idx} className="h-px bg-white/10 my-1 mx-3" />;
                            }
                            if (!("action" in item)) return null;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => { item.action(); onClose(); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ═══════════════════════════════════════
// Desktop Icons
// ═══════════════════════════════════════

const DESKTOP_SHORTCUTS = ["about", "projects", "skills", "terminal", "resume"] as const;

const DesktopIcons = () => {
    const { openWindow } = useWindowManager();
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div
            className="absolute top-14 left-4 z-[3] flex flex-col gap-2"
            onClick={(e) => {
                if ((e.target as HTMLElement).closest("[data-desktop-icon]")) return;
                setSelected(null);
            }}
        >
            {DESKTOP_SHORTCUTS.map((appId, i) => {
                const app = APP_DEFINITIONS[appId];
                const isSelected = selected === appId;
                return (
                    <motion.button
                        key={appId}
                        data-desktop-icon
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelected(appId);
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            openWindow(app);
                        }}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg w-[72px] transition-all duration-150",
                            isSelected
                                ? "bg-white/[0.12] ring-1 ring-white/20"
                                : "hover:bg-white/[0.06]"
                        )}
                    >
                        <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                            {app.icon}
                        </div>
                        <span className="text-[10px] text-white/70 leading-tight text-center truncate w-full">
                            {app.title}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
};

// ═══════════════════════════════════════
// Desktop
// ═══════════════════════════════════════

const Desktop = ({ children }: { children: React.ReactNode }) => {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, isOpen: false });
    const [time, setTime] = useState(new Date());
    const { settings } = useSettings();
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
    const [notifOpen, setNotifOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, isOpen: true });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    return (
        <div
            className="fixed inset-0 overflow-hidden bg-background select-none"
            onContextMenu={handleContextMenu}
            onClick={() => { closeContextMenu(); setNotifOpen(false); }}
        >
            {/* Top Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute top-4 left-0 right-0 flex items-center justify-between px-6 z-[5] pointer-events-none"
            >
                <div className="pointer-events-auto">
                    <p className="text-white/40 text-sm font-medium">{personalInfo.name}</p>
                </div>
                <div className="pointer-events-auto flex items-center gap-4">
                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setNotifOpen((v) => !v); if (!notifOpen) markAllRead(); }}
                            className="relative text-white/40 hover:text-white/70 transition-colors"
                        >
                            <Bell size={16} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Panel */}
                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        "absolute top-8 right-0 w-[300px]",
                                        "bg-white/[0.06] backdrop-blur-2xl",
                                        "border border-white/[0.1] rounded-xl",
                                        "shadow-[0_10px_40px_rgba(0,0,0,0.4)]",
                                        "overflow-hidden"
                                    )}
                                >
                                    <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                                        <p className="text-xs font-medium text-white/60">Notifications</p>
                                        <button
                                            onClick={markAllRead}
                                            className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-[280px] overflow-auto">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={cn(
                                                    "px-3 py-2.5 border-b border-white/[0.04] last:border-b-0",
                                                    !n.read && "bg-white/[0.03]"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className="text-xs font-medium text-white/70">{n.title}</p>
                                                    <span className="text-[9px] text-white/20">{n.time}</span>
                                                </div>
                                                <p className="text-[11px] text-white/40 leading-relaxed">{n.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Clock */}
                    <div className="text-right">
                        <p className="text-white/80 text-sm font-medium tabular-nums">{formatTime(time)}</p>
                        <p className="text-white/40 text-xs">{formatDate(time)}</p>
                    </div>
                </div>
            </motion.div>

            {/* Dot Grid Background */}
            {settings.showDotGrid && (
                <div
                    className="absolute inset-0 z-[1] pointer-events-none opacity-[0.15]"
                    style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />
            )}

            {/* Desktop Icons */}
            <DesktopIcons />

            {children}
            <ContextMenu state={contextMenu} onClose={closeContextMenu} />
        </div>
    );
};

export default Desktop;

