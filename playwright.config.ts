import { defineConfig, devices } from "@playwright/test";

/**
 * E2E 配置：
 *   - 密码从 E2E_TEST_PASSWORD 环境变量读取（web/.env.e2e，gitignore）
 *   - 数据库操作需 ALLOW_PRODUCTION_E2E=1 显式 opt-in
 *   - JSON 报告落盘（gitignore）；文件名经 E2E_REPORT_FILE 覆盖
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: process.env.E2E_REPORT_FILE ?? "e2e-report.json" }],
  ],
  outputDir: "./test-results",
  use: {
    baseURL: "http://localhost:3100",
    trace: "off",
    screenshot: "off",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npx next dev -p 3100",
    port: 3100,
    timeout: 120_000,
    reuseExistingServer: false,
    stdout: "ignore",
    stderr: "ignore",
  },
});
