import { useEffect, useState } from "react";
import { WindowManagerProvider, useWindowManager, APP_DEFINITIONS } from "@/components/v2/WindowManagerContext";
import Window from "@/components/v2/Window";
import Desktop from "@/components/v2/Desktop";
import Dock from "@/components/v2/Dock";
import AuroraBackground from "@/components/AuroraBackground";
import BootSequence from "@/components/v2/BootSequence";
import { SettingsProvider, useSettings } from "@/components/v2/SettingsContext";

// App content imports
import AboutApp from "@/components/v2/apps/AboutApp";
import ProjectsApp from "@/components/v2/apps/ProjectsApp";
import ExperienceApp from "@/components/v2/apps/ExperienceApp";
import SkillsApp from "@/components/v2/apps/SkillsApp";
import ContactApp from "@/components/v2/apps/ContactApp";
import TerminalApp from "@/components/v2/apps/TerminalApp";
import ResumeApp from "@/components/v2/apps/ResumeApp";
import NotepadApp from "@/components/v2/apps/NotepadApp";
import SettingsApp from "@/components/v2/apps/SettingsApp";
import FileManagerApp from "@/components/v2/apps/FileManagerApp";
import SpotlightSearch from "@/components/v2/SpotlightSearch";
import MobileFallback from "@/components/v2/MobileFallback";
import { useIsMobile } from "@/hooks/use-mobile";
import AltTabSwitcher from "@/components/v2/AltTabSwitcher";

// Map app IDs to their content components
const APP_COMPONENTS: Record<string, React.FC> = {
    about: AboutApp,
    projects: ProjectsApp,
    experience: ExperienceApp,
    skills: SkillsApp,
    contact: ContactApp,
    terminal: TerminalApp,
    resume: ResumeApp,
    notepad: NotepadApp,
    settings: SettingsApp,
    filemanager: FileManagerApp,
};

// Inner component that uses the window manager context
const DesktopEnvironment = () => {
    const { windows, openWindow } = useWindowManager();
    const { settings } = useSettings();

    // Auto-open About window on first load
    useEffect(() => {
        const timer = setTimeout(() => {
            openWindow(APP_DEFINITIONS.about);
        }, 600);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <AuroraBackground themeName={settings.auroraTheme} />
            <Desktop>
                {/* Render all open windows */}
                {windows.map((windowState) => {
                    const AppComponent = APP_COMPONENTS[windowState.id];
                    if (!AppComponent) return null;
                    return (
                        <Window key={windowState.id} windowState={windowState}>
                            <AppComponent />
                        </Window>
                    );
                })}
            </Desktop>
            <Dock appComponents={APP_COMPONENTS} />
            <SpotlightSearch />
            <AltTabSwitcher />
        </>
    );
};

const PortfolioV2 = () => {
    const isMobile = useIsMobile();
    const [override, setOverride] = useState(false);
    const alreadyBooted = sessionStorage.getItem("v2-booted") === "true";
    const [booted, setBooted] = useState(alreadyBooted);

    const handleBootComplete = () => {
        sessionStorage.setItem("v2-booted", "true");
        setBooted(true);
    };

    if (isMobile && !override) {
        return <MobileFallback onContinue={() => setOverride(true)} />;
    }

    return (
        <SettingsProvider>
            <WindowManagerProvider>
                {!booted && <BootSequence onComplete={handleBootComplete} />}
                {booted && <DesktopEnvironment />}
            </WindowManagerProvider>
        </SettingsProvider>
    );
};

export default PortfolioV2;

