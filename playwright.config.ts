import { defineConfig, devices } from "@playwright/test";

const PORT = 3199;
// Next 16 allows one dev server per project. If `pnpm dev` is already running, point the suite at it:
//   E2E_BASE_URL=http://localhost:3000 pnpm test:e2e
const EXTERNAL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: EXTERNAL ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    viewport: { width: 1360, height: 900 },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1360, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: EXTERNAL ? undefined : {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
