import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPConfirmProvider, MPLocaleProvider, useMPConfirm } from 'material-plus-ui';
import type { MPConfirmOptions } from 'material-plus-ui';

/**
 * Every test drives the whole round trip — press, question, answer, promise —
 * because that is the thing this exists to provide. Asserting that a dialog
 * appeared would be asserting on `MPDialog`, which has its own file.
 */
function Asker({
  options = { title: 'Delete this?' },
  kind = 'confirm'
}: {
  options?: MPConfirmOptions;
  kind?: 'confirm' | 'alert';
}) {
  const { confirm, alert } = useMPConfirm();
  const [answer, setAnswer] = useState<string>('none');

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (kind === 'alert') {
            await alert(options);
            setAnswer('acknowledged');

            return;
          }

          setAnswer(String(await confirm(options)));
        }}
      >
        ask
      </button>
      <output data-testid="answer">{answer}</output>
    </>
  );
}

function Wrapped(props: React.ComponentProps<typeof Asker> = {}) {
  return (
    <MPConfirmProvider>
      <Asker {...props} />
    </MPConfirmProvider>
  );
}

describe('useMPConfirm', () => {
  describe('the round trip', () => {
    it('resolves `true` when the confirm button is pressed', async () => {
      const screen = await render(<Wrapped />);

      await screen.getByRole('button', { name: 'ask' }).click();
      await screen.getByRole('button', { name: 'Confirm' }).click();

      await expect.element(screen.getByTestId('answer')).toHaveTextContent('true');
    });

    it('resolves `false` when cancel is pressed', async () => {
      const screen = await render(<Wrapped />);

      await screen.getByRole('button', { name: 'ask' }).click();
      await screen.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(screen.getByTestId('answer')).toHaveTextContent('false');
    });

    it('resolves `false` on Escape', async () => {
      // Every other way out is `no`, so a caller writes one `if` and not a
      // `try` plus a default.
      const screen = await render(<Wrapped />);

      await screen.getByRole('button', { name: 'ask' }).click();
      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();

      await screen
        .getByRole('dialog')
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      await expect.element(screen.getByTestId('answer')).toHaveTextContent('false');
    });

    it('closes the dialog once it has been answered', async () => {
      const screen = await render(<Wrapped />);

      await screen.getByRole('button', { name: 'ask' }).click();
      await screen.getByRole('button', { name: 'Confirm' }).click();

      await expect.element(screen.getByRole('dialog')).not.toBeInTheDocument();
    });

    it('never rejects', async () => {
      const onRejection = vi.fn();
      window.addEventListener('unhandledrejection', onRejection);

      const screen = await render(<Wrapped />);

      await screen.getByRole('button', { name: 'ask' }).click();
      await screen.getByRole('button', { name: 'Cancel' }).click();

      expect(onRejection).not.toHaveBeenCalled();
      window.removeEventListener('unhandledrejection', onRejection);
    });
  });

  describe('what it draws', () => {
    it('asks the question it was given', async () => {
      const screen = await render(
        <Wrapped
          options={{
            title: 'Delete this project?',
            description: 'Everything in it goes too.'
          }}
        />
      );

      await screen.getByRole('button', { name: 'ask' }).click();

      await expect.element(screen.getByText('Delete this project?')).toBeInTheDocument();
      await expect.element(screen.getByText('Everything in it goes too.')).toBeInTheDocument();
    });

    it('takes labels of its own', async () => {
      const screen = await render(
        <Wrapped options={{ title: 'Sure?', confirmLabel: 'Delete', cancelLabel: 'Keep' }} />
      );

      await screen.getByRole('button', { name: 'ask' }).click();

      await expect.element(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });

    it('paints the confirm button in the accent it was given', async () => {
      const screen = await render(<Wrapped options={{ title: 'Sure?', color: 'error' }} />);

      await screen.getByRole('button', { name: 'ask' }).click();
      const button = screen.getByRole('button', { name: 'Confirm' }).element() as HTMLElement;

      expect(button.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });

    it('holds whatever else it was handed', async () => {
      const screen = await render(
        <Wrapped
          options={{ title: 'Sure?', children: <span data-testid="extra">and this</span> }}
        />
      );

      await screen.getByRole('button', { name: 'ask' }).click();

      await expect.element(screen.getByTestId('extra')).toBeInTheDocument();
    });
  });

  describe('alert', () => {
    it('draws one button and resolves once it is pressed', async () => {
      const screen = await render(<Wrapped kind="alert" options={{ title: 'Saved' }} />);

      await screen.getByRole('button', { name: 'ask' }).click();

      expect(screen.getByRole('button', { name: 'Cancel' }).query()).toBeNull();
      await screen.getByRole('button', { name: 'OK' }).click();

      await expect.element(screen.getByTestId('answer')).toHaveTextContent('acknowledged');
    });

    it('resolves on Escape too, because there is nothing to refuse', async () => {
      const screen = await render(<Wrapped kind="alert" options={{ title: 'Saved' }} />);

      await screen.getByRole('button', { name: 'ask' }).click();
      await screen
        .getByRole('dialog')
        .element()
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      await expect.element(screen.getByTestId('answer')).toHaveTextContent('acknowledged');
    });
  });

  describe('one at a time', () => {
    it('replaces an open confirmation and answers the first one `no`', async () => {
      const answers: boolean[] = [];

      function Two() {
        const { confirm } = useMPConfirm();

        return (
          <button
            type="button"
            onClick={() => {
              void confirm({ title: 'First' }).then((a) => answers.push(a));
              void confirm({ title: 'Second' }).then((a) => answers.push(a));
            }}
          >
            ask twice
          </button>
        );
      }

      const screen = await render(
        <MPConfirmProvider>
          <Two />
        </MPConfirmProvider>
      );

      await screen.getByRole('button', { name: 'ask twice' }).click();

      // The first is settled immediately, as `no`.
      await expect.element(screen.getByText('Second')).toBeInTheDocument();
      expect(answers).toEqual([false]);

      await screen.getByRole('button', { name: 'Confirm' }).click();
      expect(answers).toEqual([false, true]);
    });
  });

  describe('provider defaults', () => {
    it('are used, and beaten by the call', async () => {
      function Both() {
        const { confirm } = useMPConfirm();

        return (
          <>
            <button type="button" onClick={() => void confirm({ title: 'Plain' })}>
              plain
            </button>
            <button
              type="button"
              onClick={() => void confirm({ title: 'Loud', confirmLabel: 'Do it' })}
            >
              loud
            </button>
          </>
        );
      }

      const screen = await render(
        <MPConfirmProvider defaults={{ confirmLabel: 'Yes please', size: 'sm' }}>
          <Both />
        </MPConfirmProvider>
      );

      await screen.getByRole('button', { name: 'plain' }).click();
      await expect.element(screen.getByRole('button', { name: 'Yes please' })).toBeInTheDocument();
      await screen.getByRole('button', { name: 'Yes please' }).click();

      await screen.getByRole('button', { name: 'loud' }).click();
      await expect.element(screen.getByRole('button', { name: 'Do it' })).toBeInTheDocument();
    });
  });

  describe('localisation', () => {
    it('draws the buttons in the language in force', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ko">
          <Wrapped />
        </MPLocaleProvider>
      );

      await screen.getByRole('button', { name: 'ask' }).click();

      await expect.element(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  describe('without a provider', () => {
    it('throws rather than handing back a promise that never settles', async () => {
      // The hardest possible way to be told about a missing provider would be a
      // promise nobody ever resolves, so the hook refuses at the point of use.
      function Bare() {
        useMPConfirm();

        return null;
      }

      await expect(render(<Bare />)).rejects.toThrow(/MPConfirmProvider/);
    });
  });
});
