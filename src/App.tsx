import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Archive from "./pages/Archive";
import NotFound from "./pages/NotFound";

// The desktop environment is a large, self-contained bundle. It is a
// discovery, not the front door, so it should not be in the initial payload.
const PortfolioV2 = lazy(() => import("./pages/PortfolioV2"));

const DesktopFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-screen items-center justify-center bg-black font-mono text-sm text-white/50"
  >
    Loading desktop…
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/archive" element={<Archive />} />
      <Route
        path="/desktop"
        element={
          <Suspense fallback={<DesktopFallback />}>
            <PortfolioV2 />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
