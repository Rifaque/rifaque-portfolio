import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Entrance animations hide their content until they run. Only opt into that
// once we know JS is executing, so a broken bundle degrades to plain content.
document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(<App />);
