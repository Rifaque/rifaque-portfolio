import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

export interface PortfolioSettings {
    auroraTheme: "default" | "sunset" | "ocean" | "monochrome";
    dockMagnification: boolean;
    dockAutoHide: boolean;
    showDotGrid: boolean;
}

const DEFAULT_SETTINGS: PortfolioSettings = {
    auroraTheme: "default",
    dockMagnification: true,
    dockAutoHide: false,
    showDotGrid: true,
};

const STORAGE_KEY = "v2-settings";

function loadSettings(): PortfolioSettings {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        // ignore
    }
    return DEFAULT_SETTINGS;
}

function saveSettings(settings: PortfolioSettings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // ignore
    }
}

// ═══════════════════════════════════════
// Aurora theme color definitions
// ═══════════════════════════════════════

export const AURORA_THEMES: Record<PortfolioSettings["auroraTheme"], { name: string; colors: string[]; description: string }> = {
    default: {
        name: "Aurora Borealis",
        colors: ["#2dd4bf", "#a855f7", "#6366f1"],
        description: "Teal, purple, indigo",
    },
    sunset: {
        name: "Sunset",
        colors: ["#f97316", "#ef4444", "#ec4899"],
        description: "Orange, red, pink",
    },
    ocean: {
        name: "Deep Ocean",
        colors: ["#06b6d4", "#3b82f6", "#8b5cf6"],
        description: "Cyan, blue, violet",
    },
    monochrome: {
        name: "Monochrome",
        colors: ["#525252", "#737373", "#a3a3a3"],
        description: "Grayscale",
    },
};

// ═══════════════════════════════════════
// Context
// ═══════════════════════════════════════

interface SettingsContextType {
    settings: PortfolioSettings;
    updateSetting: <K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<PortfolioSettings>(loadSettings);

    const updateSetting = useCallback(<K extends keyof PortfolioSettings>(key: K, value: PortfolioSettings[K]) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value };
            saveSettings(next);
            return next;
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
    return ctx;
}
