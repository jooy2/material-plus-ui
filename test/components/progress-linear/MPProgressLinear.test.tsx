import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPProgressLinear } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

describe('MPProgressLinear', () => {
  describe('rendering', () => {
    it('renders a progressbar', async () => {
      const screen = await render(<MPProgressLinear value={40} />);

      await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('reports the value and the range', async () => {
      const screen = await render(<MPProgressLinear value={3} min={0} max={4} />);
      const bar = screen.getByRole('progressbar').element();

      expect(bar).toHaveAttribute('aria-valuenow', '3');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '4');
    });

    it('names itself with the label it was given', async () => {
      const screen = await render(<MPProgressLinear value={40} label="Uploading" />);

      await expect
        .element(screen.getByRole('progressbar', { name: 'Uploading' }))
        .toBeInTheDocument();
    });
  });

  describe('the indeterminate case', () => {
    it('is the default, and reports no value at all', async () => {
      const screen = await render(<MPProgressLinear />);

      expect(screen.getByRole('progressbar').element()).not.toHaveAttribute('aria-valuenow');
    });

    it('draws two sweeping bars rather than a fill', async () => {
      // The second bar is what stops the groove being empty for most of the
      // cycle; Base UI renders no indicator at all without a value, so both are
      // this component's.
      await render(<MPProgressLinear />);

      expect(document.querySelectorAll('.mp-progress-linear-lead')).toHaveLength(1);
      expect(document.querySelectorAll('.mp-progress-linear-trail')).toHaveLength(1);
    });

    it('goes back to a fill once a value arrives', async () => {
      const screen = await render(<MPProgressLinear />);

      await screen.rerender(<MPProgressLinear value={40} />);

      expect(document.querySelector('.mp-progress-linear-lead')).toBeNull();
      expect(screen.getByRole('progressbar').element()).toHaveAttribute('aria-valuenow', '40');
    });
  });

  describe('the value as text', () => {
    it('is a percentage of the range rather than the raw number', async () => {
      // Base UI's own default is `${value}%`, which would read "3%" for step 3
      // of 4.
      const screen = await render(<MPProgressLinear value={3} min={0} max={4} showValue />);

      await expect.element(screen.getByText('75%')).toBeInTheDocument();
    });

    it('hands formatting over once the caller has said what the number means', async () => {
      const screen = await render(
        <MPProgressLinear
          value={1024}
          max={4096}
          showValue
          format={{ style: 'unit', unit: 'megabyte' }}
        />
      );

      expect(screen.getByRole('progressbar').element().textContent).toContain('1,024');
    });

    it('shows nothing while the value is unknown', async () => {
      await render(<MPProgressLinear showValue />);

      expect(document.querySelector('.mp-progress-linear .tabular-nums')?.textContent).toBe('');
    });
  });

  describe('the arithmetic', () => {
    it('clamps a value past the end of the range', async () => {
      // A bar that renders 140% wide because one request finished twice is a
      // worse bug than a bar that sits full.
      const screen = await render(<MPProgressLinear value={140} showValue />);

      await expect.element(screen.getByText('100%')).toBeInTheDocument();
    });

    it('treats an empty range as having nothing to say', async () => {
      await render(<MPProgressLinear value={5} min={10} max={10} />);

      expect(document.querySelector('.mp-progress-linear-lead')).not.toBeNull();
    });
  });

  describe('the size ladder', () => {
    it('thickens monotonically', async () => {
      const screen = await render(<MPProgressLinear value={40} size="xs" />);
      const heightOf = () =>
        document.querySelector('.mp-progress-linear [class*="rounded-mp-full"]')!.clientHeight;

      let previous = heightOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPProgressLinear value={40} size={size} />);

        const next = heightOf();

        expect(next, `${size} should be thicker than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });
  });

  describe('hideLabel', () => {
    it('keeps the name for a screen reader and takes it off the screen', async () => {
      // The third option, and the one the old `aria-label` was: a `progressbar`
      // announced as "63%" and nothing else is a number with no subject.
      const screen = await render(<MPProgressLinear value={63} label="Uploading" hideLabel />);
      const bar = screen.getByRole('progressbar').element();
      const name = screen.getByText('Uploading').element() as HTMLElement;

      expect(bar).toHaveAccessibleName('Uploading');
      expect(getComputedStyle(name).clipPath).toBe('inset(50%)');
    });

    it('costs the stack no line and no gap', async () => {
      const drawn = await render(<MPProgressLinear value={63} label="Uploading" />);
      const hidden = await render(<MPProgressLinear value={63} label="Uploading" hideLabel />);
      const bare = await render(<MPProgressLinear value={63} />);

      // Scoped to each render's own container: the three above are all on the
      // page at once, and a page-wide role query matches all of them.
      const height = (screen: { container: Element }) =>
        screen.container.querySelector('[role="progressbar"]')!.getBoundingClientRect().height;

      expect(height(hidden)).toBeCloseTo(height(bare), 0);
      expect(height(drawn)).toBeGreaterThan(height(hidden));
    });

    it('draws the name when it is not asked to hide it', async () => {
      const screen = await render(<MPProgressLinear value={63} label="Uploading" />);
      const name = screen.getByText('Uploading').element() as HTMLElement;

      expect(getComputedStyle(name).clipPath).toBe('none');
    });
  });
});
