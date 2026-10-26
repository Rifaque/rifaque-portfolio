import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests run against the built site (npm run build first), served by
 * scripts/serve.mjs, which mirrors production routing. Chromium runs the full
 * suite; Firefox and WebKit run the cross-browser core (tagged @core).
 */
const PORT = 4174;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 4,
  forbidOnly: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "off" },
  webServer: { command: `node scripts/serve.mjs ${PORT}`, url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: false, timeout: 20_000 },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } }, grep: /@core/ },
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } }, grep: /@core/ },
  ],
});
