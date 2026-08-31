import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { User, Folder, Briefcase, Zap, Github, Mail, TerminalSquare, FileText, StickyNote, Settings, Calculator, FolderOpen, Music, Globe } from "lucide-react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface WindowState {
    id: string;
    title: string;
    icon: ReactNode;
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    isMinimized: boolean;
    isMaximized: boolean;
    snapPosition?: "left" | "right";
    zIndex: number;
}

export interface AppDefinition {
    id: string;
    title: string;
    icon: ReactNode;
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
}

interface WindowManagerState {
    windows: WindowState[];
    nextZIndex: number;
}

type WindowAction =
    | { type: "OPEN_WINDOW"; app: AppDefinition }
    | { type: "CLOSE_WINDOW"; id: string }
    | { type: "FOCUS_WINDOW"; id: string }
    | { type: "MINIMIZE_WINDOW"; id: string }
    | { type: "MAXIMIZE_WINDOW"; id: string }
    | { type: "RESTORE_WINDOW"; id: string }
    | { type: "SNAP_WINDOW"; id: string; position: "left" | "right" }
    | { type: "UPDATE_POSITION"; id: string; x: number; y: number }
    | { type: "UPDATE_SIZE"; id: string; width: number; height: number };

interface WindowManagerContextType {
    windows: WindowState[];
    openWindow: (app: AppDefinition) => void;
    closeWindow: (id: string) => void;
    focusWindow: (id: string) => void;
    minimizeWindow: (id: string) => void;
    maximizeWindow: (id: string) => void;
    restoreWindow: (id: string) => void;
    snapWindow: (id: string, position: "left" | "right") => void;
    updatePosition: (id: string, x: number, y: number) => void;
    updateSize: (id: string, width: number, height: number) => void;
    isOpen: (id: string) => boolean;
    getTopWindow: () => WindowState | undefined;
}

// ═══════════════════════════════════════
// App Definitions
// ═══════════════════════════════════════

export const APP_DEFINITIONS: Record<string, AppDefinition> = {
    about: { id: "about", title: "About Me", icon: <User size={20} className="text-blue-400" />, defaultWidth: 600, defaultHeight: 500, minWidth: 400, minHeight: 300 },
    projects: { id: "projects", title: "Projects", icon: <Folder size={20} className="text-yellow-400" />, defaultWidth: 800, defaultHeight: 600, minWidth: 500, minHeight: 400 },
    experience: { id: "experience", title: "Experience", icon: <Briefcase size={20} className="text-orange-400" />, defaultWidth: 650, defaultHeight: 520, minWidth: 400, minHeight: 350 },
    skills: { id: "skills", title: "Skills", icon: <Zap size={20} className="text-green-400" />, defaultWidth: 700, defaultHeight: 500, minWidth: 450, minHeight: 350 },
    github: { id: "github", title: "GitHub", icon: <Github size={20} className="text-purple-400" />, defaultWidth: 750, defaultHeight: 550, minWidth: 500, minHeight: 400 },
    contact: { id: "contact", title: "Contact", icon: <Mail size={20} className="text-red-400" />, defaultWidth: 550, defaultHeight: 480, minWidth: 380, minHeight: 350 },
    terminal: { id: "terminal", title: "Terminal", icon: <TerminalSquare size={20} className="text-gray-400" />, defaultWidth: 700, defaultHeight: 450, minWidth: 400, minHeight: 300 },
    resume: { id: "resume", title: "Resume", icon: <FileText size={20} className="text-indigo-400" />, defaultWidth: 500, defaultHeight: 400, minWidth: 350, minHeight: 300 },
    notepad: { id: "notepad", title: "Notepad", icon: <StickyNote size={20} className="text-lime-400" />, defaultWidth: 550, defaultHeight: 450, minWidth: 350, minHeight: 300 },
    settings: { id: "settings", title: "Settings", icon: <Settings size={20} className="text-neutral-400" />, defaultWidth: 500, defaultHeight: 520, minWidth: 400, minHeight: 400 },
    calculator: { id: "calculator", title: "Calculator", icon: <Calculator size={20} className="text-amber-400" />, defaultWidth: 320, defaultHeight: 460, minWidth: 280, minHeight: 400 },
    filemanager: { id: "filemanager", title: "Files", icon: <FolderOpen size={20} className="text-sky-400" />, defaultWidth: 650, defaultHeight: 450, minWidth: 450, minHeight: 350 },
    music: { id: "music", title: "Music", icon: <Music size={20} className="text-pink-400" />, defaultWidth: 340, defaultHeight: 540, minWidth: 280, minHeight: 450 },
    browser: {
        id: "browser",
        title: "Browser",
        icon: <Globe size={24} className="text-blue-400" />,
        defaultWidth: 900,
        defaultHeight: 650,
        minWidth: 400,
        minHeight: 300,
    },
};

// ═══════════════════════════════════════
// Reducer
// ═══════════════════════════════════════

function getSpawnPosition(windowCount: number): { x: number; y: number } {
    const baseX = 80;
    const baseY = 60;
    const offset = windowCount * 30;
    return {
        x: baseX + (offset % 300),
        y: baseY + (offset % 200),
    };
}

function windowReducer(state: WindowManagerState, action: WindowAction): WindowManagerState {
    switch (action.type) {
        case "OPEN_WINDOW": {
            // If already open, just focus it
            const existing = state.windows.find((w) => w.id === action.app.id);
            if (existing) {
                if (existing.isMinimized) {
                    return windowReducer(
                        { ...state, windows: state.windows.map((w) => w.id === action.app.id ? { ...w, isMinimized: false } : w) },
                        { type: "FOCUS_WINDOW", id: action.app.id }
                    );
                }
                return windowReducer(state, { type: "FOCUS_WINDOW", id: action.app.id });
            }

            const pos = getSpawnPosition(state.windows.length);

            // Clamp position so window doesn't overflow the viewport
            const maxX = Math.max(0, window.innerWidth - action.app.defaultWidth - 20);
            const maxY = Math.max(0, window.innerHeight - action.app.defaultHeight - 100);

            const newWindow: WindowState = {
                id: action.app.id,
                title: action.app.title,
                icon: action.app.icon,
                x: Math.min(pos.x, maxX),
                y: Math.min(pos.y, maxY),
                width: Math.min(action.app.defaultWidth, window.innerWidth - 40),
                height: Math.min(action.app.defaultHeight, window.innerHeight - 120),
                minWidth: action.app.minWidth,
                minHeight: action.app.minHeight,
                isMinimized: false,
                isMaximized: false,
                zIndex: state.nextZIndex,
            };

            return {
                windows: [...state.windows, newWindow],
                nextZIndex: state.nextZIndex + 1,
            };
        }

        case "CLOSE_WINDOW":
            return {
                ...state,
                windows: state.windows.filter((w) => w.id !== action.id),
            };

        case "FOCUS_WINDOW":
            return {
                windows: state.windows.map((w) =>
                    w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
                ),
                nextZIndex: state.nextZIndex + 1,
            };

        case "MINIMIZE_WINDOW":
            return {
                ...state,
                windows: state.windows.map((w) =>
                    w.id === action.id ? { ...w, isMinimized: true } : w
                ),
            };

        case "MAXIMIZE_WINDOW":
            return {
                ...state,
                windows: state.windows.map((w) =>
                    w.id === action.id
                        ? { ...w, isMaximized: true, zIndex: state.nextZIndex }
                        : w
                ),
                nextZIndex: state.nextZIndex + 1,
            };

        case "RESTORE_WINDOW":
            return {
                ...state,
                windows: state.windows.map((w) =>
                    w.id === action.id ? { ...w, isMaximized: false, isMinimized: false, snapPosition: undefined } : w
                ),
            };

        case "SNAP_WINDOW":
            return {
                ...state,
                windows: state.windows.map((w) =>
                    w.id === action.id
                        ? { ...w, isMaximized: false, snapPosition: action.position, zIndex: state.nextZIndex }
                        : w
                ),
                nextZIndex: state.nextZIndex + 1,
            };

        case "UPDATE_POSITION":
            return {
                ...state,
                windows: state.windows.map((w) =>
                    w.id === action.id ? { ...w, x: action.x, y: action.y, isMaximized: false, snapPosition: undefined } : w
                ),
            };

        case "UPDATE_SIZE":
            return {
                ...state,
                windows: state.windows.map((w) =>
                    w.id === action.id
                        ? {
                            ...w,
                            width: Math.max(w.minWidth, action.width),
                            height: Math.max(w.minHeight, action.height),
                        }
                        : w
                ),
            };

        default:
            return state;
    }
}

// ═══════════════════════════════════════
// Context
// ═══════════════════════════════════════

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(windowReducer, {
        windows: [],
        nextZIndex: 10,
    });

    const openWindow = useCallback((app: AppDefinition) => dispatch({ type: "OPEN_WINDOW", app }), []);
    const closeWindow = useCallback((id: string) => dispatch({ type: "CLOSE_WINDOW", id }), []);
    const focusWindow = useCallback((id: string) => dispatch({ type: "FOCUS_WINDOW", id }), []);
    const minimizeWindow = useCallback((id: string) => dispatch({ type: "MINIMIZE_WINDOW", id }), []);
    const maximizeWindow = useCallback((id: string) => dispatch({ type: "MAXIMIZE_WINDOW", id }), []);
    const restoreWindow = useCallback((id: string) => dispatch({ type: "RESTORE_WINDOW", id }), []);
    const snapWindow = useCallback((id: string, position: "left" | "right") => dispatch({ type: "SNAP_WINDOW", id, position }), []);
    const updatePosition = useCallback((id: string, x: number, y: number) => dispatch({ type: "UPDATE_POSITION", id, x, y }), []);
    const updateSize = useCallback((id: string, width: number, height: number) => dispatch({ type: "UPDATE_SIZE", id, width, height }), []);
    const isOpen = useCallback((id: string) => state.windows.some((w) => w.id === id), [state.windows]);
    const getTopWindow = useCallback(() => {
        const visible = state.windows.filter((w) => !w.isMinimized);
        return visible.reduce<WindowState | undefined>((top, w) => (!top || w.zIndex > top.zIndex ? w : top), undefined);
    }, [state.windows]);

    return (
        <WindowManagerContext.Provider
            value={{
                windows: state.windows,
                openWindow, closeWindow, focusWindow,
                minimizeWindow, maximizeWindow, restoreWindow, snapWindow,
                updatePosition, updateSize, isOpen, getTopWindow,
            }}
        >
            {children}
        </WindowManagerContext.Provider>
    );
}

export function useWindowManager() {
    const ctx = useContext(WindowManagerContext);
    if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider");
    return ctx;
}
