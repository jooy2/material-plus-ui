import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPIcon, ICONS } from 'material-plus-ui';
import type { MPIconGlyphProps } from 'material-plus-ui';

/** A stand-in for whatever an icon set hands back: a component taking a size. */
function Glyph({ size, color, strokeWidth }: MPIconGlyphProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      stroke={color}
      strokeWidth={strokeWidth}
      data-testid="glyph"
    >
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}

describe('MPIcon', () => {
  describe('rendering', () => {
    it('renders a glyph given as a component', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" />);

      expect(
        screen.getByRole('img', { name: 'Status' }).element().querySelector('svg')
      ).not.toBeNull();
    });

    it('renders a glyph given as an element', async () => {
      const screen = await render(<MPIcon icon={<Glyph />} label="Status" />);

      expect(
        screen.getByRole('img', { name: 'Status' }).element().querySelector('svg')
      ).not.toBeNull();
    });

    it('renders a forwardRef component from the bundled icon set', async () => {
      // `lucide-react` exports `forwardRef` objects rather than plain
      // functions, which is the case a `typeof icon === 'function'` check
      // would miss entirely.
      const screen = await render(<MPIcon icon={ICONS.close} label="Close" />);

      expect(
        screen.getByRole('img', { name: 'Close' }).element().querySelector('svg')
      ).not.toBeNull();
    });

    it('reflects a changed glyph on re-render', async () => {
      const screen = await render(<MPIcon icon={<span>before</span>} label="Status" />);
      const element = screen.getByRole('img', { name: 'Status' }).element();

      expect(element.textContent).toBe('before');

      await screen.rerender(<MPIcon icon={<span>after</span>} label="Status" />);

      expect(element.textContent).toBe('after');
    });

    it('keeps caller-supplied class names alongside its own', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" className="my-own-class" />);
      const element = screen.getByRole('img', { name: 'Status' }).element();

      expect(element).toHaveClass('my-own-class');
      expect(element).toHaveClass('inline-flex');
    });

    it('forwards unknown props to the underlying span', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" data-kind="status" />);

      expect(screen.getByRole('img', { name: 'Status' }).element()).toHaveAttribute(
        'data-kind',
        'status'
      );
    });

    it('forwards a ref to the span', async () => {
      let node: HTMLSpanElement | null = null;

      await render(
        <MPIcon
          icon={Glyph}
          label="Status"
          ref={(element) => {
            node = element;
          }}
        />
      );

      expect(node).not.toBeNull();
      expect(node!.tagName).toBe('SPAN');
    });
  });

  describe('size', () => {
    it('draws at the glyph’s own size when none is given', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" />);
      const element = screen.getByRole('img', { name: 'Status' }).element() as HTMLElement;

      expect(element.style.width).toBe('');
      expect(element.style.height).toBe('');
      expect(element.style.fontSize).toBe('');
    });

    it('sets the box and the font size from a numeric size', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" size={20} />);
      const element = screen.getByRole('img', { name: 'Status' }).element() as HTMLElement;

      expect(element.style.width).toBe('20px');
      expect(element.style.height).toBe('20px');
      // Written as well as the box, so a glyph drawn in `em` comes out at the
      // same size as one drawn in `px`.
      expect(element.style.fontSize).toBe('20px');
    });

    it('accepts a CSS length as a size', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" size="1.5rem" />);
      const element = screen.getByRole('img', { name: 'Status' }).element() as HTMLElement;

      expect(element.style.width).toBe('1.5rem');
      expect(element.style.fontSize).toBe('1.5rem');
    });

    it('passes the size into a glyph given as a component', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" size={20} />);

      expect(screen.getByTestId('glyph').element()).toHaveAttribute('width', '20');
    });
  });

  describe('color', () => {
    it('inherits the surrounding colour when none is given', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" />);
      const element = screen.getByRole('img', { name: 'Status' }).element() as HTMLElement;

      expect(element.style.color).toBe('');
      // The glyph is still told to follow whatever colour it lands in, so a set
      // with a hardcoded default does not ignore the surrounding text.
      expect(screen.getByTestId('glyph').element()).toHaveAttribute('stroke', 'currentColor');
    });

    it('applies a colour to the box and to the glyph', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" color="rgb(255, 0, 0)" />);
      const element = screen.getByRole('img', { name: 'Status' }).element() as HTMLElement;

      expect(element.style.color).toBe('rgb(255, 0, 0)');
      expect(screen.getByTestId('glyph').element()).toHaveAttribute('stroke', 'rgb(255, 0, 0)');
    });

    it('passes strokeWidth through to a component glyph', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" strokeWidth={3} />);

      expect(screen.getByTestId('glyph').element()).toHaveAttribute('stroke-width', '3');
    });
  });

  describe('center', () => {
    it('is not centred by default', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" />);

      expect(screen.getByRole('img', { name: 'Status' }).element()).not.toHaveClass(
        'justify-self-center'
      );
    });

    it('centres itself in its track when asked', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Status" center />);

      expect(screen.getByRole('img', { name: 'Status' }).element()).toHaveClass(
        'justify-self-center'
      );
    });
  });

  describe('accessibility', () => {
    it('is announced as an image when it carries a label', async () => {
      const screen = await render(<MPIcon icon={Glyph} label="Deployed" />);
      const element = screen.getByRole('img', { name: 'Deployed' }).element();

      expect(element).toHaveAttribute('aria-label', 'Deployed');
      expect(element).not.toHaveAttribute('aria-hidden');
    });

    it('leaves the accessibility tree entirely without a label', async () => {
      const screen = await render(<MPIcon icon={Glyph} data-testid="icon" />);
      const element = screen.getByTestId('icon').element();

      expect(element).toHaveAttribute('aria-hidden', 'true');
      expect(element).not.toHaveAttribute('role');
      expect(screen.getByRole('img').query()).toBeNull();
    });
  });
});
