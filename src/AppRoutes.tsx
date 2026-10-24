import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import WorkPage from "./pages/WorkPage";
import Archive from "./pages/Archive";
import NotFound from "./pages/NotFound";
import { LabPage, labLoaded } from "./labRoute";

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
      <Route
        path="/lab"
        element={
          // Suspends only on a client-side visit before the chunk has loaded
          // (see labRoute.ts for why a loaded lab has no boundary).
          labLoaded() ? (
            <LabPage />
          ) : (
            <Suspense fallback={null}>
              <LabPage />
            </Suspense>
          )
        }
      />
      <Route path="/desktop/*" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
