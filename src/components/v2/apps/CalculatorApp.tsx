import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const BUTTONS = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "⌫", "="],
];

const CalculatorApp = () => {
    const [display, setDisplay] = useState("0");
    const [prev, setPrev] = useState<string | null>(null);
    const [op, setOp] = useState<string | null>(null);
    const [fresh, setFresh] = useState(true);

    const handlePress = useCallback(
        (btn: string) => {
            if (btn >= "0" && btn <= "9") {
                setDisplay((d) => (fresh ? btn : d === "0" ? btn : d + btn));
                setFresh(false);
            } else if (btn === ".") {
                if (!display.includes(".")) {
                    setDisplay((d) => d + ".");
                    setFresh(false);
                }
            } else if (btn === "C") {
                setDisplay("0");
                setPrev(null);
                setOp(null);
                setFresh(true);
            } else if (btn === "⌫") {
                setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
            } else if (btn === "±") {
                setDisplay((d) => (d.startsWith("-") ? d.slice(1) : d === "0" ? d : "-" + d));
            } else if (btn === "%") {
                setDisplay((d) => String(parseFloat(d) / 100));
            } else if (["÷", "×", "−", "+"].includes(btn)) {
                setPrev(display);
                setOp(btn);
                setFresh(true);
            } else if (btn === "=") {
                if (prev !== null && op !== null) {
                    const a = parseFloat(prev);
                    const b = parseFloat(display);
                    let result = 0;
                    switch (op) {
                        case "+": result = a + b; break;
                        case "−": result = a - b; break;
                        case "×": result = a * b; break;
                        case "÷": result = b !== 0 ? a / b : 0; break;
                    }
                    const str = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
                    setDisplay(str);
                    setPrev(null);
                    setOp(null);
                    setFresh(true);
                }
            }
        },
        [display, prev, op, fresh]
    );

    return (
        <div className="h-full flex flex-col bg-[#0d0d0d] p-3">
            {/* Display */}
            <div className="bg-white/[0.03] rounded-xl p-4 mb-3 text-right border border-white/[0.06]">
                <p className="text-white/30 text-xs h-4 truncate">
                    {prev !== null ? `${prev} ${op}` : ""}
                </p>
                <p className="text-white text-3xl font-light tabular-nums truncate">
                    {display}
                </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-4 gap-1.5 flex-1">
                {BUTTONS.flat().map((btn) => {
                    const isOp = ["÷", "×", "−", "+", "="].includes(btn);
                    const isTop = ["C", "±", "%"].includes(btn);
                    return (
                        <button
                            key={btn}
                            onClick={() => handlePress(btn)}
                            className={cn(
                                "rounded-lg text-lg font-medium transition-all active:scale-95",
                                "flex items-center justify-center",
                                btn === "0" ? "col-span-1" : "",
                                isOp
                                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                    : isTop
                                        ? "bg-white/[0.08] text-white/60 hover:bg-white/[0.12]"
                                        : "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                            )}
                        >
                            {btn}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CalculatorApp;
