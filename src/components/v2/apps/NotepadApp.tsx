import { useState, useEffect, useCallback, useRef } from "react";
import { StickyNote } from "lucide-react";

const STORAGE_KEY = "v2-notepad";

const NotepadApp = () => {
    const [content, setContent] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || "";
        } catch {
            return "";
        }
    });
    const [saved, setSaved] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-save with debounce
    const saveContent = useCallback((text: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, text);
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
            } catch {
                // storage full
            }
        }, 500);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        saveContent(val);
    };

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;

    return (
        <div className="h-full flex flex-col bg-[#0d0d0d]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                    <StickyNote size={14} />
                    <span>Notepad</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                    {saved && (
                        <span className="text-emerald-400/80 animate-pulse">Saved ✓</span>
                    )}
                    <span>{wordCount} words</span>
                    <span>{charCount} chars</span>
                </div>
            </div>

            {/* Text Area */}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                placeholder="Start typing..."
                spellCheck={false}
                className="flex-1 w-full bg-transparent text-white/80 text-sm font-mono p-4 outline-none resize-none leading-relaxed placeholder:text-white/20 scrollbar-hide"
            />
        </div>
    );
};

export default NotepadApp;
