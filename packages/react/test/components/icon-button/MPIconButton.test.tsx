import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { ICONS, MPButtonGroup, MPIcon, MPIconButton } from 'material-plus-ui';

describe('MPIconButton', () => {
  describe('the name', () => {
    it('is what the button is found by, because the glyph says nothing', async () => {
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.close} />} label="Dismiss" />
      );

      await expect.element(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });

    it('is announced rather than drawn', async () => {
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.close} />} label="Dismiss" />
      );

      expect(screen.getByRole('button').element().textContent).toBe('');
    });
  });

  describe('what it borrows from MPButton', () => {
    it('is a circle: the square footprint of an icon-only button at a pill radius', async () => {
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.search} />} label="Search" />
      );
      const button = screen.getByRole('button').element();
      const { width, height, borderTopLeftRadius } = getComputedStyle(button);

      expect(width).toBe(height);
      // `corner-full` is a length rather than a percentage, so it comes back as
      // the token's own 9999px clamped to half the box.
      expect(Number.parseFloat(borderTopLeftRadius)).toBeGreaterThan(1000);
    });

    it('starts on the standard variant, which is MD3 default and not the button one', async () => {
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.more} />} label="More" />
      );

      expect(screen.getByRole('button').element()).toHaveAttribute('data-mp-variant', 'text');
    });

    it('takes a louder variant when the icon is the action on the screen', async () => {
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.add} />} label="Add" variant="filled" />
      );

      expect(screen.getByRole('button').element()).toHaveAttribute('data-mp-variant', 'filled');
    });

    it('walks the size ladder', async () => {
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.add} />} label="Add" size="xs" />
      );

      expect(screen.getByRole('button').element()).toHaveAttribute('data-mp-size', 'xs');
    });

    it('swallows the click while loading, and stays focusable', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.add} />} label="Add" loading onClick={onClick} />
      );
      const element = screen.getByRole('button').element() as HTMLButtonElement;

      // Clicked directly rather than through the driver: the driver refuses to
      // click anything carrying `aria-disabled`, which is exactly the attribute
      // under test.
      element.click();

      expect(onClick).not.toHaveBeenCalled();
      expect(element).not.toHaveAttribute('disabled');
      expect(element).toHaveAttribute('aria-busy', 'true');
    });

    it('takes what a surrounding group sets', async () => {
      const screen = await render(
        <MPButtonGroup size="sm" color="error">
          <MPIconButton icon={<MPIcon icon={ICONS.remove} />} label="Remove" />
        </MPButtonGroup>
      );

      expect(screen.getByRole('button').element()).toHaveAttribute('data-mp-size', 'sm');
    });

    it('fires like any other button', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPIconButton icon={<MPIcon icon={ICONS.copy} />} label="Copy" onClick={onClick} />
      );

      await screen.getByRole('button', { name: 'Copy' }).click();

      expect(onClick).toHaveBeenCalled();
    });
  });
});
