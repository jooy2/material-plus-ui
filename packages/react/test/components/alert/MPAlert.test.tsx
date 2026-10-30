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

    it('calls back once the alert has finished leaving', async () => {
      // Not on the press. The caller owns the mount, so a callback that fired
      // on the click had already taken the element away before there was
      // anything to animate — and what the caller does with it is stop
      // rendering the alert, which is the moment this now reports.
      const onClose = vi.fn();
      const screen = await render(<MPAlert onClose={onClose}>Heads up</MPAlert>);

      await screen.getByRole('button', { name: 'Dismiss' }).click();

      expect(onClose).not.toHaveBeenCalled();
      await expect.poll(() => onClose.mock.calls.length).toBe(1);
    });

    it('collapses the space it took rather than only fading', async () => {
      // An alert that only faded would leave a hole where it was, and
      // everything under it would jump the moment the caller unmounted it —
      // the same jolt as before, moved 200ms later and detached from the press
      // that caused it.
      const screen = await render(<MPAlert onClose={() => {}}>Heads up</MPAlert>);
      const reveal = screen.container.querySelector('.mp-alert__reveal') as HTMLElement;

      expect(getComputedStyle(reveal).transitionProperty).toBe('grid-template-rows, opacity');
      expect(getComputedStyle(reveal).transitionDuration).toBe('0.2s');
      expect(getComputedStyle(reveal).gridTemplateRows).not.toBe('0px');

      await screen.getByRole('button', { name: 'Dismiss' }).click();

      await expect.poll(() => getComputedStyle(reveal).gridTemplateRows).toBe('0px');
    });

    it('still calls back when there is no transition to wait for', async () => {
      // Two alerts rather than an edge case: a reader who asked for reduced
      // motion, and a page whose own stylesheet has taken the transition off.
      // Neither will ever fire a `transitionend`, and an alert waiting for one
      // would sit there dismissed and still on the page.
      const onClose = vi.fn();
      const screen = await render(
        <div>
          <style>{'.mp-alert__reveal { transition: none !important; }'}</style>
          <MPAlert onClose={onClose}>Heads up</MPAlert>
        </div>
      );

      await screen.getByRole('button', { name: 'Dismiss' }).click();

      await expect.poll(() => onClose.mock.calls.length).toBe(1);
    });

    it('carries no wrapper when there is nothing to dismiss it with', async () => {
      // An alert that cannot be dismissed has nothing to collapse, and keeps
      // the markup it has always had.
      const screen = await render(<MPAlert>Heads up</MPAlert>);

      expect(screen.container.querySelector('.mp-alert__reveal')).toBeNull();
    });

    it('stops the × answering a second press during the exit', async () => {
      const onClose = vi.fn();
      const screen = await render(<MPAlert onClose={onClose}>Heads up</MPAlert>);
      const dismiss = screen.getByRole('button', { name: 'Dismiss' });

      await dismiss.click();

      expect(dismiss.element()).toBeDisabled();
      await expect.poll(() => onClose.mock.calls.length).toBe(1);
      expect(onClose).toHaveBeenCalledTimes(1);
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

  describe('how loudly it announces itself', () => {
    it('interrupts for an error and waits for everything else', async () => {
      const loud = await render(<MPAlert color="error">Failed</MPAlert>);
      const quiet = await render(<MPAlert>Saved</MPAlert>);

      expect(loud.container.querySelector('.mp-alert')).toHaveAttribute('role', 'alert');
      expect(quiet.container.querySelector('.mp-alert')).toHaveAttribute('role', 'status');
    });

    /*
     * A live region is for content that *arrives*. An alert that was on the page
     * when it loaded did not — it is part of the page, and interrupting to read
     * it is interrupting to say something the reader was about to reach anyway.
     */
    it('can be told to say nothing on its own, for an alert that was always there', async () => {
      const screen = await render(
        <MPAlert color="error" live="off">
          Three fields need attention
        </MPAlert>
      );

      expect(screen.container.querySelector('.mp-alert')).not.toHaveAttribute('role');
      // Still readable, still an alert on the screen — just not one that shouts.
      await expect.element(screen.getByText('Three fields need attention')).toBeInTheDocument();
    });

    it('can be made loud for a family that is quiet by default', async () => {
      const screen = await render(<MPAlert live="assertive">Your session is about to end</MPAlert>);

      expect(screen.container.querySelector('.mp-alert')).toHaveAttribute('role', 'alert');
    });
  });
});
