import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { openApp } from './support';

const root = fileURLToPath(new URL('../../../docs/.vitepress/demos', import.meta.url));

// The same folders and helpers `src/screens/Components.tsx` leaves out.
const skipped = new Set(['color', 'concepts', 'gallery', 'home', 'hooks', 'showcase']);

const names = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !skipped.has(entry.name))
  .flatMap((entry) =>
    readdirSync(`${root}/${entry.name}`)
      .filter((file) => file.endsWith('.tsx') && file !== 'glyphs.tsx')
      .map((file) => `${entry.name}/${file.replace(/\.tsx$/, '')}`)
  );

test('every demo renders in Electron without a complaint', async () => {
  const { app, page, problems } = await openApp();
  const failures: Record<string, string[]> = {};

  for (const name of names) {
    // Away and back, so each demo mounts fresh rather than reusing the last one's state.
    await page.evaluate((hash) => {
      location.hash = hash;
    }, '#/settings');
    await page.evaluate((hash) => {
      location.hash = hash;
    }, `#/components/${name}`);
    await page.waitForFunction(
      () => (document.querySelector('[data-testid="demo"]')?.childElementCount ?? 0) > 0
    );
    await page.waitForTimeout(120);

    if (process.env.MP_SHOTS) {
      await page.screenshot({ path: `shots/demos/${name.replace('/', '__')}.png` });
    }

    // The image and avatar demos load a picture that is not there, on purpose,
    // to show what is drawn in its place.
    const found = problems.splice(0).filter((text) => !/this-file-does-not-exist\.png/.test(text));

    if (found.length > 0) {
      failures[name] = found;
    }
  }

  await app.close();
  mkdirSync('shots', { recursive: true });
  writeFileSync('shots/demos.json', JSON.stringify(failures, null, 2));
  expect(failures).toEqual({});
});
