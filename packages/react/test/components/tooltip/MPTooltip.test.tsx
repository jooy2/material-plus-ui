import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPTooltip } from 'material-plus-ui';

describe('MPTooltip', () => {
  describe('the trigger', () => {
    it('adds no element of its own to the layout', async () => {
      // Base UI's trigger merges itself onto the child rather than rendering a
      // box, so the child stays whatever it was.
      const screen = await render(
        <MPTooltip content="Copy">
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      expect(screen.getByRole('button', { name: 'Copy' }).element().tagName).toBe('BUTTON');
    });

    it('is not described by a plate that is not on the page yet', async () => {
      const screen = await render(
        <MPTooltip content="Copy to clipboard">
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      expect(screen.getByRole('button').element()).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('the plate', () => {
    it('is a tooltip, and describes the trigger while it is up', async () => {
      const screen = await render(
        <MPTooltip content="Copy to clipboard" defaultOpen>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );
      const plate = screen.getByRole('tooltip').element();

      expect(plate.textContent).toContain('Copy to clipboard');
      expect(screen.getByRole('button').element()).toHaveAttribute('aria-describedby', plate.id);
    });

    it('reads the inverse surface unless an accent is asked for', async () => {
      // MD3's plain tooltip is the neutral palette read at the other end of the
      // scheme, which is what makes it legible over content it was never
      // designed against.
      const screen = await render(
        <MPTooltip content="Copy" defaultOpen>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );
      const plate = screen.getByRole('tooltip').element() as HTMLElement;

      expect(plate.style.getPropertyValue('--_mp-tooltip')).toBe(
        'var(--_mp-color-inverse-surface)'
      );
      expect(plate.style.getPropertyValue('--_mp-on-tooltip')).toBe(
        'var(--_mp-color-inverse-on-surface)'
      );
    });

    it('takes an accent fill when one is asked for', async () => {
      const screen = await render(
        <MPTooltip content="Deletes everything" color="error" defaultOpen>
          <MPButton>Delete</MPButton>
        </MPTooltip>
      );
      const plate = screen.getByRole('tooltip').element() as HTMLElement;

      expect(plate.style.getPropertyValue('--_mp-tooltip')).toBe('var(--_mp-color-error)');
      expect(plate.style.getPropertyValue('--_mp-on-tooltip')).toBe('var(--_mp-color-on-error)');
    });

    it('draws the wedge by default', async () => {
      const screen = await render(
        <MPTooltip content="Copy" defaultOpen>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      expect(screen.getByRole('tooltip').element().querySelector('svg')).not.toBeNull();
    });

    it('drops the wedge when asked', async () => {
      const screen = await render(
        <MPTooltip content="Copy" arrow={false} defaultOpen>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      expect(screen.getByRole('tooltip').element().querySelector('svg')).toBeNull();
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPTooltip content="Copy" className="my-own-class" defaultOpen>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );
      const plate = screen.getByRole('tooltip').element();

      expect(plate).toHaveClass('my-own-class');
      expect(plate).toHaveClass('mp-tooltip');
    });
  });

  describe('open state', () => {
    it('stays shut until asked, when controlled', async () => {
      const screen = await render(
        <MPTooltip content="Copy" open={false}>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      expect(screen.getByRole('tooltip').query()).toBeNull();
    });

    it('opens when the controlled value says so', async () => {
      const screen = await render(
        <MPTooltip content="Copy" open>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      expect(screen.getByRole('tooltip').query()).not.toBeNull();
    });

    it('reports a change on hover', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPTooltip content="Copy" delay={0} onOpenChange={onOpenChange}>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      await screen.getByRole('button').hover();

      await expect.poll(() => onOpenChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('never opens while disabled', async () => {
      const screen = await render(
        <MPTooltip content="Copy" delay={0} disabled>
          <MPButton>Copy</MPButton>
        </MPTooltip>
      );

      await screen.getByRole('button').hover();

      expect(screen.getByRole('tooltip').query()).toBeNull();
      // The trigger itself is untouched — this stops the tooltip, not the
      // button.
      expect(screen.getByRole('button').element()).not.toBeDisabled();
    });
  });
});
