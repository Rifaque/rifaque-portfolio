import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ShutdownTransition = () => {
    const navigate = useNavigate();
    const [phase, setPhase] = useState<"dim" | "line" | "dot" | "black">("dim");

    return (
        <AnimatePresence>
            <motion.div
                key="shutdown-overlay"
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-transparent pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Black Background (stays mounted for the entire sequence) */}
                <motion.div
                    className="absolute inset-0 bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    onAnimationComplete={() => {
                        if (phase === "dim") setPhase("line");
                    }}
                />

                {/* Phase 2: CRT horizontal line */}
                {phase === "line" && (
                    <motion.div
                        className="bg-white/90"
                        style={{ borderRadius: 1 }}
                        initial={{ width: "80vw", height: 3 }}
                        animate={{ width: 6, height: 6 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        onAnimationComplete={() => setPhase("dot")}
                    />
                )}

                {/* Phase 3: Dot fades */}
                {phase === "dot" && (
                    <motion.div
                        className="bg-white/70 rounded-full"
                        initial={{ width: 6, height: 6, opacity: 1 }}
                        animate={{ width: 2, height: 2, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onAnimationComplete={() => setPhase("black")}
                    />
                )}

                {/* Phase 4: Hold black, then navigate */}
                {phase === "black" && (
                    <motion.div
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        onAnimationComplete={() => navigate("/desktop")}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ShutdownTransition;
