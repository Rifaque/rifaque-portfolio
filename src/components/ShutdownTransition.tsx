import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CRT power-off, then hand over to /desktop.
 *
 * Phases are driven by timers and CSS rather than requestAnimationFrame, so a
 * backgrounded tab still arrives at the destination instead of freezing on a
 * black screen.
 */
const ShutdownTransition = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate("/desktop"), 1400);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black"
            role="status"
            aria-live="polite"
        >
            <span className="sr-only">Starting the desktop environment</span>
            <span aria-hidden className="crt-collapse" />
        </div>
    );
};

export default ShutdownTransition;
