import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 8463);
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * End-to-end smoke tests run against a real production build served by
 * `vite preview`, so they exercise the same bundle that ships to
 * digitalsoftwaremarket.ai.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --host 127.0.0.1 --strictPort`,
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});
