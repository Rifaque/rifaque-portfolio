import { cn } from "@/lib/utils";
import { useSettings, AURORA_THEMES, type PortfolioSettings } from "../SettingsContext";
import { Settings, Palette, Monitor } from "lucide-react";

const THEME_KEYS = Object.keys(AURORA_THEMES) as PortfolioSettings["auroraTheme"][];

const SettingsApp = () => {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Settings size={20} className="text-white/40" />
                <h2 className="text-lg font-semibold text-white/90">Settings</h2>
            </div>

            {/* Appearance */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Palette size={14} />
                    <span>Appearance</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {THEME_KEYS.map((key) => {
                        const theme = AURORA_THEMES[key];
                        const isActive = settings.auroraTheme === key;
                        return (
                            <button
                                key={key}
                                onClick={() => updateSetting("auroraTheme", key)}
                                className={cn(
                                    "p-3 rounded-xl border text-left transition-all",
                                    isActive
                                        ? "border-white/30 bg-white/[0.08]"
                                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]"
                                )}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {theme.colors.map((c, i) => (
                                        <div
                                            key={i}
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-white/80">{theme.name}</p>
                                <p className="text-[10px] text-white/30">{theme.description}</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Dock */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Monitor size={14} />
                    <span>Dock</span>
                </div>

                <div className="space-y-3">
                    <ToggleRow
                        label="Magnification"
                        description="Icons grow when hovered"
                        checked={settings.dockMagnification}
                        onChange={(v) => updateSetting("dockMagnification", v)}
                    />
                    <ToggleRow
                        label="Auto-hide"
                        description="Dock hides when not hovered"
                        checked={settings.dockAutoHide}
                        onChange={(v) => updateSetting("dockAutoHide", v)}
                    />
                </div>
            </section>

            {/* Desktop */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                    <Palette size={14} />
                    <span>Desktop</span>
                </div>

                <div className="space-y-3">
                    <ToggleRow
                        label="Dot Grid"
                        description="Show dot pattern on desktop background"
                        checked={settings.showDotGrid}
                        onChange={(v) => updateSetting("showDotGrid", v)}
                    />
                </div>
            </section>
        </div>
    );
};

// ═══════════════════════════════════════
// Toggle Row
// ═══════════════════════════════════════

const ToggleRow = ({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
        <div>
            <p className="text-sm text-white/80">{label}</p>
            <p className="text-[10px] text-white/30">{description}</p>
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "w-10 h-5 rounded-full transition-colors relative",
                checked ? "bg-aurora-teal/60" : "bg-white/10"
            )}
        >
            <div
                className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                    checked ? "translate-x-5" : "translate-x-0.5"
                )}
            />
        </button>
    </div>
);

export default SettingsApp;
