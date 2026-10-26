import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // The repository root is Vite's root, so keep private and local-only
      // material unreachable from the dev server.
      deny: [".env", ".env.*", "*.{crt,pem}", "**/Rifaque_Profile_Knowledge_Base.md", "**/.agents/**", "**/.claude/**", "**/.git/**"],
    },
  },
  build: {
    // Images come from knowledge-base/assets; never inline them into JS.
    assetsInlineLimit: 0,
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
});
