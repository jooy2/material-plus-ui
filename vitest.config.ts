import { defineConfig } from 'vitest/config';
import ReactPlugin from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(fileURLToPath(import.meta.url));

const SUPPORTED_BROWSERS = ['chromium', 'firefox', 'webkit'] as const;

type SupportedBrowser = (typeof SUPPORTED_BROWSERS)[number];

// Locally we only run Chromium so a plain `npm test` needs a single browser
// installed. CI fans out across all three via the `VITEST_BROWSER` env var,
// which also accepts a comma-separated list.
function resolveBrowsers(): SupportedBrowser[] {
  const requested = process.env.VITEST_BROWSER;

  if (!requested) {
    return ['chromium'];
  }

  const names = requested
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  const unsupported = names.filter(
    (name) => !SUPPORTED_BROWSERS.includes(name as SupportedBrowser)
  );

  if (unsupported.length > 0) {
    throw new Error(
      `Unsupported VITEST_BROWSER value(s): ${unsupported.join(', ')}. ` +
        `Supported browsers are: ${SUPPORTED_BROWSERS.join(', ')}.`
    );
  }

  return names as SupportedBrowser[];
}

export default defineConfig({
  plugins: [ReactPlugin()],
  resolve: {
    alias: {
      // Tests import from 'material-plus-ui' exactly as a consumer would.
      'material-plus-ui': resolve(rootDir, 'src/index.ts')
    }
  },
  test: {
    include: ['test/**/*.test.{ts,tsx}'],
    // One file at a time. Test files run as frames of one browser, and a
    // browser has a single focus to hand out: a click in one file takes it from
    // whichever file was holding it. Focus is half of what a form control does
    // — a password toggle has to leave the caret where it was, and an autofocus
    // assertion is meaningless if another file stole the focus first — so the
    // suite runs serially and stops lying.
    fileParallelism: false,
    // The components are Material UI, which measures real layout (media
    // queries, adornment widths, the notched outline) and composes text through
    // real IME events. Run them in a real browser rather than polyfilling a DOM
    // emulator.
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: resolveBrowsers().map((browser) => ({ browser }))
    }
  }
});
