import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { openApp, type Session } from './support';

let session: Session;
let page: Page;

test.beforeAll(async () => {
  session = await openApp();
  page = session.page;
});

test.afterAll(async () => {
  await session.app.close();
});

test.afterEach(() => {
  expect(session.problems.splice(0)).toEqual([]);
});

async function go(name: string) {
  await page.getByRole('navigation', { name: 'Main' }).getByText(name, { exact: true }).click();
}

const shot = (name: string) => page.screenshot({ path: `shots/app/${name}.png` });

test('loads from its own scheme with the sandbox on', async () => {
  expect(page.url()).toMatch(/^mp:\/\/app\//);
  expect(await page.evaluate(() => typeof window.desktop?.setTheme)).toBe('function');
  expect(await page.evaluate(() => 'require' in window)).toBe(false);
});

test('never shows its window or takes the focus', async () => {
  const state = await session.app.evaluate(({ app, BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0];

    return {
      visible: window.isVisible(),
      focused: window.isFocused(),
      focusedWindow: BrowserWindow.getFocusedWindow() !== null,
      dock: app.dock?.isVisible() ?? false
    };
  });

  expect(state).toEqual({ visible: false, focused: false, focusedWindow: false, dock: false });
  // Hidden but still drawing, which is what `backgroundThrottling: false` is for.
  expect(await page.evaluate(() => document.visibilityState)).toBe('visible');
});

for (const name of ['Dashboard', 'Showcase', 'Sign-up', 'Landing']) {
  test(`${name} draws`, async () => {
    await go(name);
    await expect(page.locator('main').locator('*').first()).toBeVisible();
    await page.waitForTimeout(600);
    await shot(name.toLowerCase());
  });
}

test('Inbox searches, filters and sends', async () => {
  await go('Inbox');

  const search = page.getByRole('searchbox', { name: 'Search', exact: true });

  await search.fill('invoice');
  await expect(page.getByRole('button', { name: /Theo Quinn/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Anya Sol/ })).toHaveCount(0);
  await search.fill('nobody');
  await expect(page.getByText('Nothing found')).toBeVisible();
  await page.getByRole('button', { name: 'Clear the search' }).click();
  await page.getByRole('button', { name: 'Unread', exact: true }).click();
  await expect(page.getByRole('button', { name: /Theo Quinn/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'All', exact: true }).click();

  await page.getByRole('button', { name: /Anya Sol/ }).click();
  await expect(page.getByText('Can we move the review to Thursday afternoon?')).toBeVisible();
  await page.getByRole('textbox', { name: 'Reply' }).fill('Thursday works');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Thursday works')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Reply' })).toHaveValue('');
  await shot('inbox');
});

test.describe('Overlays', () => {
  test.beforeAll(() => go('Overlays'));

  for (const [name, inside] of [
    ['Dialog', 'Rename project'],
    ['Drawer', 'Filters'],
    ['Popover', 'Effective rate'],
    ['Menu', 'Copy link']
  ]) {
    test(`${name} opens and closes`, async () => {
      await page.getByRole('button', { name, exact: true }).click();
      await expect(page.getByText(inside, { exact: true })).toBeVisible();
      await page.waitForTimeout(350);
      await shot(`overlay-${name.toLowerCase()}`);
      await page.keyboard.press('Escape');
      await expect(page.getByText(inside, { exact: true })).toHaveCount(0);
    });
  }

  test('Menu opens a submenu from the keyboard', async () => {
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Share' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'Email' })).toBeVisible();
    await shot('overlay-submenu');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Email' })).toHaveCount(0);
  });

  test('Menubar walks from one menu to the next', async () => {
    await page.getByRole('menuitem', { name: 'File' }).click();
    await expect(page.getByRole('menuitem', { name: 'Open…' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'View' }).hover();
    await expect(page.getByRole('menuitemcheckbox', { name: 'Rulers' })).toBeVisible();
    await page.getByRole('menuitemradio', { name: 'Actual size' }).click();
    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    await shot('overlay-menubar');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitemradio', { name: 'Actual size' })).toHaveCount(0);
  });

  test('Tooltip and hover card show on hover', async () => {
    await page.getByRole('button', { name: 'Tooltip', exact: true }).hover();
    await expect(page.getByText('Saved two minutes ago')).toBeVisible();
    await shot('overlay-tooltip');
    await page.getByRole('button', { name: 'Hover card', exact: true }).hover();
    await expect(page.getByText('Owns the deployment pipeline.')).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByText('Owns the deployment pipeline.')).toHaveCount(0);
  });

  test('Popconfirm, snackbar and confirm', async () => {
    await page.getByRole('button', { name: 'Popconfirm', exact: true }).click();
    await expect(page.getByText('Archive this thread?')).toBeVisible();
    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    await expect(page.getByText('Archived', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Snackbar', exact: true }).click();
    await expect(page.getByText('Your changes are live.')).toBeVisible();
    await shot('overlay-snackbar');
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    await expect(page.getByText('Undone', { exact: true })).toBeVisible();
    await expect(page.getByText('Your changes are live.')).toHaveCount(0);

    await page.getByRole('button', { name: 'Confirm', exact: true }).click();
    await expect(page.getByText('Delete this project?')).toBeVisible();
    await shot('overlay-confirm');
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText('Deleted', { exact: true })).toBeVisible();
  });

  test('Command palette filters and runs a command', async () => {
    await page.getByRole('button', { name: 'Command palette' }).click();
    await page.keyboard.type('invite');
    await expect(page.getByText('Invite a colleague')).toBeVisible();
    await shot('overlay-palette');
    // Nothing is lit until an arrow or the pointer lights a row.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Ran Invite a colleague')).toBeVisible();
  });

  test('Tour walks its steps', async () => {
    await page.getByRole('button', { name: 'Tour', exact: true }).click();
    await expect(page.getByText('Everything on this screen floats over the window.')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Each opens a different kind of surface.')).toBeVisible();

    // The card hangs under the step's target, not where the first step put it.
    await expect
      .poll(async () => {
        const target = (await page.locator('#overlay-buttons').boundingBox())!;
        const card = (await page.locator('.mp-tour').boundingBox())!;

        return Math.round(card.y - (target.y + target.height));
      })
      .toBe(10);
    await shot('overlay-tour');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.getByText('This area opens a menu of its own.')).toHaveCount(0);
  });

  test('Overlay waits and lifts', async () => {
    await page.getByRole('button', { name: 'Overlay', exact: true }).click();
    await expect(page.getByText('Publishing your changes…')).toBeVisible();
    await expect(page.getByText('Publishing your changes…')).toHaveCount(0, { timeout: 5000 });
  });

  test('Select picks from its popup', async () => {
    await page.getByRole('combobox', { name: 'Size' }).click();
    await page.getByRole('option', { name: 'Large' }).click();
    await expect(page.getByRole('combobox', { name: 'Size' })).toContainText('Large');
  });

  test('Context menu opens on a right-click', async () => {
    await page.getByText('Right-click here').click({ button: 'right' });
    await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeVisible();
    await shot('overlay-context');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toHaveCount(0);
  });
});

test('Desktop reads paths, highlights code from a lazy chunk and copies it', async () => {
  await go('Desktop');

  // A real file, so the preload has a path on the disk to report.
  const folder = mkdtempSync(join(tmpdir(), 'material-plus-files-'));
  const file = join(folder, 'notes.txt');

  writeFileSync(file, 'Material Plus');
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole('list', { name: 'Paths' })).toContainText(file);

  await expect(page.locator('.hljs-keyword').first()).toBeVisible();
  await shot('desktop');

  await page.getByRole('button', { name: 'Copy' }).first().click();
  // What the page reports needs the permission the main process grants.
  await expect(page.getByRole('button', { name: 'Copied' }).first()).toBeVisible();

  // On Linux the run is on a virtual display, where the main process reads the
  // clipboard back empty.
  if (process.platform !== 'linux') {
    await expect
      .poll(() => session.app.evaluate(({ clipboard }) => clipboard.readText()))
      .toContain('MPButton');
  }
});

test('Settings changes the theme natively, the direction, the density and the language', async () => {
  await go('Settings');
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mp-scheme', 'dark');
  expect(await session.app.evaluate(({ nativeTheme }) => nativeTheme.themeSource)).toBe('dark');
  await page.waitForTimeout(200);
  await shot('settings-dark');

  await page.getByRole('switch', { name: 'Right to left' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.waitForTimeout(400);
  await shot('settings-rtl');

  // The indicator is measured, so it is the part of the bar a change of
  // direction can leave behind. What is compared is the measurement it slides
  // to, not where it is now: the slide is a transition, and a hidden window on
  // a virtual display does not always draw the frames that run one.
  const offset = await page.evaluate(() => {
    const indicator = document.querySelector<HTMLElement>('.mp-tabs__indicator')!;
    const list = indicator.parentElement!;
    const tab = list.querySelector('[role="tab"][aria-selected="true"]')!;
    const measured = parseFloat(getComputedStyle(indicator).getPropertyValue('--active-tab-left'));

    return Math.abs(
      tab.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - measured
    );
  });

  expect(offset).toBeLessThan(2);

  const calendar = page.locator('.mp-date-picker__popup');

  await page.getByRole('button', { name: 'Due' }).click();
  await expect(calendar).toBeVisible();
  await page.waitForTimeout(300);
  await shot('settings-rtl-date');
  await page.keyboard.press('Escape');
  await expect(calendar).toHaveCount(0);

  await page.getByRole('button', { name: '-2', exact: true }).click();
  await page.getByRole('combobox', { name: 'Language of the built-in labels' }).click();
  await page.getByRole('option', { name: '한국어' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await page.waitForTimeout(200);
  await shot('settings-ko-compact');

  await go('Overlays');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.waitForTimeout(300);
  await shot('overlay-menu-rtl-dark');
  await page.keyboard.press('Escape');

  await go('Settings');
  await page.getByRole('switch', { name: 'Right to left' }).click();
  await page.getByRole('button', { name: '0', exact: true }).click();
  await page.getByRole('button', { name: 'System', exact: true }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-mp-scheme', /./);
  expect(await session.app.evaluate(({ nativeTheme }) => nativeTheme.themeSource)).toBe('system');
});
