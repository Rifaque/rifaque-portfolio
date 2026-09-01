import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { personalInfo, projects, skillEvidence, alsoWorkedWith, terminalCommands } from "@/data/portfolio";

// ═══════════════════════════════════════
// All available commands
// ═══════════════════════════════════════

const ALL_COMMANDS = [
    "help", "skills", "projects", "contact", "clear", "whoami", "theme", "exit",
    "ls", "about", "open", "cd", "resume", "version", "uptime", "logs", "env",
    "fortune", "neofetch", "date", "ascii", "coffee", "sudo", "hack", "echo",
    "man", "install", "matrix", "vim", "rm", "nexus", "atlas", "hubzero",
    "invariants",
];

const COMMAND_ALIASES: Record<string, string> = {
    ls: "projects",
};

const MANUALS: Record<string, string> = {
    help: "Displays all available commands",
    skills: "Lists developer's skills by category",
    projects: "Shows featured projects",
    nexus: "The flagship experiment, and what it cost",
    atlas: "The one that shipped",
    hubzero: "The studio",
    invariants: "One of the 27 rules Nexus cannot talk its way past",
    contact: "Shows contact information",
    cd: "Usage: cd [section] — navigates within the portfolio",
    open: "Usage: open [github | linkedin | resume] — opens respective link",
    sudo: "Pretends to run command with elevated privileges",
    echo: "Usage: echo [text] — prints text",
    hack: "Fun command. Try it!",
    man: "Usage: man [command] — prints help for a command",
    install: "Simulates package installation (e.g., install react)",
    matrix: "Simulates the Matrix...",
    vim: "Good luck exiting...",
    rm: "Pretends to delete everything (harmless)",
    clear: "Clears terminal history",
    about: "Shows bio and summary",
    whoami: "Shows whose portfolio this is",
    resume: "Opens resume in a new tab",
    neofetch: "System info",
    fortune: "Random wisdom",
    coffee: "Brews coffee",
    ascii: "Displays ASCII art",
    date: "Current date/time",
    version: "Terminal version",
    uptime: "Portfolio uptime",
    logs: "Simulated system logs",
    env: "Shows the tech stack environment",
    theme: "Current theme info",
    exit: "Closes the terminal (just kidding, it stays)",
};

interface TerminalLine {
    type: "input" | "output";
    content: string;
}

const startTime = Date.now();

const TerminalApp = () => {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<TerminalLine[]>([
        { type: "output", content: `Rifaque's Portfolio Terminal [v2.0.0]` },
        { type: "output", content: `(c) 2025 Rifaque Ahmed. All rights reserved.` },
        { type: "output", content: `Type "help" to get started.\n` },
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [, setCommandIndex] = useState(-1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const getRandomFortune = () => {
        const quotes = [
            "Code never lies, comments sometimes do.",
            "There's no place like 127.0.0.1",
            "To understand recursion, you must first understand recursion.",
            "Git push and pray.",
            "It works on my machine!",
            "There are 10 types of people: those who understand binary and those who don't.",
            "A good programmer looks both ways before crossing a one-way street.",
            "The best code is no code at all.",
            "First, solve the problem. Then, write the code.",
            "Weeks of coding can save you hours of planning.",
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    };

    const handleCommand = useCallback((cmd: string): string => {
        const args = cmd.trim().split(" ");
        let command = args[0].toLowerCase();

        if (COMMAND_ALIASES[command]) command = COMMAND_ALIASES[command];

        switch (command) {
            case "help":
                return `Available commands:\n\n${ALL_COMMANDS.join(", ")}\n\nType "man [command]" for details on any command.`;

            case "skills":
                return (
                    skillEvidence
                        .map((s) => `${s.name.padEnd(24)}${s.evidence.join(", ")}`)
                        .join("\n") +
                    `\n\nAlso worked with: ${alsoWorkedWith.join(", ")}`
                );

            case "projects":
                return projects
                    .map(
                        (p, i) =>
                            `${i + 1}. ${p.name} — ${p.status.label}\n   ${p.tagline}`
                    )
                    .join("\n\n");

            case "contact":
                return terminalCommands.contact;

            case "clear":
                setHistory([]);
                setSuggestions([]);
                return "";

            case "whoami":
                return `You are visiting ${personalInfo.name}'s portfolio.\n${personalInfo.headline}.`;

            case "theme":
                return "Dark mode — always. Terminal stays dark. ☕️";

            case "about":
                return personalInfo.bio.join("\n\n");

            case "nexus":
                return terminalCommands.nexus;

            case "atlas":
                return terminalCommands.atlas;

            case "hubzero":
                return terminalCommands.hubzero;

            case "invariants":
                return terminalCommands.invariants;

            case "resume":
                window.open(personalInfo.resume, "_blank");
                return "Opening resume... 📄";

            case "open": {
                const site = args[1]?.toLowerCase();
                if (site === "github") { window.open(personalInfo.socials.github, "_blank"); return "Opening GitHub..."; }
                if (site === "linkedin") { window.open(personalInfo.socials.linkedin, "_blank"); return "Opening LinkedIn..."; }
                if (site === "resume") { window.open(personalInfo.resume, "_blank"); return "Opening resume..."; }
                return `Usage: open [github | linkedin | resume]`;
            }

            case "cd": {
                const target = args[1];
                if (!target) return "Usage: cd [about | projects | skills | experience | contact]";
                return `cd: navigated to ~/${target}`;
            }

            case "exit":
                return "Nice try. There's no escape from this terminal. 😈";

            case "version":
                return "Portfolio terminal v2.1.0";

            case "uptime": {
                const seconds = Math.floor((Date.now() - startTime) / 1000);
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `Terminal uptime: ${mins}m ${secs}s`;
            }

            case "logs":
                return `[INFO]  Loaded config\n[INFO]  Composition root initialised\n[INFO]  Rendered ${projects.length} projects\n[INFO]  ${skillEvidence.length} skills resolved against evidence\n[WARN]  0 unverified claims. This took a while.`;

            case "env":
                return `NODE_ENV=production\nFRAMEWORK=React 18 + Vite\nSTYLING=Tailwind CSS\nLANGUAGE=TypeScript\nANIMATIONS=Framer Motion\nDEPLOY=Vercel`;

            case "fortune":
                return getRandomFortune();

            case "neofetch":
                return [
                    `    ╔══════════════════╗`,
                    `    ║  Rifaque Ahmed   ║`,
                    `    ╚══════════════════╝`,
                    ``,
                    `  Name:      ${personalInfo.name}`,
                    `  Role:      ${personalInfo.headline}`,
                    `  Location:  ${personalInfo.location}`,
                    `  Projects:  ${projects.length}`,
                    `  Skills:    ${skillEvidence.length}, each attached to shipped work`,
                    `  Status:    Open to product / AI engineering roles`,
                ].join("\n");

            case "date":
                return new Date().toString();

            case "ascii":
                return [
                    "    ____  _ ____                        ",
                    "   / __ \\(_) __/___ _____ ___  _____   ",
                    "  / /_/ / / /_/ __ `/ __ `/ / / / _ \\  ",
                    " / _, _/ / __/ /_/ / /_/ / /_/ /  __/  ",
                    "/_/ |_/_/_/  \\__,_/\\__, /\\__,_/\\___/   ",
                    "                     /_/                ",
                ].join("\n");

            case "coffee":
                return "Brewing coffee... ☕️\n\n  ( (\n   ) )\n .......\n |     |]\n  \\   /\n   `\"`\n\nDone! Enjoy your coffee.";

            case "sudo":
                return "Permission denied. You are not root 😄\n\nNice try though.";

            case "hack":
                return [
                    "Accessing secret files...",
                    "Bypassing firewall...",
                    "Decrypting data... ██████████ 100%",
                    "Downloading entire internet...",
                    "",
                    "Just kidding. Stay ethical 💻",
                ].join("\n");

            case "echo":
                return args.slice(1).join(" ") || "(empty)";

            case "install": {
                const pkg = args[1];
                if (!pkg) return "Usage: install [package]";
                return `Installing ${pkg}...\nResolving dependencies...\nDownloading ${pkg}@latest...\n✓ Installed ${pkg} successfully!`;
            }

            case "man": {
                const target = args[1]?.toLowerCase();
                if (target && MANUALS[target]) return `${target.toUpperCase()}(1)\n\nNAME\n  ${target} — ${MANUALS[target]}`;
                return target ? `No manual entry for ${target}` : "Usage: man [command]";
            }

            case "matrix":
                return "Wake up, Neo...\nThe Matrix has you.\nFollow the white rabbit.\n\n01010010 01101001 01100110 01100001 01110001 01110101 01100101";

            case "vim":
                return "You're now stuck in vim.\n\nPress :q! to quit.\n\n...Just kidding. You're free. 😄";

            case "rm":
                return "$ rm -rf /\nSimulated deletion...\nAll files deleted. Wait...\nJust kidding. Nothing happened. 💣";

            default:
                return `Command not found: ${cmd}\nType "help" for available commands.`;
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        const output = handleCommand(trimmed);
        if (trimmed.toLowerCase() !== "clear") {
            setHistory((prev) => [
                ...prev,
                { type: "input", content: trimmed },
                ...(output ? [{ type: "output" as const, content: output }] : []),
            ]);
        }
        setCommandHistory((prev) => [...prev, trimmed]);
        setCommandIndex(-1);
        setInput("");
        setSuggestions([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            setCommandIndex((i) => {
                const newIndex = Math.min(i + 1, commandHistory.length - 1);
                setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
                return newIndex;
            });
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setCommandIndex((i) => {
                const newIndex = Math.max(i - 1, -1);
                setInput(newIndex === -1 ? "" : commandHistory[commandHistory.length - 1 - newIndex] || "");
                return newIndex;
            });
        } else if (e.key === "Tab") {
            e.preventDefault();
            if (suggestions.length > 0) {
                setInput(suggestions[0]);
                setSuggestions([]);
            }
        }
    };

    const handleInputChange = (val: string) => {
        setInput(val);
        const parts = val.trim().split(" ");
        if (parts.length === 1 && val.trim()) {
            const matches = ALL_COMMANDS.filter((cmd) => cmd.startsWith(val.toLowerCase()));
            setSuggestions(matches);
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div
            className="h-full flex flex-col bg-[#0a0a0a] text-white font-mono text-sm"
            onClick={() => inputRef.current?.focus()}
        >
            <div ref={scrollRef} className="flex-1 overflow-auto p-4 scrollbar-hide">
                {history.map((line, index) => (
                    <div key={index} className="mb-1">
                        {line.type === "input" ? (
                            <div className="flex items-start gap-2">
                                <span className="text-aurora-teal shrink-0">~/portfolio ❯</span>
                                <span className="text-white">{line.content}</span>
                            </div>
                        ) : (
                            <pre className="text-white/70 whitespace-pre-wrap leading-relaxed pl-0 text-xs">
                                {line.content}
                            </pre>
                        )}
                    </div>
                ))}

                <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
                    <span className="text-aurora-teal shrink-0">~/portfolio ❯</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent text-white outline-none caret-aurora-teal min-w-0"
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-2 h-4 bg-aurora-teal shrink-0"
                    />
                </form>

                {suggestions.length > 0 && (
                    <div className="text-xs text-white/40 mt-1">
                        Tab: {suggestions.join(", ")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TerminalApp;
