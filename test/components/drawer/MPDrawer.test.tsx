import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPDrawer, MPDrawerClose } from 'material-plus-ui';

describe('MPDrawer', () => {
  describe('modal', () => {
    it('is closed until its trigger is pressed', async () => {
      const screen = await render(
        <MPDrawer trigger={<MPButton>Menu</MPButton>} title="Navigation">
          Everything else.
        </MPDrawer>
      );

      expect(document.querySelector('.mp-drawer')).toBeNull();

      await screen.getByRole('button', { name: 'Menu' }).click();

      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
      await expect.element(screen.getByText('Everything else.')).toBeInTheDocument();
    });

    it('names itself with the title, and describes itself with the line under it', async () => {
      await render(
        <MPDrawer open title="Navigation" description="Where everything is">
          Body
        </MPDrawer>
      );
      const panel = document.querySelector('.mp-drawer')!;

      expect(panel).toHaveAttribute('aria-labelledby');
      expect(panel).toHaveAttribute('aria-describedby');
      expect(document.getElementById(panel.getAttribute('aria-labelledby')!)!.textContent).toBe(
        'Navigation'
      );
    });

    it('draws a scrim over the page', async () => {
      await render(
        <MPDrawer open title="Navigation">
          Body
        </MPDrawer>
      );

      expect(document.querySelector('.mp-portal.fixed.inset-0')).not.toBeNull();
    });

    it('carries the × by default, and closes on it', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPDrawer open onOpenChange={onOpenChange} title="Navigation">
          Body
        </MPDrawer>
      );

      await screen.getByRole('button', { name: 'Close' }).click();

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('takes a name of its own for the ×', async () => {
      const screen = await render(
        <MPDrawer open title="Navigation" closeLabel="Hide the menu">
          Body
        </MPDrawer>
      );

      await expect
        .element(screen.getByRole('button', { name: 'Hide the menu' }))
        .toBeInTheDocument();
    });

    it('closes from an action wired with MPDrawerClose', async () => {
      // An uncontrolled drawer has no `setOpen` for its Cancel button to call.
      const screen = await render(
        <MPDrawer
          defaultOpen
          title="Filters"
          actions={<MPDrawerClose render={<MPButton variant="text">Cancel</MPButton>} />}
        >
          Body
        </MPDrawer>
      );

      await screen.getByRole('button', { name: 'Cancel' }).click();

      // `data-closed` rather than removal: the panel is still in the DOM while
      // its opacity travels back to zero, which is the transition working rather
      // than the drawer staying open.
      expect(document.querySelector('.mp-drawer')).toHaveAttribute('data-closed');
    });

    it('refuses to be dismissed when it has to be answered', async () => {
      const onOpenChange = vi.fn();
      await render(
        <MPDrawer open dismissible={false} onOpenChange={onOpenChange} title="Answer me">
          Body
        </MPDrawer>
      );

      await document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(document.querySelector('.mp-drawer')).not.toBeNull();
    });

    it('publishes the rung, the side and the mode it was drawn at', async () => {
      await render(
        <MPDrawer open side="bottom" size="lg" title="Sheet">
          Body
        </MPDrawer>
      );
      const panel = document.querySelector('.mp-drawer')!;

      expect(panel).toHaveAttribute('data-mp-size', 'lg');
      expect(panel).toHaveAttribute('data-mp-side', 'bottom');
      expect(panel).toHaveAttribute('data-mp-mode', 'modal');
    });
  });

  describe('standard', () => {
    it('is in the layout rather than in a portal, and starts open', async () => {
      const screen = await render(
        <MPDrawer mode="standard" title="Navigation">
          Everything else.
        </MPDrawer>
      );

      // In the container, not at the end of `<body>`.
      expect(screen.container.querySelector('.mp-drawer')).not.toBeNull();
      await expect.element(screen.getByText('Everything else.')).toBeInTheDocument();
    });

    it('is not a dialog, and draws no scrim', async () => {
      const screen = await render(
        <MPDrawer mode="standard" title="Navigation">
          Body
        </MPDrawer>
      );

      expect(screen.container.querySelector('[role="dialog"]')).toBeNull();
      expect(document.querySelector('.mp-portal')).toBeNull();
    });

    it('carries no × , because there would be nothing to reopen it', async () => {
      const screen = await render(
        <MPDrawer mode="standard" title="Navigation">
          Body
        </MPDrawer>
      );

      expect(screen.container.querySelectorAll('button')).toHaveLength(0);
    });

    it('takes a × when asked, and reports the press', async () => {
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPDrawer mode="standard" showClose onOpenChange={onOpenChange} title="Navigation">
          Body
        </MPDrawer>
      );

      await screen.getByRole('button', { name: 'Close' }).click();

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders nothing at all when it is closed', async () => {
      // "Closed" for a panel in the flow is "not in the layout".
      const screen = await render(
        <MPDrawer mode="standard" open={false} title="Navigation">
          Body
        </MPDrawer>
      );

      expect(screen.container.querySelector('.mp-drawer')).toBeNull();
    });

    it('closes itself when nobody is driving it', async () => {
      // Uncontrolled, so the × has nothing but the panel's own state to call —
      // without which it is a button that does nothing at all.
      const screen = await render(
        <MPDrawer mode="standard" showClose title="Navigation">
          Body
        </MPDrawer>
      );

      await screen.getByRole('button', { name: 'Close' }).click();

      expect(screen.container.querySelector('.mp-drawer')).toBeNull();
    });

    it('starts closed when defaultOpen says so', async () => {
      const screen = await render(
        <MPDrawer mode="standard" defaultOpen={false} title="Navigation">
          Body
        </MPDrawer>
      );

      expect(screen.container.querySelector('.mp-drawer')).toBeNull();
    });

    it('leaves the panel to its owner while it is controlled', async () => {
      // A controlled panel that closed itself would be a panel disagreeing with
      // the state it was handed.
      const onOpenChange = vi.fn();
      const screen = await render(
        <MPDrawer mode="standard" open showClose onOpenChange={onOpenChange} title="Navigation">
          Body
        </MPDrawer>
      );

      await screen.getByRole('button', { name: 'Close' }).click();

      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.container.querySelector('.mp-drawer')).not.toBeNull();
    });

    it('renders no trigger, because there is nothing to open', async () => {
      const screen = await render(
        <MPDrawer mode="standard" trigger={<MPButton>Menu</MPButton>} title="Navigation">
          Body
        </MPDrawer>
      );

      expect(screen.container.textContent).not.toContain('Menu');
    });
  });

  describe('the panel', () => {
    it('rounds only the edge that faces the page', async () => {
      const screen = await render(
        <MPDrawer mode="standard" side="left" title="Navigation">
          Body
        </MPDrawer>
      );
      const panel = screen.container.querySelector('.mp-drawer')!;

      expect(panel.className).toContain('rounded-r-mp-lg');
      expect(panel.className).toContain('border-r');
    });

    it('squares off when told to', async () => {
      const screen = await render(
        <MPDrawer mode="standard" rounded={false} title="Navigation">
          Body
        </MPDrawer>
      );

      expect(screen.container.querySelector('.mp-drawer')!.className).not.toContain('rounded-r');
    });

    it('takes an extent of its own as a width on a side panel', async () => {
      const screen = await render(
        <MPDrawer mode="standard" extent={280} title="Navigation">
          Body
        </MPDrawer>
      );

      expect((screen.container.querySelector('.mp-drawer') as HTMLElement).style.width).toBe(
        '280px'
      );
    });

    it('takes it as a height on a bottom sheet', async () => {
      const screen = await render(
        <MPDrawer mode="standard" side="bottom" extent="40vh" title="Sheet">
          Body
        </MPDrawer>
      );

      expect((screen.container.querySelector('.mp-drawer') as HTMLElement).style.height).toBe(
        '40vh'
      );
    });

    it('rules the sections when asked', async () => {
      const screen = await render(
        <MPDrawer mode="standard" dividers title="Navigation" actions={<MPButton>Save</MPButton>}>
          Body
        </MPDrawer>
      );

      // Between header and body, and between body and actions.
      expect(screen.container.querySelectorAll('.mp-drawer .border-t')).toHaveLength(2);
    });
  });
});
