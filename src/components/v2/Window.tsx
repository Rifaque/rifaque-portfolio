import { useRef, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useWindowManager, type WindowState } from "./WindowManagerContext";

interface WindowProps {
    windowState: WindowState;
    children: React.ReactNode;
}

const Window = ({ windowState, children }: WindowProps) => {
    const {
        focusWindow, closeWindow, minimizeWindow,
        maximizeWindow, restoreWindow, snapWindow, updatePosition, updateSize,
    } = useWindowManager();
    const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const handlePointerDown = () => {
        focusWindow(windowState.id);
    };

    const handleTitleDoubleClick = () => {
        if (windowState.isMaximized) {
            restoreWindow(windowState.id);
        } else {
            maximizeWindow(windowState.id);
        }
    };

    // Resize via bottom-right corner
    const handleResizeStart = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault();
            e.stopPropagation();
            focusWindow(windowState.id);
            setIsResizing(true);
            resizeRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                startW: windowState.width,
                startH: windowState.height,
            };

            const handleResizeMove = (ev: PointerEvent) => {
                if (!resizeRef.current) return;
                const dx = ev.clientX - resizeRef.current.startX;
                const dy = ev.clientY - resizeRef.current.startY;
                updateSize(windowState.id, resizeRef.current.startW + dx, resizeRef.current.startH + dy);
            };

            const handleResizeEnd = () => {
                resizeRef.current = null;
                setIsResizing(false);
                window.removeEventListener("pointermove", handleResizeMove);
                window.removeEventListener("pointerup", handleResizeEnd);
            };

            window.addEventListener("pointermove", handleResizeMove);
            window.addEventListener("pointerup", handleResizeEnd);
        },
        [focusWindow, updateSize, windowState.id, windowState.width, windowState.height]
    );

    // Drag handler for the title bar
    const handleDragStart = useCallback(
        (e: React.PointerEvent) => {
            // Don't drag if clicking on the traffic light buttons
            if ((e.target as HTMLElement).closest("[data-window-btn]")) return;
            e.preventDefault();
            setIsDragging(true);
            focusWindow(windowState.id);

            let lastX = e.clientX;
            let lastY = e.clientY;

            // Handle tear-off from maximized or snapped state
            if (windowState.isMaximized || windowState.snapPosition) {
                restoreWindow(windowState.id);
                // Center the floating window under the cursor
                const newX = e.clientX - windowState.width / 2;
                const newY = Math.max(0, e.clientY - 20); // Approximate title bar offset
                updatePosition(windowState.id, newX, newY);
                // Update mutation object so continuing the drag uses new coords
                windowState.x = newX;
                windowState.y = newY;
            }

            const handleMove = (ev: PointerEvent) => {
                const dx = ev.clientX - lastX;
                const dy = ev.clientY - lastY;
                lastX = ev.clientX;
                lastY = ev.clientY;

                windowState.x += dx;
                windowState.y = Math.max(0, windowState.y + dy);
                updatePosition(windowState.id, windowState.x, windowState.y);
            };

            const handleUp = (ev: PointerEvent) => {
                setIsDragging(false);
                window.removeEventListener("pointermove", handleMove);
                window.removeEventListener("pointerup", handleUp);

                // Edge snapping on release
                if (ev.clientY <= 5) {
                    maximizeWindow(windowState.id);
                } else if (ev.clientX <= 5) {
                    snapWindow(windowState.id, "left");
                } else if (ev.clientX >= window.innerWidth - 5) {
                    snapWindow(windowState.id, "right");
                }
            };

            window.addEventListener("pointermove", handleMove);
            window.addEventListener("pointerup", handleUp);
        },
        [focusWindow, updatePosition, restoreWindow, maximizeWindow, snapWindow, windowState]
    );

    // Minimized — render nothing (handled by dock)
    if (windowState.isMinimized) return null;

    // Maximized layout
    if (windowState.isMaximized) {
        return (
            <motion.div
                key={`${windowState.id}-max`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, y: 30 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "fixed inset-2 bottom-[72px] rounded-xl overflow-hidden",
                    "bg-black/40 backdrop-blur-2xl",
                    "border border-white/[0.2]",
                    "shadow-[0_25px_60px_rgba(0,0,0,0.5)]",
                    "flex flex-col"
                )}
                style={{ zIndex: windowState.zIndex }}
                onPointerDown={handlePointerDown}
            >
                <TitleBar
                    windowState={windowState}
                    onClose={() => closeWindow(windowState.id)}
                    onMinimize={() => minimizeWindow(windowState.id)}
                    onMaxRestore={() => restoreWindow(windowState.id)}
                    onDoubleClick={handleTitleDoubleClick}
                    isDragging={false}
                    onDragStart={handleDragStart}
                />
                <div className="flex-1 overflow-auto scrollbar-hide">{children}</div>
            </motion.div>
        );
    }

    // Snapped layout
    if (windowState.snapPosition) {
        return (
            <motion.div
                key={`${windowState.id}-snap`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, y: 30 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                    "fixed inset-y-2 bottom-[72px] rounded-xl overflow-hidden",
                    "bg-black/40 backdrop-blur-2xl",
                    "border border-white/[0.2]",
                    "shadow-[0_25px_60px_rgba(0,0,0,0.5)]",
                    "flex flex-col",
                    windowState.snapPosition === "left" ? "left-2 right-1/2 mr-1" : "right-2 left-1/2 ml-1"
                )}
                style={{ zIndex: windowState.zIndex }}
                onPointerDown={handlePointerDown}
            >
                <TitleBar
                    windowState={windowState}
                    onClose={() => closeWindow(windowState.id)}
                    onMinimize={() => minimizeWindow(windowState.id)}
                    onMaxRestore={() => restoreWindow(windowState.id)}
                    onDoubleClick={handleTitleDoubleClick}
                    isDragging={isDragging}
                    onDragStart={handleDragStart}
                />
                <div className="flex-1 overflow-auto scrollbar-hide">{children}</div>
            </motion.div>
        );
    }

    // Normal (floating) layout — use style-based positioning, NOT framer animate
    return (
        <motion.div
            key={`${windowState.id}-normal`}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                "fixed rounded-xl overflow-hidden",
                "bg-black/40 backdrop-blur-2xl",
                "border border-white/[0.2]",
                "shadow-[0_15px_40px_rgba(0,0,0,0.5)]",
                "flex flex-col",
                isDragging && "cursor-grabbing",
                isResizing && "select-none"
            )}
            style={{
                zIndex: windowState.zIndex,
                left: windowState.x,
                top: windowState.y,
                width: windowState.width,
                height: windowState.height,
            }}
            onPointerDown={handlePointerDown}
        >
            <TitleBar
                windowState={windowState}
                onClose={() => closeWindow(windowState.id)}
                onMinimize={() => minimizeWindow(windowState.id)}
                onMaxRestore={() => maximizeWindow(windowState.id)}
                onDoubleClick={handleTitleDoubleClick}
                isDragging={isDragging}
                onDragStart={handleDragStart}
            />
            <div className="flex-1 overflow-auto scrollbar-hide">{children}</div>

            {/* Resize Handle */}
            <div
                onPointerDown={handleResizeStart}
                className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-50 group"
            >
                <svg
                    className="absolute bottom-1 right-1 w-3 h-3 text-white/20 group-hover:text-aurora-teal/50 transition-colors"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                >
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="6" cy="10" r="1.5" />
                    <circle cx="10" cy="6" r="1.5" />
                </svg>
            </div>
        </motion.div>
    );
};

// ═══════════════════════════════════════
// Title Bar
// ═══════════════════════════════════════

interface TitleBarProps {
    windowState: WindowState;
    onClose: () => void;
    onMinimize: () => void;
    onMaxRestore: () => void;
    onDoubleClick: () => void;
    isDragging: boolean;
    onDragStart?: (e: React.PointerEvent) => void;
}

const TitleBar = ({
    windowState, onClose, onMinimize, onMaxRestore,
    onDoubleClick, isDragging, onDragStart,
}: TitleBarProps) => {
    return (
        <div
            className={cn(
                "flex items-center gap-2 px-4 py-3 select-none shrink-0",
                "border-b border-white/[0.1]",
                "bg-white/[0.02]",
                isDragging ? "cursor-grabbing" : onDragStart ? "cursor-grab" : "cursor-default"
            )}
            onPointerDown={onDragStart}
            onDoubleClick={onDoubleClick}
        >
            {/* Traffic Light Dots */}
            <div className="flex items-center gap-1.5 mr-2" data-window-btn="true">
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors group relative"
                    aria-label="Close"
                    data-window-btn="true"
                >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] text-red-900 font-bold">✕</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors group relative"
                    aria-label="Minimize"
                    data-window-btn="true"
                >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] text-yellow-900 font-bold">−</span>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onMaxRestore(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors group relative"
                    aria-label="Maximize"
                    data-window-btn="true"
                >
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[8px] text-green-900 font-bold">↗</span>
                </button>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm">{windowState.icon}</span>
                <span className="text-sm font-medium text-white/70 truncate">{windowState.title}</span>
            </div>
        </div>
    );
};

export default Window;
