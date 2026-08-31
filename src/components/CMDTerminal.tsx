import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTerminal } from "react-icons/fi";
import { terminalCommands } from "@/data/portfolio";

interface TerminalLine {
  type: "input" | "output";
  content: string;
}

const CMDTerminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: "output", content: 'Welcome to the terminal! Type "help" for available commands.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    setHistory((prev) => [...prev, { type: "input", content: cmd }]);

    if (trimmedCmd === "clear") {
      setHistory([]);
      return;
    }

    if (trimmedCmd === "exit") {
      setIsOpen(false);
      return;
    }

    const output = terminalCommands[trimmedCmd] || `Command not found: ${cmd}. Type "help" for available commands.`;

    setHistory((prev) => [...prev, { type: "output", content: output }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl max-h-[80vh] bg-[#0a0a0a] border border-white/[0.1] rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <FiTerminal className="w-4 h-4 text-aurora-teal" />
                <span className="text-white/70 text-sm font-mono">rifaque@portfolio ~ </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/50 hover:text-white transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Terminal Body */}
            <div
              ref={terminalRef}
              className="p-4 h-[400px] overflow-y-auto font-mono text-sm scrollbar-hide"
            >
              {history.map((line, index) => (
                <div key={index} className="mb-2">
                  {line.type === "input" ? (
                    <div className="flex items-start gap-2">
                      <span className="text-aurora-teal">❯</span>
                      <span className="text-white">{line.content}</span>
                    </div>
                  ) : (
                    <pre className="aurora-text whitespace-pre-wrap leading-relaxed pl-4">
                      {line.content}
                    </pre>
                  )}
                </div>
              ))}

              {/* Input Line */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <span className="text-aurora-teal">❯</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none caret-aurora-teal"
                  spellCheck={false}
                  autoComplete="off"
                />
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="w-2 h-5 bg-aurora-teal"
                />
              </form>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CMDTerminal;
