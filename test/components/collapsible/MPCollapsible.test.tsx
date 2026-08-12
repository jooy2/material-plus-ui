import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPCollapsible } from 'material-plus-ui';

describe('MPCollapsible', () => {
  describe('rendering', () => {
    it('renders the heading on the trigger', async () => {
      const screen = await render(<MPCollapsible title="Advanced">Everything else.</MPCollapsible>);

      await expect.element(screen.getByRole('button', { name: /Advanced/ })).toBeInTheDocument();
    });

    it('renders the subtitle under it', async () => {
      const screen = await render(
        <MPCollapsible title="Advanced" subtitle="Four settings">
          Body
        </MPCollapsible>
      );

      await expect.element(screen.getByText('Four settings')).toBeInTheDocument();
    });

    it('draws the chevron', async () => {
      const screen = await render(<MPCollapsible title="A">Body</MPCollapsible>);

      expect(screen.container.querySelectorAll('.mp-collapsible svg')).toHaveLength(1);
    });

    it('drops the chevron when told to', async () => {
      const screen = await render(
        <MPCollapsible title="A" indicator={false}>
          Body
        </MPCollapsible>
      );

      expect(screen.container.querySelectorAll('.mp-collapsible svg')).toHaveLength(0);
    });

    it('publishes the rung and the variant it was drawn at', async () => {
      const screen = await render(
        <MPCollapsible title="A" size="lg" variant="filled">
          Body
        </MPCollapsible>
      );
      const root = screen.container.querySelector('.mp-collapsible');

      expect(root).toHaveAttribute('data-mp-size', 'lg');
      expect(root).toHaveAttribute('data-mp-variant', 'filled');
    });
  });

  describe('folding', () => {
    it('starts closed, and shows the body once the trigger is pressed', async () => {
      const screen = await render(<MPCollapsible title="Advanced">The detail.</MPCollapsible>);

      expect(screen.container.textContent).not.toContain('The detail.');

      await screen.getByRole('button', { name: /Advanced/ }).click();

      await expect.element(screen.getByText('The detail.')).toBeInTheDocument();
    });

    it('starts open when told to', async () => {
      const screen = await render(
        <MPCollapsible title="Advanced" defaultOpen>
          The detail.
        </MPCollapsible>
      );

      await expect.element(screen.getByText('The detail.')).toBeInTheDocument();
    });

    it('reports every change', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPCollapsible title="Advanced" onOpenChange={onOpenChange}>
          Body
        </MPCollapsible>
      );

      await screen.getByRole('button', { name: /Advanced/ }).click();

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('stays where a controlled caller put it', async () => {
      // `open` with no `onOpenChange` that answers it: the panel must not fold
      // itself, or the prop would be a suggestion rather than a value.
      const screen = await render(
        <MPCollapsible title="Advanced" open>
          The detail.
        </MPCollapsible>
      );

      await screen.getByRole('button', { name: /Advanced/ }).click();

      await expect.element(screen.getByText('The detail.')).toBeInTheDocument();
    });

    it('wires the trigger to the panel it controls', async () => {
      const screen = await render(
        <MPCollapsible title="Advanced" defaultOpen>
          Body
        </MPCollapsible>
      );
      const trigger = screen.container.querySelector('.mp-collapsible button')!;
      const panelId = trigger.getAttribute('aria-controls');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(panelId).toBeTruthy();
      expect(screen.container.querySelector(`#${panelId}`)).not.toBeNull();
    });

    it('stops answering while disabled', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPCollapsible title="Advanced" disabled onOpenChange={onOpenChange}>
          The detail.
        </MPCollapsible>
      );

      expect(screen.container.querySelector('.mp-collapsible button')).toBeDisabled();
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('the header slots', () => {
    it('keeps `action` outside the trigger, so both can be pressed', async () => {
      // A `<button>` inside a `<button>` is markup the browser rewrites on
      // parse, which is why the action is a sibling of the trigger rather than
      // a child of it.
      const onReset = vi.fn();
      const screen = await render(
        <MPCollapsible
          title="Notifications"
          action={
            <MPButton variant="text" onClick={onReset}>
              Reset
            </MPButton>
          }
        >
          Body
        </MPCollapsible>
      );
      const trigger = screen.container.querySelector('.mp-collapsible button')!;

      expect(trigger.textContent).not.toContain('Reset');

      await screen.getByRole('button', { name: 'Reset' }).click();

      expect(onReset).toHaveBeenCalled();
      // Pressing the action must not fold the section it sits on.
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('takes a trigger of its own and hands it the wiring', async () => {
      const screen = await render(
        <MPCollapsible trigger={<MPButton>Show more</MPButton>}>The detail.</MPCollapsible>
      );
      const trigger = screen.getByRole('button', { name: 'Show more' });

      expect(screen.container.textContent).not.toContain('The detail.');
      await trigger.click();

      await expect.element(screen.getByText('The detail.')).toBeInTheDocument();
      expect(screen.container.querySelector('button')).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('the panel', () => {
    it('keeps a closed panel in the DOM when asked', async () => {
      const screen = await render(
        <MPCollapsible title="Advanced" keepMounted>
          The detail.
        </MPCollapsible>
      );

      expect(screen.container.textContent).toContain('The detail.');
      expect(screen.container.querySelector('[hidden]')).not.toBeNull();
    });
  });
});
