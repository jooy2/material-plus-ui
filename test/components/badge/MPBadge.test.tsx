import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPBadge } from 'material-plus-ui';

describe('MPBadge', () => {
  describe('content', () => {
    it('shows a count', async () => {
      const screen = await render(<MPBadge content={3} data-testid="badge" />);

      expect(screen.getByTestId('badge').element().textContent).toBe('3');
    });

    it('caps a number past max', async () => {
      const screen = await render(<MPBadge content={120} data-testid="badge" />);

      expect(screen.getByTestId('badge').element().textContent).toBe('99+');
    });

    it('takes a max of its own', async () => {
      const screen = await render(<MPBadge content={12} max={9} data-testid="badge" />);

      expect(screen.getByTestId('badge').element().textContent).toBe('9+');
    });

    it('leaves a word alone', async () => {
      // A badge cannot know how to truncate a word.
      const screen = await render(<MPBadge content="NEW" max={2} data-testid="badge" />);

      expect(screen.getByTestId('badge').element().textContent).toBe('NEW');
    });

    it('hides itself at zero', async () => {
      // Zero unread messages is not news, and a badge that never goes away
      // stops meaning anything.
      const screen = await render(<MPBadge content={0} data-testid="badge" />);
      const element = screen.getByTestId('badge').element();

      expect(element).toHaveClass('invisible');
      expect(element.textContent).toBe('');
    });

    it('shows a zero when asked', async () => {
      const screen = await render(<MPBadge content={0} showZero data-testid="badge" />);
      const element = screen.getByTestId('badge').element();

      expect(element).not.toHaveClass('invisible');
      expect(element.textContent).toBe('0');
    });
  });

  describe('the dot', () => {
    it('is what a badge with no content draws', async () => {
      const screen = await render(<MPBadge dot data-testid="badge" />);
      const element = screen.getByTestId('badge').element();

      expect(element).not.toHaveClass('invisible');
      expect(element).toHaveClass('size-1.5');
    });

    it('keeps the count for a screen reader', async () => {
      // A quiet corner is not a silent one.
      const screen = await render(<MPBadge content={7} dot data-testid="badge" />);

      expect(screen.getByTestId('badge').element().textContent).toBe('7');
      expect(screen.getByText('7').element()).toHaveClass('[clip-path:inset(50%)]');
    });
  });

  describe('invisible', () => {
    it('keeps its box so nothing moves when it comes back', async () => {
      const screen = await render(<MPBadge content={3} invisible data-testid="badge" />);
      const element = screen.getByTestId('badge').element();

      expect(element).toHaveClass('invisible');
      // Nothing left behind: text in a clipped box is text a page search finds.
      expect(element.textContent).toBe('');
      expect(element).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('label', () => {
    it('reads the sentence instead of the number', async () => {
      const screen = await render(
        <MPBadge content={3} label="3 unread notifications" data-testid="badge" />
      );

      expect(screen.getByText('3 unread notifications').query()).not.toBeNull();
      expect(screen.getByText('3', { exact: true }).element()).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });
  });

  describe('anchoring', () => {
    it('lays out inline with nothing under it', async () => {
      const screen = await render(<MPBadge content={3} data-testid="badge" />);

      expect(screen.getByTestId('badge').element()).toHaveClass('relative');
    });

    it('pins itself to a corner of what it wraps', async () => {
      const screen = await render(
        <MPBadge content={3} data-testid="badge">
          <button type="button">Inbox</button>
        </MPBadge>
      );
      const element = screen.getByTestId('badge').element();

      expect(element).toHaveClass('absolute');
      expect(element).toHaveClass('top-0');
      expect(element).toHaveClass('end-0');
    });

    it('moves to the corner asked for', async () => {
      const screen = await render(
        <MPBadge content={3} placement="bottom-start" data-testid="badge">
          <button type="button">Inbox</button>
        </MPBadge>
      );
      const element = screen.getByTestId('badge').element();

      expect(element).toHaveClass('bottom-0');
      expect(element).toHaveClass('start-0');
    });

    it('tucks further in over a round anchor', async () => {
      // A circle's corner is about 15% of its diameter inside the box the badge
      // is positioned against.
      const screen = await render(
        <MPBadge content={3} overlap="circle" data-testid="badge">
          <span>Avatar</span>
        </MPBadge>
      );

      expect(screen.getByTestId('badge').element()).toHaveClass('mt-[7%]');
    });
  });

  describe('colour', () => {
    it('is the error family, which is Material’s badge', async () => {
      const screen = await render(<MPBadge content={3} data-testid="badge" />);
      const element = screen.getByTestId('badge').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
    });

    it('takes another family when asked', async () => {
      const screen = await render(<MPBadge content={3} color="primary" data-testid="badge" />);
      const element = screen.getByTestId('badge').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-primary)');
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPBadge content={3} className="my-own-class" data-testid="badge" />
      );
      const element = screen.getByTestId('badge').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-badge');
    });

    it('forwards a ref to the marker', async () => {
      let node: HTMLSpanElement | null = null;

      await render(
        <MPBadge
          content={3}
          ref={(element) => {
            node = element;
          }}
        />
      );

      expect(node).not.toBeNull();
    });
  });
});
