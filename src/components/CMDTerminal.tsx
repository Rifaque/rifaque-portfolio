import { useState, useEffect, useRef, useCallback } from "react";
import { FiX, FiTerminal } from "react-icons/fi";
import { terminalCommands, personalInfo } from "@/data/portfolio";

interface TerminalLine {
  type: "input" | "output";
  content: string;
}

const GREETING: TerminalLine[] = [
  {
    type: "output",
    content: `rifaque.ahmed — portfolio shell

Type "help" for commands. Esc or "exit" to close.`,
  },
];

const CMDTerminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>(GREETING);
  const [recall, setRecall] = useState<string[]>([]);
  const [recallIndex, setRecallIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    restoreRef.current?.focus?.();
  }, []);

  // Backtick toggles. Ignored while typing in a real field, so the shortcut
  // never eats a character someone meant to write.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "`" && !typing) {
        e.preventDefault();
        restoreRef.current = document.activeElement as HTMLElement;
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [history]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setRecall((prev) => [raw, ...prev].slice(0, 40));
    setRecallIndex(-1);
    setHistory((prev) => [...prev, { type: "input", content: raw }]);

    if (cmd === "clear") {
      setHistory([]);
      return;
    }
    if (cmd === "exit") {
      close();
      return;
    }
    if (cmd === "resume") {
      window.open(personalInfo.resume, "_blank", "noopener");
      setHistory((prev) => [
        ...prev,
        { type: "output", content: terminalCommands.resume },
      ]);
      return;
    }

    const output =
      terminalCommands[cmd] ??
      `${raw}: command not found. Type "help" to see what exists.`;
    setHistory((prev) => [...prev, { type: "output", content: output }]);
  };

  const handleInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(recallIndex + 1, recall.length - 1);
      if (next >= 0) {
        setRecallIndex(next);
        setInput(recall[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = recallIndex - 1;
      setRecallIndex(next);
      setInput(next >= 0 ? recall[next] : "");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="dialog-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-4"
          onClick={close}
        >
          <div
            className="dialog-panel relative flex max-h-[85dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0a0a]"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio terminal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <FiTerminal className="h-4 w-4 text-aurora-teal" aria-hidden />
                <span className="font-mono text-sm text-white/60">
                  rifaque@portfolio ~
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded p-1 text-white/50 transition-colors hover:text-white focus-ring"
              >
                <span className="sr-only">Close terminal</span>
                <FiX className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div
              ref={bodyRef}
              className="scrollbar-hide h-[400px] max-h-[62dvh] overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+var(--safe-bottom))] font-mono text-xs sm:text-sm"
              aria-live="polite"
            >
              {history.map((line, index) => (
                <div key={index} className="mb-3">
                  {line.type === "input" ? (
                    <div className="flex items-start gap-2">
                      <span className="text-aurora-teal" aria-hidden>
                        ❯
                      </span>
                      <span className="text-white">{line.content}</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap pl-4 leading-relaxed text-white/70">
                      {line.content}
                    </pre>
                  )}
                </div>
              ))}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) {
                    run(input);
                    setInput("");
                  }
                }}
                className="flex items-center gap-2"
              >
                <label htmlFor="terminal-input" className="text-aurora-teal">
                  <span className="sr-only">Terminal command</span>
                  <span aria-hidden>❯</span>
                </label>
                <input
                  id="terminal-input"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKey}
                  className="flex-1 bg-transparent text-white caret-aurora-teal outline-none"
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CMDTerminal;
