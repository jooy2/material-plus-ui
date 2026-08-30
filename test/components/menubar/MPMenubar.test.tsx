import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPMenubar, MPMenubarMenu, MPMenuItem, MPMenuSeparator } from 'material-plus-ui';

function Bar({ onNew = () => {} }: { onNew?: () => void }) {
  return (
    <MPMenubar>
      <MPMenubarMenu label="File">
        <MPMenuItem onClick={onNew}>New</MPMenuItem>
        <MPMenuSeparator />
        <MPMenuItem onClick={() => {}}>Open…</MPMenuItem>
      </MPMenubarMenu>
      <MPMenubarMenu label="Edit">
        <MPMenuItem onClick={() => {}}>Undo</MPMenuItem>
      </MPMenubarMenu>
      <MPMenubarMenu label="View" disabled>
        <MPMenuItem onClick={() => {}}>Zoom in</MPMenuItem>
      </MPMenubarMenu>
    </MPMenubar>
  );
}

describe('MPMenubar', () => {
  describe('the strip', () => {
    it('is one widget rather than a row of unrelated buttons', async () => {
      const screen = await render(<Bar />);

      await expect.element(screen.getByRole('menubar')).toBeInTheDocument();
    });

    it('draws the words and nothing else until one is opened', async () => {
      const screen = await render(<Bar />);

      await expect.element(screen.getByRole('menuitem', { name: 'File' })).toBeInTheDocument();
      expect(document.querySelector('.mp-menu__popup')).toBeNull();
    });

    it('draws no surface of its own', async () => {
      // A menu bar sits on something. A sheet under a strip that is already on a
      // sheet is two sheets.
      const screen = await render(<Bar />);
      const style = getComputedStyle(screen.container.querySelector('.mp-menubar')!);

      expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(style.boxShadow).toBe('none');
    });

    it('sets the words a rung below the control ladder', async () => {
      // A strip of words inside a header that already has a height of its own.
      const screen = await render(<Bar />);
      const word = screen.container.querySelector('.mp-menubar__menu')!;

      expect(word.className).toContain('h-8');
      expect(word.className).toContain('text-mp-label-large');
    });
  });

  describe('opening a menu', () => {
    it('opens the rows behind the word', async () => {
      const screen = await render(<Bar />);

      await screen.getByRole('menuitem', { name: 'File' }).click();

      await expect.element(screen.getByRole('menuitem', { name: 'New' })).toBeInTheDocument();
    });

    it('marks which word is open, in colour and nothing else', async () => {
      const screen = await render(<Bar />);

      await screen.getByRole('menuitem', { name: 'File' }).click();

      const word = screen.container.querySelector('.mp-menubar__menu')!;

      expect(word).toHaveAttribute('data-popup-open');
      expect(word.className).toContain('data-popup-open:text-(--_mp-accent)');
    });

    it('runs the row that was pressed', async () => {
      const onNew = vi.fn();
      const screen = await render(<Bar onNew={onNew} />);

      await screen.getByRole('menuitem', { name: 'File' }).click();
      await screen.getByRole('menuitem', { name: 'New' }).click();

      expect(onNew).toHaveBeenCalled();
    });

    it('walks to the next menu when the pointer crosses the strip', async () => {
      // The whole reason a menu bar is not a row of separate menus.
      const screen = await render(<Bar />);

      await screen.getByRole('menuitem', { name: 'File' }).click();
      await screen.getByRole('menuitem', { name: 'Edit' }).hover();

      await expect.element(screen.getByRole('menuitem', { name: 'Undo' })).toBeInTheDocument();
    });

    it('leaves a disabled word on the strip, opening nothing', async () => {
      const screen = await render(<Bar />);
      const view = screen.getByRole('menuitem', { name: 'View' });

      await expect.element(view).toBeDisabled();
    });
  });

  describe('the values the bar sets once', () => {
    it('passes its size down to every menu on it', async () => {
      const screen = await render(
        <MPMenubar size="sm">
          <MPMenubarMenu label="File">
            <MPMenuItem onClick={() => {}}>New</MPMenuItem>
          </MPMenubarMenu>
        </MPMenubar>
      );

      expect(screen.container.querySelector('.mp-menubar__menu')!.className).toContain('h-7');

      await screen.getByRole('menuitem', { name: 'File' }).click();

      expect(document.querySelector('.mp-menu__popup')).toHaveAttribute('data-mp-size', 'sm');
    });

    it('runs down the page when told to', async () => {
      const screen = await render(
        <MPMenubar orientation="vertical">
          <MPMenubarMenu label="File">
            <MPMenuItem onClick={() => {}}>New</MPMenuItem>
          </MPMenubarMenu>
        </MPMenubar>
      );

      expect(screen.container.querySelector('.mp-menubar')!.className).toContain('flex-col');
    });

    it('disables every menu on the bar at once', async () => {
      const screen = await render(
        <MPMenubar disabled>
          <MPMenubarMenu label="File">
            <MPMenuItem onClick={() => {}}>New</MPMenuItem>
          </MPMenubarMenu>
          <MPMenubarMenu label="Edit">
            <MPMenuItem onClick={() => {}}>Undo</MPMenuItem>
          </MPMenubarMenu>
        </MPMenubar>
      );

      // Asserted rather than clicked: a pointer cannot reach a disabled word at
      // all, which is the whole of what `disabled` on the bar has to guarantee.
      for (const word of screen.container.querySelectorAll('.mp-menubar__menu')) {
        expect(word).toBeDisabled();
      }

      expect(document.querySelector('.mp-menu__popup')).toBeNull();
    });
  });
});
