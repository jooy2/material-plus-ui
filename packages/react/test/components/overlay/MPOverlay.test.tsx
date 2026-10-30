import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPOverlay, MPProgressCircular } from 'material-plus-ui';

describe('MPOverlay', () => {
  describe('rendering', () => {
    it('names itself even when it holds nothing readable', async () => {
      // The one default label in the library, and this is why: a bare spinner on
      // a scrim would otherwise be a modal region announced as nothing at all.
      const screen = await render(
        <MPOverlay open>
          <MPProgressCircular />
        </MPOverlay>
      );

      await expect.element(screen.getByRole('dialog', { name: 'Overlay' })).toBeInTheDocument();
    });

    it('takes a name of its own', async () => {
      const screen = await render(<MPOverlay open label="Saving your work" />);

      await expect
        .element(screen.getByRole('dialog', { name: 'Saving your work' }))
        .toBeInTheDocument();
    });

    it('is not on the page until it is opened', async () => {
      const screen = await render(<MPOverlay label="Saving" />);

      expect(screen.getByRole('dialog').query()).toBeNull();
    });

    it('renders what it was handed on top of the scrim', async () => {
      const screen = await render(
        <MPOverlay open>
          <span>Saving…</span>
        </MPOverlay>
      );

      await expect.element(screen.getByText('Saving…')).toBeInTheDocument();
    });
  });

  describe('tone', () => {
    it('draws MD3’s scrim by default', async () => {
      await render(<MPOverlay open />);

      const backdrop = document.querySelector('.mp-portal.fixed') as HTMLElement;

      expect(backdrop.className).toContain('bg-mp-scrim/32');
    });

    it('draws nothing at all for clear, and still covers the viewport', async () => {
      // The whole reason to reach for it: an invisible sheet that catches a
      // click.
      await render(<MPOverlay open tone="clear" />);

      const backdrop = document.querySelector('.mp-portal.fixed') as HTMLElement;

      expect(getComputedStyle(backdrop).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      expect(backdrop.getBoundingClientRect().width).toBeCloseTo(window.innerWidth, 0);
    });

    it('paints the page’s own surface for solid', async () => {
      await render(<MPOverlay open tone="solid" />);

      const backdrop = document.querySelector('.mp-portal.fixed') as HTMLElement;

      expect(backdrop.className).toContain('bg-mp-surface');
      expect(getComputedStyle(backdrop).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  describe('dismissing', () => {
    it('refuses Escape by default, because an overlay is not asking anything', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(<MPOverlay open onOpenChange={onOpenChange} />);

      screen
        .getByRole('dialog')
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(onOpenChange).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('answers Escape once it is dismissible', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(<MPOverlay open dismissible onOpenChange={onOpenChange} />);

      screen
        .getByRole('dialog')
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      await vi.waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    });
  });
});
