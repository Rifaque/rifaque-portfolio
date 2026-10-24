import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ isSsrBuild }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  build: {
    // The prerender reads it to link lazy routes' stylesheets, then deletes it.
    manifest: !isSsrBuild,
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            // Split the slow-moving vendor code so a content edit does not
            // invalidate the whole cached payload.
            manualChunks: {
              react: ["react", "react-dom", "react-router-dom"],
            },
          },
        },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
