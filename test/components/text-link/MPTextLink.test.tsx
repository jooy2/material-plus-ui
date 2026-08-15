import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTextLink } from 'material-plus-ui';

describe('MPTextLink', () => {
  describe('rendering', () => {
    it('is a link with an href', async () => {
      const screen = await render(<MPTextLink href="/docs">Docs</MPTextLink>);
      const element = screen.getByRole('link', { name: 'Docs' }).element();

      expect(element.tagName).toBe('A');
      expect(element).toHaveAttribute('href', '/docs');
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(
        <MPTextLink href="/docs" className="my-own-class">
          Docs
        </MPTextLink>
      );
      const element = screen.getByRole('link').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-link');
    });

    it('forwards a ref to the anchor', async () => {
      let node: HTMLAnchorElement | null = null;

      await render(
        <MPTextLink
          href="/docs"
          ref={(element) => {
            node = element;
          }}
        >
          Docs
        </MPTextLink>
      );

      expect(node).not.toBeNull();
      expect(node!.tagName).toBe('A');
    });
  });

  describe('underline', () => {
    it('draws the line at rest by default', async () => {
      const screen = await render(<MPTextLink href="/docs">Docs</MPTextLink>);

      expect(getComputedStyle(screen.getByRole('link').element()).textDecorationLine).toBe(
        'underline'
      );
    });

    it('holds the line back until hover when asked', async () => {
      const screen = await render(
        <MPTextLink href="/docs" underline="hover">
          Docs
        </MPTextLink>
      );

      expect(getComputedStyle(screen.getByRole('link').element()).textDecorationLine).toBe('none');
    });

    it('draws no line at all when asked', async () => {
      const screen = await render(
        <MPTextLink href="/docs" underline="none">
          Docs
        </MPTextLink>
      );

      expect(getComputedStyle(screen.getByRole('link').element()).textDecorationLine).toBe('none');
    });

    it('survives a host stylesheet that styles `a` by name', async () => {
      // `.prose a`, `.vp-doc a`, every CSS framework ever — all of them a class
      // plus a type, which outranks a plain utility. A link that lost its colour
      // and its line inside one of those blocks would have lost the only two
      // things it is, so both are written through the component's own doubled
      // class.
      const style = document.createElement('style');

      style.textContent = '.host-prose a { text-decoration: none; color: rgb(1, 2, 3) }';
      document.head.append(style);

      try {
        const screen = await render(
          <div className="host-prose">
            <MPTextLink href="/docs" color="primary">
              Docs
            </MPTextLink>
          </div>
        );
        const computed = getComputedStyle(screen.getByRole('link').element());

        expect(computed.textDecorationLine).toBe('underline');
        expect(computed.color).not.toBe('rgb(1, 2, 3)');
      } finally {
        style.remove();
      }
    });
  });

  describe('color', () => {
    it('takes the surrounding ink when no family is asked for', async () => {
      const screen = await render(<MPTextLink href="/docs">Docs</MPTextLink>);
      const element = screen.getByRole('link').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('');
    });

    it('reads the accent family when one is asked for', async () => {
      const screen = await render(
        <MPTextLink href="/docs" color="tertiary">
          Docs
        </MPTextLink>
      );
      const element = screen.getByRole('link').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-tertiary)');
    });
  });

  describe('newTab', () => {
    it('adds neither target nor rel by default', async () => {
      const screen = await render(<MPTextLink href="/docs">Docs</MPTextLink>);
      const element = screen.getByRole('link').element();

      expect(element).not.toHaveAttribute('target');
      expect(element).not.toHaveAttribute('rel');
    });

    it('opens in a new tab with the rel that closes the opener hole', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" newTab>
          Example
        </MPTextLink>
      );
      const element = screen.getByRole('link').element();

      expect(element).toHaveAttribute('target', '_blank');
      expect(element).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('says so to a screen reader', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" newTab>
          Example
        </MPTextLink>
      );

      // Two words, not one: the space between the label and the note is a real
      // text node, so the accessible name does not run them together.
      expect(
        screen.getByRole('link', { name: 'Example Opens in a new tab' }).query()
      ).not.toBeNull();
    });

    it('takes a caller’s wording for that note', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" newTab newTabLabel="새 탭에서 열림">
          예시
        </MPTextLink>
      );

      expect(screen.getByRole('link', { name: '예시 새 탭에서 열림' }).query()).not.toBeNull();
    });

    /*
     * `target` also arrives through the rest props — written out directly, or
     * carried by a router's own `Link` — and everything that follows from a new
     * tab has to follow the attribute rather than the prop that usually sets it.
     */
    it('closes the opener hole for a target written out directly', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" target="_blank">
          Example
        </MPTextLink>
      );
      const element = screen.getByRole('link').element();

      expect(element).toHaveAttribute('target', '_blank');
      expect(element).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('warns about that tab too', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" target="_blank">
          Example
        </MPTextLink>
      );

      expect(
        screen.getByRole('link', { name: 'Example Opens in a new tab' }).query()
      ).not.toBeNull();
    });

    it('leaves a target that is not a new tab alone', async () => {
      const screen = await render(
        <MPTextLink href="/docs" target="_self">
          Docs
        </MPTextLink>
      );
      const element = screen.getByRole('link').element();

      expect(element).toHaveAttribute('target', '_self');
      expect(element).not.toHaveAttribute('rel');
    });

    it('lets a caller replace the rel it would have written', async () => {
      // The rest props are spread last on purpose: `noopener noreferrer
      // nofollow` is a real thing to want.
      const screen = await render(
        <MPTextLink href="https://example.com" newTab rel="noopener noreferrer nofollow">
          Example
        </MPTextLink>
      );

      expect(screen.getByRole('link').element()).toHaveAttribute(
        'rel',
        'noopener noreferrer nofollow'
      );
    });
  });

  describe('icon', () => {
    it('draws nothing beside a plain link', async () => {
      const screen = await render(<MPTextLink href="/docs">Docs</MPTextLink>);

      expect(screen.getByRole('link').element().querySelector('svg')).toBeNull();
    });

    it('follows newTab when it is not given', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" newTab>
          Example
        </MPTextLink>
      );

      expect(screen.getByRole('link').element().querySelector('svg')).not.toBeNull();
    });

    it('can be silenced on a new-tab link', async () => {
      const screen = await render(
        <MPTextLink href="https://example.com" newTab icon={false}>
          Example
        </MPTextLink>
      );

      expect(screen.getByRole('link').element().querySelector('svg')).toBeNull();
      // The note for a screen reader stays: the glyph was the *visible* half.
      expect(
        screen.getByRole('link', { name: 'Example Opens in a new tab' }).query()
      ).not.toBeNull();
    });

    it('takes a mark of its own', async () => {
      const screen = await render(
        <MPTextLink href="/docs" icon={<span data-testid="mark">→</span>}>
          Docs
        </MPTextLink>
      );

      expect(screen.getByTestId('mark').query()).not.toBeNull();
    });
  });

  describe('render', () => {
    it('wears a router’s own link component', async () => {
      function RouterLink(props: React.ComponentPropsWithoutRef<'a'>) {
        return <a data-router="true" {...props} />;
      }

      const screen = await render(
        <MPTextLink href="/docs" render={<RouterLink />}>
          Docs
        </MPTextLink>
      );
      const element = screen.getByRole('link').element();

      expect(element).toHaveAttribute('data-router', 'true');
      expect(element).toHaveAttribute('href', '/docs');
    });
  });
});
