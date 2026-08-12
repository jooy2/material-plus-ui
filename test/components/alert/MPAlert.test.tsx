import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAlert, MPButton, MPLocaleProvider } from 'material-plus-ui';

describe('MPAlert', () => {
  describe('rendering', () => {
    it('renders the message it was handed', async () => {
      const screen = await render(<MPAlert>Your changes were saved.</MPAlert>);

      await expect.element(screen.getByText('Your changes were saved.')).toBeInTheDocument();
    });

    it('renders a heading and the detail under it', async () => {
      const screen = await render(<MPAlert title="Payment failed">Card was declined.</MPAlert>);

      await expect.element(screen.getByText('Payment failed')).toBeInTheDocument();
      await expect.element(screen.getByText('Card was declined.')).toBeInTheDocument();
    });

    it('draws a glyph for the family it was given', async () => {
      const screen = await render(<MPAlert>Heads up</MPAlert>);

      expect(screen.container.querySelectorAll('.mp-alert svg')).toHaveLength(1);
    });

    it('drops the glyph when told to', async () => {
      const screen = await render(<MPAlert icon={false}>Heads up</MPAlert>);

      expect(screen.container.querySelectorAll('.mp-alert svg')).toHaveLength(0);
    });

    it('takes a glyph of its own', async () => {
      const screen = await render(
        <MPAlert icon={<span data-testid="custom">!</span>}>Heads up</MPAlert>
      );

      await expect.element(screen.getByTestId('custom')).toBeInTheDocument();
    });

    it('publishes the rung and the variant it was drawn at', async () => {
      const screen = await render(
        <MPAlert size="lg" variant="outlined">
          Heads up
        </MPAlert>
      );
      const root = screen.container.querySelector('.mp-alert');

      expect(root).toHaveAttribute('data-mp-size', 'lg');
      expect(root).toHaveAttribute('data-mp-variant', 'outlined');
    });
  });

  describe('the live region', () => {
    it('waits for a pause on everything that is not an error', async () => {
      // "Saved" is not worth interrupting a screen reader mid-sentence for.
      const screen = await render(<MPAlert>Saved</MPAlert>);

      await expect.element(screen.getByRole('status')).toBeInTheDocument();
    });

    it('interrupts on the error family', async () => {
      const screen = await render(<MPAlert color="error">It did not send</MPAlert>);

      await expect.element(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('lets a caller who knows better win', async () => {
      // The spread lands after the derived role, on purpose.
      const screen = await render(<MPAlert role="note">A note</MPAlert>);

      expect(screen.container.querySelector('.mp-alert')).toHaveAttribute('role', 'note');
    });
  });

  describe('dismissing', () => {
    it('renders no × until there is something to call', async () => {
      const screen = await render(<MPAlert>Heads up</MPAlert>);

      expect(screen.container.querySelectorAll('.mp-alert button')).toHaveLength(0);
    });

    it('calls back when the × is pressed', async () => {
      const onClose = vi.fn();
      const screen = await render(<MPAlert onClose={onClose}>Heads up</MPAlert>);

      await screen.getByRole('button', { name: 'Dismiss' }).click();

      expect(onClose).toHaveBeenCalled();
    });

    it('takes a name of its own for the ×', async () => {
      const screen = await render(
        <MPAlert onClose={() => {}} closeLabel="Hide this">
          Heads up
        </MPAlert>
      );

      await expect.element(screen.getByRole('button', { name: 'Hide this' })).toBeInTheDocument();
    });

    it('names the × in the locale it was given', async () => {
      const screen = await render(
        <MPAlert onClose={() => {}} locale="ko">
          알림
        </MPAlert>
      );

      await expect.element(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('follows a provider when it has no locale of its own', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPAlert onClose={() => {}}>お知らせ</MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    });

    it('lets its own locale beat the provider', async () => {
      const screen = await render(
        <MPLocaleProvider locale="ja">
          <MPAlert onClose={() => {}} locale="ko">
            알림
          </MPAlert>
        </MPLocaleProvider>
      );

      await expect.element(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });
  });

  describe('the action', () => {
    it('renders a button the caller passed beside the message', async () => {
      const onRetry = vi.fn();
      const screen = await render(
        <MPAlert action={<MPButton onClick={onRetry}>Retry</MPButton>}>Upload failed</MPAlert>
      );

      await screen.getByRole('button', { name: 'Retry' }).click();

      expect(onRetry).toHaveBeenCalled();
    });
  });
});
