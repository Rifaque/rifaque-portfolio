import { useState, useRef, FormEvent } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, Lock, ShieldAlert } from "lucide-react";
import { useWindowManager } from "../WindowManagerContext";

const INITIAL_URL = "https://rifaque-s-aurora.vercel.app/"; // Fallback URL if none provided
const SEARCH_ENGINE = "https://www.bing.com/search?q=";

const BrowserApp = ({ defaultUrl = INITIAL_URL }: { defaultUrl?: string }) => {
    const [urlInput, setUrlInput] = useState(defaultUrl);
    const [currentUrl, setCurrentUrl] = useState(defaultUrl);
    const [history, setHistory] = useState<string[]>([defaultUrl]);
    const [historyIdx, setHistoryIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const navigateTo = (url: string) => {
        let finalUrl = url;

        // Basic URL parsing/formatting
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            if (url.includes(".") && !url.includes(" ")) {
                finalUrl = `https://${url}`;
            } else {
                finalUrl = `${SEARCH_ENGINE}${encodeURIComponent(url)}`;
            }
        }

        const newHistory = [...history.slice(0, historyIdx + 1), finalUrl];
        setHistory(newHistory);
        setHistoryIdx(newHistory.length - 1);
        setCurrentUrl(finalUrl);
        setUrlInput(finalUrl);
        setLoading(true);
        setError(false);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        navigateTo(urlInput);
    };

    const goBack = () => {
        if (historyIdx > 0) {
            const prevUrl = history[historyIdx - 1];
            setHistoryIdx(historyIdx - 1);
            setCurrentUrl(prevUrl);
            setUrlInput(prevUrl);
            setLoading(true);
            setError(false);
        }
    };

    const goForward = () => {
        if (historyIdx < history.length - 1) {
            const nextUrl = history[historyIdx + 1];
            setHistoryIdx(historyIdx + 1);
            setCurrentUrl(nextUrl);
            setUrlInput(nextUrl);
            setLoading(true);
            setError(false);
        }
    };

    const reload = () => {
        if (iframeRef.current) {
            // Force reload by temporarily changing src
            const temp = currentUrl;
            setCurrentUrl("");
            setTimeout(() => {
                setCurrentUrl(temp);
                setLoading(true);
                setError(false);
            }, 50);
        }
    };

    const goHome = () => navigateTo(INITIAL_URL);

    // Some sites block iframe embedding via X-Frame-Options or CSP.
    // We catch load errors or timeouts to show a fallback message.
    const handleIframeLoad = () => {
        setLoading(false);
    };

    const handleIframeError = () => {
        setLoading(false);
        setError(true);
    };

    const isSecure = currentUrl.startsWith("https://");

    return (
        <div className="h-full flex flex-col bg-[#1c1c1e] text-white select-none overflow-hidden">
            {/* Browser Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-[#2d2d2f] border-b border-white/[0.08]">
                {/* Navigation Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={goBack}
                        disabled={historyIdx === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <button
                        onClick={goForward}
                        disabled={historyIdx === history.length - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <ArrowRight size={16} />
                    </button>
                    <button
                        onClick={reload}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
                    >
                        <RotateCw size={14} className={cn(loading && "animate-spin text-cyan-400")} />
                    </button>
                    <button
                        onClick={goHome}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors hidden sm:flex"
                    >
                        <Home size={16} />
                    </button>
                </div>

                {/* Address Bar */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex items-center h-8 bg-[#1c1c1e] rounded-md px-3 border border-white/[0.05] focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all max-w-3xl"
                >
                    <div className="mr-2 text-white/40">
                        {isSecure ? <Lock size={12} className="text-emerald-400/80" /> : <Search size={14} />}
                    </div>
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-white/90 placeholder:text-white/30"
                        placeholder="Search or enter website name"
                        spellCheck={false}
                    />
                </form>

                {/* Extension / Menu placeholders (Optional) */}
                <div className="flex items-center gap-1 hidden sm:flex">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">
                        R
                    </div>
                </div>
            </div>

            {/* Bookmarks Bar */}
            <div className="flex items-center gap-4 px-3 py-1.5 bg-[#2d2d2f] border-b border-white/[0.04] text-[11px] text-white/60 overflow-x-auto hide-scrollbar hidden md:flex">
                <button onClick={() => navigateTo("https://github.com/Rifaque")} className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <img src="https://github.com/favicon.ico" className="w-3 h-3 opacity-80" alt="GitHub" />
                    GitHub
                </button>
                <button onClick={() => navigateTo("https://www.linkedin.com/in/rifaque-akrami/")} className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    <img src="https://fi.linkedin.com/favicon.ico" className="w-3 h-3 opacity-80" alt="LinkedIn" />
                    LinkedIn
                </button>
                <button onClick={() => navigateTo("https://atlas.rifaque.com/")} className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    🌍 Atlas Project
                </button>
                <button onClick={() => navigateTo("https://querycraft.vercel.app/")} className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    🔍 Querycraft
                </button>
                <button onClick={() => navigateTo("https://bhatkal-time-luxe.vercel.app/")} className="hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
                    ⌚ TimeLuxe
                </button>
            </div>

            {/* Browser Content Viewport */}
            <div className="flex-1 relative bg-white">
                {error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1c1e] text-white p-6 text-center">
                        <ShieldAlert size={48} className="text-red-400 mb-4 opacity-80" />
                        <h2 className="text-xl font-semibold mb-2">Connection Refused</h2>
                        <p className="text-white/60 max-w-md text-sm mb-6">
                            This website may not allow itself to be embedded within another frame (X-Frame-Options or CSP blocks), or the connection timed out.
                        </p>
                        <button
                            onClick={() => window.open(currentUrl, '_blank')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors"
                        >
                            Open in New Tab
                        </button>
                    </div>
                ) : (
                    <iframe
                        ref={iframeRef}
                        src={currentUrl}
                        className="w-full h-full border-none"
                        title="Browser Viewport"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        referrerPolicy="no-referrer"
                    />
                )}
            </div>
        </div>
    );
};

export default BrowserApp;
