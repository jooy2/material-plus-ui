import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAvatar } from 'material-plus-ui';

/**
 * A real, loadable image: Base UI only puts the `<img>` in the document once it
 * has loaded, so a URL that 404s would leave nothing to assert about. A data URI
 * is the one form that resolves without a server round trip.
 */
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** The `alt` of the picture inside an avatar, once one is there. */
function altOf(element: Element): string | null | undefined {
  return element.querySelector('img')?.getAttribute('alt');
}

describe('MPAvatar', () => {
  describe('the fallback', () => {
    it('is never an empty box', async () => {
      const screen = await render(<MPAvatar data-testid="avatar" />);

      expect(screen.getByTestId('avatar').element().querySelector('svg')).not.toBeNull();
    });

    it('derives two initials from a two-word name', async () => {
      const screen = await render(<MPAvatar name="Jane Doe" />);

      expect(screen.getByText('JD').query()).not.toBeNull();
    });

    it('derives one from a single-token name', async () => {
      // Korean, Japanese and Chinese names are one token, and two of their
      // characters at 32px is a smudge where one is a name.
      const screen = await render(<MPAvatar name="홍길동" />);

      expect(screen.getByText('홍', { exact: true }).query()).not.toBeNull();
    });

    it('does not cut an astral character in half', async () => {
      const screen = await render(<MPAvatar name="🚀 Team" />);

      expect(screen.getByText('🚀T').query()).not.toBeNull();
    });

    it('takes written-out initials over the derived ones', async () => {
      const screen = await render(<MPAvatar name="Jane Doe" initials="JVD" />);

      expect(screen.getByText('JVD').query()).not.toBeNull();
    });

    it('lets children beat both', async () => {
      const screen = await render(
        <MPAvatar name="Jane Doe">
          <span data-testid="glyph">★</span>
        </MPAvatar>
      );

      expect(screen.getByTestId('glyph').query()).not.toBeNull();
      expect(screen.getByText('JD').query()).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('reads the name rather than the initials', async () => {
      // `JD` read out loud is two letters, not a person.
      const screen = await render(<MPAvatar name="Jane Doe" />);

      expect(screen.getByText('Jane Doe').query()).not.toBeNull();
      expect(screen.getByText('JD').element()).toHaveAttribute('aria-hidden', 'true');
    });

    it('says nothing beside a silhouette', async () => {
      // There is no name to announce, so there is nothing to say.
      const screen = await render(<MPAvatar data-testid="avatar" />);

      expect(screen.getByTestId('avatar').element().textContent).toBe('');
    });

    it('gives a picture an empty alt when there is no name', async () => {
      // Empty rather than absent: an avatar beside the person's own name is
      // decoration, and `alt` left off is what makes a screen reader read the
      // file name out instead.
      const screen = await render(<MPAvatar src={PIXEL} data-testid="avatar" />);

      await expect.poll(() => altOf(screen.getByTestId('avatar').element())).toBe('');
    });

    it('names the picture from the name', async () => {
      const screen = await render(<MPAvatar src={PIXEL} name="Jane Doe" data-testid="avatar" />);

      await expect.poll(() => altOf(screen.getByTestId('avatar').element())).toBe('Jane Doe');
    });

    it('lets alt override it', async () => {
      const screen = await render(
        <MPAvatar src={PIXEL} name="Jane Doe" alt="Portrait" data-testid="avatar" />
      );

      await expect.poll(() => altOf(screen.getByTestId('avatar').element())).toBe('Portrait');
    });
  });

  describe('the picture arriving', () => {
    it('fades in rather than replacing the fallback in one frame', async () => {
      // Base UI puts the `<img>` in the document only once the file has
      // decoded, so the mount *is* the load and `data-starting-style` is the
      // frame before it. Asserted as the transition rather than by sampling an
      // opacity, for the reason every other motion test in this suite gives: a
      // value read mid-interpolation times the clock instead of asking whether
      // there is one.
      const screen = await render(<MPAvatar src={PIXEL} name="Jane Doe" data-testid="avatar" />);

      await expect
        .poll(() => screen.getByTestId('avatar').element().querySelector('img'))
        .not.toBeNull();

      const picture = screen.getByTestId('avatar').element().querySelector('img')!;

      expect(getComputedStyle(picture).transitionProperty).toBe('opacity');
      expect(getComputedStyle(picture).transitionDuration).toBe('0.2s');
    });
  });

  describe('shape', () => {
    it('is a circle by default', async () => {
      const screen = await render(<MPAvatar data-testid="avatar" />);

      expect(screen.getByTestId('avatar').element()).toHaveClass('rounded-mp-full');
    });

    it('cuts the corners off instead when squared', async () => {
      const screen = await render(<MPAvatar shape="square" data-testid="avatar" />);
      const element = screen.getByTestId('avatar').element();

      expect(element).not.toHaveClass('rounded-mp-full');
      expect(element).toHaveClass('rounded-mp-md');
    });
  });

  describe('variant and colour', () => {
    it('draws a monogram on the container tone by default', async () => {
      const screen = await render(<MPAvatar name="Jane Doe" data-testid="avatar" />);
      const element = screen.getByTestId('avatar').element();

      expect(element).toHaveAttribute('data-mp-variant', 'tonal');
      expect(element).toHaveClass('bg-(--_mp-accent-container)');
    });

    it('reads the accent family asked for', async () => {
      const screen = await render(<MPAvatar color="tertiary" data-testid="avatar" />);
      const element = screen.getByTestId('avatar').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(<MPAvatar className="my-own-class" data-testid="avatar" />);
      const element = screen.getByTestId('avatar').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-avatar');
    });

    it('publishes the size on the root', async () => {
      const screen = await render(<MPAvatar size="xs" data-testid="avatar" />);

      expect(screen.getByTestId('avatar').element()).toHaveAttribute('data-mp-size', 'xs');
    });

    it('forwards a ref', async () => {
      let node: HTMLSpanElement | null = null;

      await render(
        <MPAvatar
          ref={(element) => {
            node = element;
          }}
        />
      );

      expect(node).not.toBeNull();
    });
  });
});
