import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import WorkPage from "./pages/WorkPage";
import Archive from "./pages/Archive";
import NotFound from "./pages/NotFound";
import LabPage from "./lab/LabPage";

/**
 * Every route here must have an entry in src/content/routes.ts; the build
 * checks enforce it. /desktop is retired: Vercel answers it with a 308 to /,
 * and this client-side redirect only covers the dev server.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/work/:slug" element={<WorkPage />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/lab" element={<LabPage />} />
      <Route path="/desktop/*" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
