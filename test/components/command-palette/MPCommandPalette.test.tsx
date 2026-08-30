import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPCommandPalette } from 'material-plus-ui';
import type { MPCommand } from 'material-plus-ui';

const COMMANDS: MPCommand[] = [
  { value: 'new', label: 'New document', group: 'File', shortcut: 'Mod+N' },
  { value: 'open', label: 'Open…', group: 'File', keywords: ['load'] },
  { value: 'copy', label: 'Copy', group: 'Edit', description: 'The selection' },
  { value: 'paste', label: 'Paste', group: 'Edit', disabled: true }
];

describe('MPCommandPalette', () => {
  describe('the sheet', () => {
    it('is out of the document until it is opened', async () => {
      await render(<MPCommandPalette items={COMMANDS} shortcut={false} />);

      expect(document.querySelector('.mp-command-palette')).toBeNull();
    });

    it('is a dialog with a name, because it has no visible title to take one from', async () => {
      const screen = await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />
      );

      await expect
        .element(screen.getByRole('dialog', { name: 'Command palette' }))
        .toBeInTheDocument();
    });

    it('names itself in the language it was told to', async () => {
      const screen = await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} locale="ko" />
      );

      await expect.element(screen.getByRole('dialog', { name: '명령 팔레트' })).toBeInTheDocument();
    });

    it('draws MD3’s search view: surface-container-high at corner-extra-large', async () => {
      await render(<MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />);
      const sheet = document.querySelector('.mp-command-palette')!;

      expect(sheet.className).toContain('bg-mp-surface-container-high');
      expect(sheet.className).toContain('rounded-mp-xl');
      expect(sheet.className).toContain('shadow-mp-3');
    });
  });

  describe('the list', () => {
    it('draws every command, with its group above the first of each run', async () => {
      const screen = await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />
      );
      const list = document.querySelector('.mp-command-palette__list')!;
      const headings = [...list.querySelectorAll('[role="presentation"]')];

      expect(headings.map((heading) => heading.textContent)).toEqual(['File', 'Edit']);
      await expect
        .element(screen.getByRole('option', { name: /New document/ }))
        .toBeInTheDocument();
    });

    it('shows the keystroke that does the same thing, without binding it', async () => {
      await render(<MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />);
      const row = document.querySelector('.mp-command-palette__row')!;

      expect(row.querySelector('.mp-shortcut')).not.toBeNull();
    });

    it('narrows on the query, and matches keywords nobody drew', async () => {
      const screen = await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />
      );

      await screen.getByRole('combobox').fill('load');

      const rows = [...document.querySelectorAll('.mp-command-palette__row')];

      expect(rows).toHaveLength(1);
      expect(rows[0]!.textContent).toContain('Open…');
    });

    it('says so when nothing matched', async () => {
      const screen = await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />
      );

      await screen.getByRole('combobox').fill('nothing like this');

      await expect.element(screen.getByText('No commands found')).toBeInTheDocument();
    });

    it('matches the group as well as the label', async () => {
      const screen = await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} />
      );

      await screen.getByRole('combobox').fill('edit');

      expect([...document.querySelectorAll('.mp-command-palette__row')]).toHaveLength(2);
    });
  });

  describe('running a command', () => {
    it('calls the command’s own handler, then the palette’s, then closes', async () => {
      const onSelect = vi.fn();
      const own = vi.fn();
      const items: MPCommand[] = [{ value: 'new', label: 'New document', onSelect: own }];
      const screen = await render(
        <MPCommandPalette items={items} defaultOpen shortcut={false} onSelect={onSelect} />
      );

      await screen.getByRole('option', { name: 'New document' }).click();

      expect(own).toHaveBeenCalled();
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'new' }));
      await expect.poll(() => document.querySelector('.mp-command-palette')).toBeNull();
    });

    it('leaves a disabled command alone', async () => {
      const onSelect = vi.fn();
      await render(
        <MPCommandPalette items={COMMANDS} defaultOpen shortcut={false} onSelect={onSelect} />
      );
      const row = [...document.querySelectorAll('.mp-command-palette__row')].find((candidate) =>
        candidate.textContent?.includes('Paste')
      ) as HTMLElement;

      expect(row).toHaveAttribute('aria-disabled', 'true');

      // Dispatched straight at the element: a pointer cannot reach a disabled
      // row at all, and what is being tested is that the handler bails even if
      // something else gets a click through.
      row.click();

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('the key that opens it', () => {
    it('binds Mod+K on the window by default', async () => {
      await render(<MPCommandPalette items={COMMANDS} />);

      expect(document.querySelector('.mp-command-palette')).toBeNull();

      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true })
      );

      await expect.poll(() => document.querySelector('.mp-command-palette')).not.toBeNull();
    });

    it('binds nothing at all when told not to', async () => {
      await render(<MPCommandPalette items={COMMANDS} shortcut={false} />);

      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true })
      );

      expect(document.querySelector('.mp-command-palette')).toBeNull();
    });

    it('ignores the same key without its modifier', async () => {
      await render(<MPCommandPalette items={COMMANDS} />);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }));

      expect(document.querySelector('.mp-command-palette')).toBeNull();
    });
  });

  it('drops the query on the way out, so the sheet never flashes the last search', async () => {
    const screen = await render(<MPCommandPalette items={COMMANDS} defaultOpen />);

    await screen.getByRole('combobox').fill('copy');
    await screen.getByRole('option', { name: /Copy/ }).click();

    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true })
    );

    await expect.poll(() => document.querySelector('.mp-command-palette')).not.toBeNull();
    await expect.element(screen.getByRole('combobox')).toHaveValue('');
  });

  describe('what the query is matched against', () => {
    /*
     * The parts a command answers to are folded into one string once per `items`
     * rather than per keystroke, and joined with a newline rather than a space
     * so that a query cannot match across the seam between two of them: `copy
     * link` should not find a command called *Copy* that happens to be tagged
     * *link*.
     */
    it('does not match across the seam between a label and a keyword', async () => {
      const screen = await render(
        <MPCommandPalette
          defaultOpen
          items={[{ value: 'copy', label: 'Copy', keywords: ['link'] }]}
        />
      );

      await screen.getByRole('combobox').fill('copy link');

      expect(screen.getByText('Copy').query()).toBeNull();
    });
  });
});
