import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { _electron as electron, type ElectronApplication, type Page } from '@playwright/test';

export interface Session {
  app: ElectronApplication;
  page: Page;
  /** Everything the page has complained about so far. */
  problems: string[];
}

/**
 * Opens the built app with a profile of its own, and with its window hidden.
 *
 * `MP_HIDDEN` keeps the window off the screen and the app out of the Dock, so a
 * run never takes the focus from whoever is using the machine. Playwright drives
 * the page through the DevTools protocol, which needs neither.
 */
export async function openApp(): Promise<Session> {
  const app = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      MP_HIDDEN: '1',
      MP_USER_DATA: mkdtempSync(join(tmpdir(), 'material-plus-showcase-'))
    } as Record<string, string>
  });
  const page = await app.firstWindow();
  const problems: string[] = [];

  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      const { url } = message.location();

      problems.push(`${message.type()}: ${message.text()}${url ? ` (${url})` : ''}`);
    }
  });

  await page.waitForLoadState('domcontentloaded');

  return { app, page, problems };
}
