import { defineConfig, devices } from "@playwright/test";

// Browser tests run against the built, prerendered site: `npm run test:e2e`
// builds first. Specs are *.e2e.ts so Vitest does not collect them.
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4317",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: "node e2e/serve.mjs",
    url: "http://localhost:4317/",
    reuseExistingServer: !process.env.CI,
  },
});
