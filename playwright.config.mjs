// QA harness configuration — see qa/README.md
import { defineConfig, devices } from '@playwright/test';

const PORT = 8080;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'qa/tests',
  outputDir: 'qa/test-results',
  fullyParallel: true,
  workers: isCI ? 2 : 4,
  retries: 1, // python http.server occasionally refuses a connection under 4 parallel workers
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'qa/report', open: 'never' }],
    ['json', { outputFile: 'qa/results.json' }],
  ],
  webServer: {
    command: `${process.platform === 'win32' ? 'python' : 'python3'} -m http.server ${PORT}`,
    url: `http://localhost:${PORT}/index.html`,
    reuseExistingServer: !isCI,
    timeout: 30_000,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    locale: 'en-US',
  },
  projects: [
    // Chromium across the four viewport classes
    { name: 'chromium-mobile',  use: { ...devices['Pixel 7'] } },
    { name: 'chromium-tablet',  use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 }, hasTouch: true } },
    { name: 'chromium-laptop',  use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    // Other engines at the two viewports that matter most
    { name: 'firefox-laptop',   use: { ...devices['Desktop Firefox'], viewport: { width: 1366, height: 768 } } },
    { name: 'webkit-mobile',    use: { ...devices['iPhone 14'] } },
    { name: 'webkit-laptop',    use: { ...devices['Desktop Safari'], viewport: { width: 1366, height: 768 } } },
  ],
});
