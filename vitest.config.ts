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
    },
    // Base UI is CommonJS, so Vite pre-bundles it — and a pre-bundled chunk that
    // resolves its own copy of React ends up with a second renderer whose hook
    // dispatcher is null, which surfaces as `Cannot read properties of null
    // (reading 'useId')` the moment a Field mounts. Pinning both to one instance
    // is what keeps the components and the test renderer sharing a React.
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    // Every Base UI entry point a component imports, named up front. Vite
    // pre-bundles CommonJS on discovery, and a discovery that happens *during* a
    // test run reloads the page mid-test — which Vitest reports as a fetch
    // failure for the test file rather than as anything to do with dependencies.
    include: [
      '@base-ui/react/avatar',
      '@base-ui/react/button',
      '@base-ui/react/checkbox',
      '@base-ui/react/field',
      '@base-ui/react/number-field',
      '@base-ui/react/radio',
      '@base-ui/react/radio-group',
      '@base-ui/react/select',
      '@base-ui/react/separator',
      '@base-ui/react/slider',
      '@base-ui/react/switch',
      '@base-ui/react/toggle',
      '@base-ui/react/toggle-group',
      '@base-ui/react/tooltip',
      '@base-ui/react/use-render'
    ]
  },
  test: {
    include: ['test/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
    // One file at a time. Test files run as frames of one browser, and a
    // browser has a single focus to hand out: a click in one file takes it from
    // whichever file was holding it. Focus is half of what a form control does
    // — a password toggle has to leave the caret where it was, and an autofocus
    // assertion is meaningless if another file stole the focus first — so the
    // suite runs serially and stops lying.
    fileParallelism: false,
    // The components measure real layout (media queries, adornment widths, the
    // notched outline) and compose text through real IME events. Run them in a
    // real browser rather than polyfilling a DOM emulator.
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: resolveBrowsers().map((browser) => ({ browser }))
    }
  }
});
