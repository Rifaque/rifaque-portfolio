import { Navigate, Route, Routes, useLocation } from "react-router";
import { ScrollManager } from "./components/ScrollManager";
import { Layout } from "./components/Layout";
import { routeFor } from "./content/routes";
import Home from "./pages/Home";
import WorkPage from "./pages/WorkPage";
import About from "./pages/About";
import Archive from "./pages/Archive";
import NotFound from "./pages/NotFound";
import "./styles/index.css";

export default function App() {
  const { pathname } = useLocation();
  const route = routeFor(pathname);
  return (
    <>
      <ScrollManager />
      <Layout route={route}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work/:slug" element={<WorkPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/desktop/*" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  );
}
