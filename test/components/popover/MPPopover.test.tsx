import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPPopover, MPPopoverClose } from 'material-plus-ui';

describe('MPPopover', () => {
  describe('opening', () => {
    it('is closed until its trigger is pressed', async () => {
      const screen = await render(
        <MPPopover trigger={<MPButton>Details</MPButton>} title="Shipping">
          Three to five working days.
        </MPPopover>
      );

      expect(document.querySelector('.mp-popover')).toBeNull();

      await screen.getByRole('button', { name: 'Details' }).click();

      await expect.element(screen.getByText('Three to five working days.')).toBeInTheDocument();
    });

    it('reports every change', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPPopover trigger={<MPButton>Details</MPButton>} onOpenChange={onOpenChange}>
          Body
        </MPPopover>
      );

      await screen.getByRole('button', { name: 'Details' }).click();

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('opens with no trigger at all, for a controlled one', async () => {
      await render(
        <MPPopover open title="Anchored elsewhere">
          Body
        </MPPopover>
      );

      expect(document.querySelector('.mp-popover')).not.toBeNull();
    });
  });

  describe('the header', () => {
    it('names and describes the popup', async () => {
      await render(
        <MPPopover open title="Shipping" description="For this address">
          Body
        </MPPopover>
      );
      const popup = document.querySelector('.mp-popover')!;

      expect(document.getElementById(popup.getAttribute('aria-labelledby')!)!.textContent).toBe(
        'Shipping'
      );
      expect(document.getElementById(popup.getAttribute('aria-describedby')!)!.textContent).toBe(
        'For this address'
      );
    });

    it('draws no header when there is nothing to put in one', async () => {
      const screen = await render(<MPPopover open>Just a body.</MPPopover>);

      await expect.element(screen.getByText('Just a body.')).toBeInTheDocument();
      expect(document.querySelector('.mp-popover button')).toBeNull();
    });

    it('carries no × until asked, and closes on it', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPPopover open showClose onOpenChange={onOpenChange} title="Shipping">
          Body
        </MPPopover>
      );

      await screen.getByRole('button', { name: 'Close' }).click();

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('dismissing', () => {
    it('closes from an action wired with MPPopoverClose', async () => {
      const screen = await render(
        <MPPopover defaultOpen title="Filters">
          <MPPopoverClose render={<MPButton variant="text">Cancel</MPButton>} />
        </MPPopover>
      );

      await screen.getByRole('button', { name: 'Cancel' }).click();

      // Still in the DOM while its opacity travels back to zero.
      expect(document.querySelector('.mp-popover')).toHaveAttribute('data-closed');
    });

    it('refuses Escape when it must not be dismissed', async () => {
      const onOpenChange = vi.fn();
      await render(
        <MPPopover open dismissible={false} onOpenChange={onOpenChange} title="Answer me">
          Body
        </MPPopover>
      );

      await document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(document.querySelector('.mp-popover')).not.toHaveAttribute('data-closed');
    });
  });

  describe('the popup', () => {
    it('publishes the rung it was drawn at', async () => {
      await render(
        <MPPopover open size="xl" title="Shipping">
          Body
        </MPPopover>
      );

      expect(document.querySelector('.mp-popover')).toHaveAttribute('data-mp-size', 'xl');
    });

    it('caps its width off the ladder', async () => {
      await render(
        <MPPopover open size="xs" title="Shipping">
          Body
        </MPPopover>
      );

      expect(document.querySelector('.mp-popover')!.className).toContain('max-w-56');
    });

    it('takes a width of its own as an inline style', async () => {
      // Tailwind finds classes by scanning source text, so a `max-w-[720px]`
      // built from a prop would generate no rule at all.
      await render(
        <MPPopover open width={420} title="Shipping">
          Body
        </MPPopover>
      );
      const popup = document.querySelector('.mp-popover') as HTMLElement;

      expect(popup.style.maxWidth).toBe('420px');
      expect(popup.className).not.toContain('max-w-80');
    });

    it('draws no wedge until asked', async () => {
      const without = await render(
        <MPPopover open title="Shipping">
          Body
        </MPPopover>
      );

      expect(without.container.ownerDocument.querySelectorAll('.mp-popover svg')).toHaveLength(0);
    });

    it('draws one when it is', async () => {
      await render(
        <MPPopover open arrow title="Shipping">
          Body
        </MPPopover>
      );

      expect(document.querySelectorAll('.mp-popover svg').length).toBeGreaterThan(0);
    });
  });
});
