import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPDialog, MPDialogClose } from 'material-plus-ui';
import { scaled } from '../../support/style';

function ControlledDialog(props: Record<string, unknown>) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <MPDialog title="Delete project" open={open} onOpenChange={setOpen} {...props}>
        This cannot be undone.
      </MPDialog>
      <output data-testid="model">{String(open)}</output>
    </>
  );
}

describe('MPDialog', () => {
  describe('rendering', () => {
    it('renders a modal dialog named by its title', async () => {
      const screen = await render(
        <MPDialog defaultOpen title="Delete project">
          This cannot be undone.
        </MPDialog>
      );

      await expect
        .element(screen.getByRole('dialog', { name: 'Delete project' }))
        .toBeInTheDocument();
    });

    it('renders the title as the heading that names it', async () => {
      const screen = await render(<MPDialog defaultOpen title="Delete project" />);

      await expect
        .element(screen.getByRole('heading', { level: 2 }))
        .toHaveTextContent('Delete project');
    });

    it('wires the description to the dialog', async () => {
      const screen = await render(
        <MPDialog defaultOpen title="Delete project" description="Everything in it goes too." />
      );
      const dialog = screen.getByRole('dialog').element();
      const described = document.getElementById(dialog.getAttribute('aria-describedby') ?? '');

      expect(described?.textContent).toBe('Everything in it goes too.');
    });

    it('is not on the page until it is opened', async () => {
      const screen = await render(<MPDialog title="Delete project" />);

      expect(screen.getByRole('dialog').query()).toBeNull();
    });

    it('renders the actions it was handed', async () => {
      const screen = await render(
        <MPDialog defaultOpen title="Delete project" actions={<MPButton>Delete</MPButton>} />
      );

      await expect.element(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
  });

  describe('opening and closing', () => {
    it('opens from the trigger it was given', async () => {
      const screen = await render(
        <MPDialog title="Settings" trigger={<MPButton>Open</MPButton>}>
          Body
        </MPDialog>
      );

      expect(screen.getByRole('dialog').query()).toBeNull();

      await screen.getByRole('button', { name: 'Open' }).click();

      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('reports the change to a controlled parent', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPDialog
          defaultOpen
          showClose
          title="Settings"
          closeLabel="Dismiss"
          onOpenChange={onOpenChange}
        />
      );

      await screen.getByRole('button', { name: 'Dismiss' }).click();

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes end to end through a controlled parent', async () => {
      const screen = await render(<ControlledDialog showClose />);

      await screen.getByRole('button', { name: 'Close' }).click();

      expect(screen.getByTestId('model').element().textContent).toBe('false');
    });

    it('dismisses from an MPDialogClose in the actions', async () => {
      // An uncontrolled dialog has no `setOpen` for its Cancel button to call.
      const screen = await render(
        <MPDialog
          defaultOpen
          title="Settings"
          actions={<MPDialogClose render={<MPButton variant="text">Cancel</MPButton>} />}
        />
      );

      await screen.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    });

    it('refuses Escape when it is not dismissible', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPDialog defaultOpen dismissible={false} title="Answer me" onOpenChange={onOpenChange} />
      );

      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
      await screen
        .getByRole('dialog')
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(onOpenChange).not.toHaveBeenCalled();
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('the ×', () => {
    it('is absent on a basic dialog, which MD3 answers with its actions', async () => {
      const screen = await render(<MPDialog defaultOpen title="Settings" />);

      expect(screen.getByRole('button', { name: 'Close' }).query()).toBeNull();
    });

    it('is present on a full-screen one, which has no scrim left to click', async () => {
      const screen = await render(<MPDialog defaultOpen fullScreen title="Settings" />);

      await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('can be asked for explicitly', async () => {
      const screen = await render(<MPDialog defaultOpen showClose title="Settings" />);

      await expect.element(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('the sheet', () => {
    it('caps its width at the specification’s 560dp for md', async () => {
      await render(
        <MPDialog defaultOpen title="Settings">
          Body
        </MPDialog>
      );

      expect(document.querySelector('.mp-dialog')?.className).toContain('max-w-[560px]');
    });

    it('takes a width of its own when the content decides it', async () => {
      await render(
        <MPDialog defaultOpen width={720} title="Settings">
          Body
        </MPDialog>
      );

      const sheet = document.querySelector('.mp-dialog') as HTMLElement;

      expect(sheet.style.maxWidth).toBe('720px');
      expect(sheet.className).not.toContain('max-w-[560px]');
    });

    it('fills the viewport when fullScreen', async () => {
      await render(
        <MPDialog defaultOpen fullScreen title="Settings">
          Body
        </MPDialog>
      );

      const sheet = document.querySelector('.mp-dialog') as HTMLElement;

      expect(sheet.getBoundingClientRect().width).toBeCloseTo(window.innerWidth, 0);
    });

    it('grows in and shrinks back out, faster than it arrived', async () => {
      // MD3's own arrival for a surface that takes the page. The rule the other
      // floating surfaces follow — do not move — is about opening *at* something
      // the reader is aiming for, and a dialog opens at nothing.
      const screen = await render(
        <MPDialog trigger={<MPButton>Open</MPButton>} title="Delete project">
          This cannot be undone.
        </MPDialog>
      );

      await screen.getByRole('button', { name: 'Open' }).click();

      const sheet = document.querySelector('.mp-dialog') as HTMLElement;

      // Smaller than it will be, asserted as that rather than as `0.95`: the
      // grow is 400ms wide and every engine is somewhere different inside it
      // when asked.
      expect(getComputedStyle(sheet).transitionProperty).toBe('opacity, scale');
      expect(scaled(sheet)).toBeLessThan(1);
      expect(getComputedStyle(sheet).transitionDuration).toBe('0.4s');

      await expect.poll(() => getComputedStyle(sheet).scale).toBe('none');

      // The other half of `SHEET_MOTION`: a departure has already said what it
      // had to say, so it is given half the time.
      sheet.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      await expect.poll(() => getComputedStyle(sheet).transitionDuration).toBe('0.2s');
    });

    it('only fades when it is full screen, having no middle to grow from', async () => {
      await render(
        <MPDialog defaultOpen fullScreen title="Settings">
          Body
        </MPDialog>
      );

      const sheet = document.querySelector('.mp-dialog') as HTMLElement;

      expect(getComputedStyle(sheet).scale).toBe('none');
      expect(sheet.className).not.toContain('scale-95');
    });

    it('points the accent slots at the family the hero icon reads', async () => {
      await render(<MPDialog defaultOpen color="error" icon={<span>!</span>} title="Delete" />);

      const sheet = document.querySelector('.mp-dialog') as HTMLElement;

      expect(sheet.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });
  });
});
