import { defineConfig, devices } from "@playwright/test";
import moment from "moment";
import dotenv from "dotenv";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
dotenv.config();
const playwrightReportFolder = process.env.PLAYWRIGHT_REPORT_FOLDER || "report";
const playwrightOutputFolder =
  process.env.PLAYWRIGHT_OUTPUT_FOLDER || "artifacts";
const reportFolder = `${playwrightReportFolder}/report-${moment().format(
  "YYYY-MM-DD[T]HH-mm-ss",
)}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: playwrightOutputFolder,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  timeout: 10 * 1000,
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "playwright-summary-reporter",
      {
        outputFolder: reportFolder,
        name: "summary.json",
        testMatch: /.*\.spec\.ts/,
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
