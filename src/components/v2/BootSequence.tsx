import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ═══════════════════════════════════════
// BIOS POST lines
// ═══════════════════════════════════════
const BIOS_LINES = [
    "Rifaque BIOS v4.2.0 — Initializing...",
    "",
    "CPU: Intel Core Ultra 7 255HX @ 5.1GHz ......... [  OK  ]",
    "Memory: 32GB DDR5-5600 ......................... [  OK  ]",
    "GPU: NVIDIA RTX 5060 8GB ....................... [  OK  ]",
    "Storage: 1TB NVMe Gen5 ......................... [  OK  ]",
    "Network: 2.5GbE Adapter ........................ [  OK  ]",
    "",
    "POST complete. Handing off to bootloader...",
];

// ═══════════════════════════════════════
// Console service logs
// ═══════════════════════════════════════
const SERVICE_LOGS = [
    { status: "OK", msg: "Started systemd-journald.service" },
    { status: "OK", msg: "Reached target Local File Systems" },
    { status: "OK", msg: "Started networking.service" },
    { status: "OK", msg: "Loaded gpu-driver-nvidia.ko" },
    { status: "OK", msg: "Started docker.service" },
    { status: "OK", msg: "Mounted /dev/portfolio" },
    { status: "OK", msg: "Started sshd.service — OpenSSH Server" },
    { status: "OK", msg: "Loaded react-runtime v18.3.1" },
    { status: "OK", msg: "Started framer-motion.service" },
    { status: "OK", msg: "Started tailwind-jit.service" },
    { status: "OK", msg: "Loaded vite-dev-server v5.4" },
    { status: "OK", msg: "Started portfolio-engine.service" },
    { status: "OK", msg: "Mounted /home/rifaque/workspace" },
    { status: "OK", msg: "All services operational. Booting desktop..." },
];

const ASCII_LOGO = [
    "    ____  _ ____                        ",
    "   / __ \\(_) __/___ _____ ___  _____   ",
    "  / /_/ / / /_/ __ `/ __ `/ / / / _ \\  ",
    " / _, _/ / __/ /_/ / /_/ / /_/ /  __/  ",
    "/_/ |_/_/_/  \\__,_/\\__, /\\__,_/\\___/   ",
    "                     /_/                ",
];

// ═══════════════════════════════════════
// Boot Sequence Component
// ═══════════════════════════════════════

interface BootSequenceProps {
    onComplete: () => void;
}

type Phase = "bios" | "services" | "logo" | "fadeout";

const BootSequence = ({ onComplete }: BootSequenceProps) => {
    const [phase, setPhase] = useState<Phase>("bios");
    const [biosLines, setBiosLines] = useState<string[]>([]);
    const [serviceLines, setServiceLines] = useState<{ status: string; msg: string }[]>([]);
    const [showCursor, setShowCursor] = useState(true);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const biosIdx = useRef(0);
    const svcIdx = useRef(0);

    // Cursor blink
    useEffect(() => {
        const blink = setInterval(() => setShowCursor((v) => !v), 500);
        return () => clearInterval(blink);
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [biosLines, serviceLines]);

    // Phase 1: BIOS POST
    useEffect(() => {
        if (phase !== "bios") return;
        const timer = setInterval(() => {
            const idx = biosIdx.current;
            if (idx < BIOS_LINES.length) {
                setBiosLines((prev) => [...prev, BIOS_LINES[idx]]);
                biosIdx.current++;
            } else {
                clearInterval(timer);
                setTimeout(() => setPhase("services"), 300);
            }
        }, 120);
        return () => clearInterval(timer);
    }, [phase]);

    // Phase 2: Service logs
    useEffect(() => {
        if (phase !== "services") return;
        const timer = setInterval(() => {
            const idx = svcIdx.current;
            if (idx < SERVICE_LOGS.length) {
                setServiceLines((prev) => [...prev, SERVICE_LOGS[idx]]);
                svcIdx.current++;
            } else {
                clearInterval(timer);
                setTimeout(() => setPhase("logo"), 400);
            }
        }, 130);
        return () => clearInterval(timer);
    }, [phase]);

    // Phase 3: Logo + progress bar
    useEffect(() => {
        if (phase !== "logo") return;
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => setPhase("fadeout"), 300);
                    return 100;
                }
                return prev + 4;
            });
        }, 40);
        return () => clearInterval(timer);
    }, [phase]);

    // Phase 4: Fadeout → call onComplete after animation
    const handleExitComplete = useCallback(() => {
        onComplete();
    }, [onComplete]);

    // Show the boot overlay for bios, services, and logo phases
    const isVisible = phase !== "fadeout";

    return (
        <AnimatePresence onExitComplete={handleExitComplete}>
            {isVisible && (
                <motion.div
                    key="boot-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] bg-[#0a0a0f] flex items-center justify-center overflow-hidden"
                >
                    {/* BIOS + Services phase */}
                    {(phase === "bios" || phase === "services") && (
                        <div
                            ref={scrollRef}
                            className="w-full h-full p-6 md:p-10 overflow-auto font-mono text-xs md:text-sm"
                        >
                            {/* BIOS lines */}
                            {biosLines.map((line, i) => (
                                <div key={`bios-${i}`} className="leading-relaxed">
                                    {line.includes("[  OK  ]") ? (
                                        <span>
                                            <span className="text-amber-300/90">
                                                {line.replace("[  OK  ]", "")}
                                            </span>
                                            <span className="text-emerald-400 font-bold">[  OK  ]</span>
                                        </span>
                                    ) : line.includes("Initializing") ? (
                                        <span className="text-amber-400 font-bold">{line}</span>
                                    ) : line.includes("Handing off") ? (
                                        <span className="text-cyan-300">{line}</span>
                                    ) : (
                                        <span className="text-white/50">{line}</span>
                                    )}
                                </div>
                            ))}

                            {/* Service logs */}
                            {phase === "services" && (
                                <>
                                    <div className="h-4" />
                                    {serviceLines.map((line, i) => (
                                        <div key={`svc-${i}`} className="leading-relaxed">
                                            <span className="text-cyan-400">[</span>
                                            <span className="text-emerald-400 font-bold mx-1">{line.status}</span>
                                            <span className="text-cyan-400">]</span>
                                            <span className="text-white/70 ml-2">{line.msg}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Blinking cursor */}
                            <span
                                className={`inline-block w-2 h-4 mt-1 ${showCursor ? "bg-cyan-400" : "bg-transparent"
                                    } transition-colors duration-100`}
                            />
                        </div>
                    )}

                    {/* Logo splash phase */}
                    {phase === "logo" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col items-center gap-6"
                        >
                            <pre className="text-cyan-400/80 text-[10px] md:text-xs font-mono leading-tight select-none">
                                {ASCII_LOGO.join("\n")}
                            </pre>
                            <p className="text-white/40 text-xs tracking-[0.3em] uppercase">
                                Loading Desktop Environment
                            </p>
                            {/* Progress bar */}
                            <div className="w-64 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full"
                                    style={{ width: `${progress}%` }}
                                    transition={{ duration: 0.05 }}
                                />
                            </div>
                            <p className="text-white/20 text-[10px] font-mono tabular-nums">
                                {progress}%
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BootSequence;

