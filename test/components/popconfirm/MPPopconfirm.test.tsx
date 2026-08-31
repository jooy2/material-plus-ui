import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPLocaleProvider, MPPopconfirm } from 'material-plus-ui';

function Ask(props: Record<string, unknown> = {}) {
  return (
    <MPPopconfirm
      trigger={<MPButton>Delete</MPButton>}
      title="Delete this row?"
      {...(props as { title?: string })}
    />
  );
}

describe('MPPopconfirm', () => {
  describe('asking', () => {
    it('stays shut until the trigger is pressed', async () => {
      const screen = await render(<Ask />);

      expect(screen.getByText('Delete this row?').query()).toBeNull();
    });

    it('opens at the control rather than over the page', async () => {
      const screen = await render(<Ask />);

      await screen.getByRole('button', { name: 'Delete' }).click();

      await expect.element(screen.getByText('Delete this row?')).toBeInTheDocument();
      // A popover, not a dialog: the page behind stays live and there is no
      // scrim to cover the row the reader is pointing at.
      expect(document.querySelector('[role="dialog"][aria-modal="true"]')).toBeNull();
    });
  });

  describe('answering', () => {
    it('calls `onConfirm` for the yes button, and closes', async () => {
      const onConfirm = vi.fn();
      const screen = await render(<Ask onConfirm={onConfirm} />);

      await screen.getByRole('button', { name: 'Delete' }).click();
      await screen.getByRole('button', { name: 'Confirm' }).click();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      await expect.element(screen.getByText('Delete this row?')).not.toBeInTheDocument();
    });

    it('calls `onCancel` for the no button', async () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const screen = await render(<Ask onConfirm={onConfirm} onCancel={onCancel} />);

      await screen.getByRole('button', { name: 'Delete' }).click();
      await screen.getByRole('button', { name: 'Cancel' }).click();

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('counts Escape as no', async () => {
      // The same rule `useMPConfirm` follows: the safe answer to "are you sure"
      // is no, so every other way out is one.
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const screen = await render(<Ask onConfirm={onConfirm} onCancel={onCancel} />);

      await screen.getByRole('button', { name: 'Delete' }).click();
      await expect.element(screen.getByText('Delete this row?')).toBeInTheDocument();

      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
      );

      await expect.element(screen.getByText('Delete this row?')).not.toBeInTheDocument();
      expect(onCancel).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('does not call either one just for opening', async () => {
      // An open is the question being asked; only a close is an answer.
      const onConfirm = vi.fn();
      const onCancel = vi.fn();
      const screen = await render(<Ask onConfirm={onConfirm} onCancel={onCancel} />);

      await screen.getByRole('button', { name: 'Delete' }).click();

      expect(onConfirm).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('what it draws', () => {
    it('takes labels of its own', async () => {
      const screen = await render(<Ask confirmLabel="Delete it" cancelLabel="Keep" />);

      await screen.getByRole('button', { name: 'Delete' }).click();

      await expect.element(screen.getByRole('button', { name: 'Delete it' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });

    it('paints the yes button in the accent it was given', async () => {
      const screen = await render(<Ask color="error" />);

      await screen.getByRole('button', { name: 'Delete' }).click();
      const button = screen.getByRole('button', { name: 'Confirm' }).element() as HTMLElement;

      expect(button.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });

    it('holds a description and anything else it was handed', async () => {
      const screen = await render(
        <MPPopconfirm
          trigger={<MPButton>Delete</MPButton>}
          title="Delete this row?"
          description="It cannot be undone."
        >
          <span data-testid="extra">and this</span>
        </MPPopconfirm>
      );

      await screen.getByRole('button', { name: 'Delete' }).click();

      await expect.element(screen.getByText('It cannot be undone.')).toBeInTheDocument();
      await expect.element(screen.getByTestId('extra')).toBeInTheDocument();
    });

    it('speaks the language in force', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <Ask />
        </MPLocaleProvider>
      );

      await screen.getByRole('button', { name: 'Delete' }).click();

      await expect.element(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  describe('controlled', () => {
    it('opens and closes from outside', async () => {
      function Controlled() {
        const [open, setOpen] = useState(false);

        return (
          <>
            <MPPopconfirm
              trigger={<MPButton>Delete</MPButton>}
              title="Delete this row?"
              open={open}
              onOpenChange={setOpen}
            />
            <output data-testid="open">{String(open)}</output>
          </>
        );
      }

      const screen = await render(<Controlled />);

      await screen.getByRole('button', { name: 'Delete' }).click();
      expect(screen.getByTestId('open').element().textContent).toBe('true');

      await screen.getByRole('button', { name: 'Cancel' }).click();
      expect(screen.getByTestId('open').element().textContent).toBe('false');
    });
  });
});
