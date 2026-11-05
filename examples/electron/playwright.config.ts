import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test',
  timeout: 600_000,
  workers: 1,
  reporter: 'list',
  outputDir: 'test-results'
});
