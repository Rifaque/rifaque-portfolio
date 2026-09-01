import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

/**
 * A draggable, resizable window manager is not a good experience on a phone,
 * and pretending otherwise would be worse than saying so.
 */
const MobileFallback = ({ onContinue }: { onContinue: () => void }) => (
    <div className="flex min-h-[100dvh] flex-col justify-center bg-black px-6 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-aurora-teal/80">
            /desktop
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            This one wants a bigger screen
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
            It is a small windowing environment — draggable windows, a dock,
            alt-tab, a terminal. All of that depends on a pointer and room to
            move things around, so on a phone it would just be a worse version
            of the main site.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
            Nothing here is unique to it. Everything the desktop shows also
            lives on the main page.
        </p>

        <div className="mt-8 flex flex-col gap-3">
            <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-aurora-teal/40 bg-aurora-teal/[0.08] px-5 py-3 text-sm font-medium text-white focus-ring"
            >
                <FiArrowLeft className="h-4 w-4" aria-hidden />
                Back to the portfolio
            </Link>
            <button
                type="button"
                onClick={onContinue}
                className="rounded-lg border border-white/15 px-5 py-3 text-sm text-white/70 focus-ring"
            >
                Open it anyway
            </button>
        </div>
    </div>
);

export default MobileFallback;
