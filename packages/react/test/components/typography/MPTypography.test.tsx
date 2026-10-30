import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTypography } from 'material-plus-ui';

/**
 * The type roles are asserted through the computed style rather than through a
 * class name, and deliberately.
 *
 * Every utility this component emits is written through `[&.mp-typography]` so
 * that a host stylesheet's `.prose h2` cannot outrank it — a class-name
 * assertion would still pass with the doubling removed, which is precisely the
 * regression worth catching. What matters is the size the reader ends up with.
 */
function typeOf(element: Element) {
  const style = getComputedStyle(element);

  return {
    size: style.fontSize,
    leading: style.lineHeight,
    weight: style.fontWeight
  };
}

describe('MPTypography', () => {
  describe('level', () => {
    it('renders a paragraph by default', async () => {
      const screen = await render(<MPTypography>Body copy</MPTypography>);

      expect(screen.getByText('Body copy').element().tagName).toBe('P');
    });

    it('renders the matching heading element for h1–h6', async () => {
      const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
      const screen = await render(
        <>
          {levels.map((level) => (
            <MPTypography key={level} level={level}>
              {level}
            </MPTypography>
          ))}
        </>
      );

      for (const level of levels) {
        expect(screen.getByText(level).element().tagName).toBe(level.toUpperCase());
      }
    });

    it('renders the quiet levels as a span', async () => {
      const screen = await render(<MPTypography level="caption">Caption</MPTypography>);

      expect(screen.getByText('Caption').element().tagName).toBe('SPAN');
    });

    it('sets each level at its Material role’s size and leading', async () => {
      // headline-large is 32/40 in the specification.
      const screen = await render(<MPTypography level="h2">Heading</MPTypography>);

      expect(typeOf(screen.getByText('Heading').element())).toMatchObject({
        size: '32px',
        leading: '40px'
      });
    });

    it('puts a lead paragraph on title-large', async () => {
      const screen = await render(<MPTypography level="lead">Lede</MPTypography>);
      const element = screen.getByText('Lede').element();

      expect(element.tagName).toBe('P');
      expect(typeOf(element)).toMatchObject({ size: '22px', leading: '28px' });
    });

    it('sets body at body-large, which is the specification’s reading size', async () => {
      const screen = await render(<MPTypography>Body</MPTypography>);

      expect(typeOf(screen.getByText('Body').element())).toMatchObject({
        size: '16px',
        leading: '24px'
      });
    });
  });

  describe('the type scale survives a host stylesheet', () => {
    it('outranks a class-plus-type rule of the page’s own', async () => {
      // `.prose h2`, `.vp-doc h2`, every CSS framework ever. All of them are one
      // class and one type, which beats a plain utility — so every utility here
      // is written through the component's own doubled class.
      const style = document.createElement('style');

      style.textContent =
        '.host-prose h2 { font-size: 14px; line-height: 14px; font-weight: 700; margin: 40px }';
      document.head.append(style);

      try {
        const screen = await render(
          <div className="host-prose">
            <MPTypography level="h2">Heading</MPTypography>
          </div>
        );
        const element = screen.getByText('Heading').element();

        expect(typeOf(element)).toMatchObject({
          size: '32px',
          leading: '40px',
          weight: '400'
        });
        expect(getComputedStyle(element).marginTop).toBe('0px');
      } finally {
        style.remove();
      }
    });
  });

  describe('weight', () => {
    it('sets headings at the specification’s regular weight', async () => {
      // Material headings are not bold. A heading set in 600 is the fastest way
      // to make a Material page look like it belongs to another system.
      const screen = await render(<MPTypography level="h1">Heading</MPTypography>);

      expect(typeOf(screen.getByText('Heading').element()).weight).toBe('400');
    });

    it('sets the label-ish levels one weight up', async () => {
      const screen = await render(<MPTypography level="h6">Subheading</MPTypography>);

      expect(typeOf(screen.getByText('Subheading').element()).weight).toBe('500');
    });

    it('emits exactly one font weight when overridden', async () => {
      // Two utilities of equal specificity resolve by their order in the
      // generated stylesheet, so both being present would mean neither wins
      // reliably.
      const screen = await render(
        <MPTypography level="h1" weight="bold">
          Heading
        </MPTypography>
      );
      const element = screen.getByText('Heading').element();

      expect(typeOf(element).weight).toBe('700');
      expect(element.className).not.toContain('font-normal');
    });
  });

  describe('color', () => {
    it('declares no colour at all when no family is asked for', async () => {
      const screen = await render(<MPTypography>Body</MPTypography>);
      const element = screen.getByText('Body').element() as HTMLElement;

      // "No default" has to mean no declaration. A colour written here would be
      // a `[&.mp-typography]` — two classes — and would outrank the page's own
      // utility, which is the opposite of inheriting.
      expect(element.className).not.toContain('text-mp-on-surface');
      expect(element.style.getPropertyValue('--_mp-accent')).toBe('');
    });

    it('leaves the quiet levels uncoloured too', async () => {
      const screen = await render(<MPTypography level="caption">Caption</MPTypography>);

      expect(screen.getByText('Caption').element().className).not.toContain('text-mp-on-surface');
    });

    it('takes the ink of the surface it is dropped into', async () => {
      const screen = await render(
        <div className="text-mp-primary">
          <MPTypography>Body</MPTypography>
          <MPTypography level="caption">Caption</MPTypography>
        </div>
      );

      const ink = getComputedStyle(
        document.querySelector('.text-mp-primary') as HTMLElement
      ).getPropertyValue('color');

      for (const text of ['Body', 'Caption']) {
        expect(getComputedStyle(screen.getByText(text).element()).color).toBe(ink);
      }
    });

    it('reads the accent family when one is asked for', async () => {
      const screen = await render(<MPTypography color="error">Failed</MPTypography>);
      const element = screen.getByText('Failed').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-accent')).toBe('var(--_mp-color-error)');
      // The error family is a red whatever the source colour is, so the ink is
      // measurably not the surface ink.
      expect(getComputedStyle(element).color).not.toBe('');
    });
  });

  describe('layout', () => {
    it('truncates to one line', async () => {
      const screen = await render(<MPTypography lines={1}>Long</MPTypography>);

      expect(screen.getByText('Long').element()).toHaveClass('truncate');
    });

    it('clamps to several lines', async () => {
      const screen = await render(<MPTypography lines={3}>Long</MPTypography>);

      expect(screen.getByText('Long').element()).toHaveClass('line-clamp-3');
    });

    it('falls back to the deepest clamp past the table', async () => {
      const screen = await render(<MPTypography lines={12}>Long</MPTypography>);

      expect(screen.getByText('Long').element()).toHaveClass('line-clamp-6');
    });

    it('aligns the text', async () => {
      const screen = await render(<MPTypography align="center">Centred</MPTypography>);

      expect(getComputedStyle(screen.getByText('Centred').element()).textAlign).toBe('center');
    });

    it('leaves no margin at all by default', async () => {
      // `gutter` promises no space below, and that is only true if the browser's
      // own margins on a `<p>` are reset.
      const screen = await render(<MPTypography>Body</MPTypography>);
      const style = getComputedStyle(screen.getByText('Body').element());

      expect(style.marginTop).toBe('0px');
      expect(style.marginBottom).toBe('0px');
    });

    it('adds the space a run of prose expects when asked', async () => {
      const screen = await render(<MPTypography gutter>Body</MPTypography>);
      const style = getComputedStyle(screen.getByText('Body').element());

      expect(style.marginBottom).not.toBe('0px');
      expect(style.marginTop).toBe('0px');
    });
  });

  describe('render', () => {
    it('keeps the type scale on a different element', async () => {
      const screen = await render(
        <MPTypography level="h3" render={<div />}>
          Looks like a heading
        </MPTypography>
      );
      const element = screen.getByText('Looks like a heading').element();

      expect(element.tagName).toBe('DIV');
      expect(typeOf(element)).toMatchObject({ size: '28px', leading: '36px' });
    });
  });

  describe('passthrough', () => {
    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(<MPTypography className="my-own-class">Body</MPTypography>);
      const element = screen.getByText('Body').element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('mp-typography');
    });

    it('forwards unknown props to the element', async () => {
      const screen = await render(<MPTypography data-kind="lede">Body</MPTypography>);

      expect(screen.getByText('Body').element()).toHaveAttribute('data-kind', 'lede');
    });
  });
});
