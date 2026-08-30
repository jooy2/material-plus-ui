import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPCarousel,
  MPGrid,
  MPGridItem,
  MPOtpField,
  MPPagination,
  MPProgressLinear,
  MPRating
} from 'material-plus-ui';

/**
 * The numbers a caller can pass that nobody had in mind.
 *
 * Almost every numeric prop in this library is a count, a divisor or a step, and
 * each of those has values that are none of the three: nought where something
 * has to be divided by it, a negative where a length is meant, a fraction where
 * a whole is. They arrive the same way every time — out of a `length`, a config
 * object, a form — and a component that has not thought about them either throws
 * in render or draws something nonsensical without saying so.
 *
 * The library's habit is to clamp, and nearly everything already did. This suite
 * is the habit written down, because `MPTimePicker`'s column steps were the one
 * that had not: `Array.from({ length: Math.ceil(60 / 0) })` is `Infinity`, which
 * `Array.from` refuses, and a `minuteStep={0}` took the whole picker down.
 *
 * Each case asserts that something sensible was *drawn* rather than that a
 * particular clamp was applied. What matters is that the component survived a
 * number nobody planned for.
 */
describe('numbers nobody planned for', () => {
  describe('MPRating', () => {
    it('draws at least one star, whatever it was told to count', async () => {
      const screen = await render(<MPRating count={0} />);

      expect(screen.container.querySelectorAll('.mp-rating__star').length).toBeGreaterThan(0);
    });

    it('falls back to whole stars for a precision that is not a fraction of one', async () => {
      const screen = await render(<MPRating count={5} precision={0} />);

      // One radio per star rather than none, or an infinity of them.
      expect(screen.container.querySelectorAll('input[type="radio"]')).toHaveLength(5);
    });

    // A row of five stars cannot say ninety-nine, and a picture of a number must
    // not claim one it did not draw.
    it('holds a value above the range to the range it drew', async () => {
      const screen = await render(<MPRating readOnly count={5} value={99} />);

      expect(screen.getByRole('img').element().getAttribute('aria-label')).toContain('5');
    });

    it('holds a value below nought at nought', async () => {
      const screen = await render(<MPRating readOnly count={5} value={-3} />);

      expect(screen.getByRole('img').element().getAttribute('aria-label')).not.toContain('-');
    });
  });

  describe('MPPagination', () => {
    it('draws nothing at all for a single page', async () => {
      const screen = await render(<MPPagination count={1} />);

      expect(screen.container.querySelector('.mp-pagination')).toBeNull();
    });

    it('draws nothing at all for a negative count', async () => {
      const screen = await render(<MPPagination count={-4} />);

      expect(screen.container.querySelector('.mp-pagination')).toBeNull();
    });

    it('holds the current page inside the range it has', async () => {
      const screen = await render(<MPPagination count={5} page={99} />);

      expect(screen.container.querySelector('[aria-current="page"]')?.textContent).toBe('5');
    });
  });

  describe('MPOtpField', () => {
    /*
     * A single box is an `MPTextField` and past twelve the row stops fitting a
     * phone, so the length is held between the two — which also keeps it a
     * number `Array.from` can build a row out of.
     */
    it('draws at least two boxes', async () => {
      const screen = await render(<MPOtpField length={1} />);

      expect(screen.container.querySelectorAll('input').length).toBeGreaterThanOrEqual(2);
    });

    it('draws at most twelve', async () => {
      const screen = await render(<MPOtpField length={99} />);

      expect(screen.container.querySelectorAll('input').length).toBeLessThanOrEqual(13);
    });

    it('rounds a length that is not a whole number of boxes', async () => {
      const screen = await render(<MPOtpField length={4.6} />);

      // The slots a reader can type into. Base UI keeps one more input behind
      // them, which is the value the form submits rather than a box.
      expect(screen.getByRole('textbox').all()).toHaveLength(5);
    });
  });

  describe('MPGrid', () => {
    // The count ends up as a divisor in a `calc()`, and a grid of nought columns
    // is a division by zero that takes the width declaration with it.
    it('divides a row into at least one column', async () => {
      const screen = await render(
        <div style={{ width: 400 }}>
          <MPGrid columns={0}>
            <MPGridItem span={1}>One</MPGridItem>
          </MPGrid>
        </div>
      );
      const item = screen.container.querySelector('.mp-grid-item') as HTMLElement;

      expect(item.getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('draws a span of at least one column', async () => {
      const screen = await render(
        <div style={{ width: 400 }}>
          <MPGrid columns={12}>
            <MPGridItem span={0}>One</MPGridItem>
          </MPGrid>
        </div>
      );
      const item = screen.container.querySelector('.mp-grid-item') as HTMLElement;

      expect(item.getBoundingClientRect().width).toBeGreaterThan(0);
    });

    it('never pushes an item back out of the row with a negative offset', async () => {
      const screen = await render(
        <div style={{ width: 400 }}>
          <MPGrid columns={12}>
            <MPGridItem span={6} offset={-4}>
              One
            </MPGridItem>
          </MPGrid>
        </div>
      );
      const item = screen.container.querySelector('.mp-grid-item') as HTMLElement;
      const row = screen.container.querySelector('.mp-grid') as HTMLElement;

      expect(item.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        row.getBoundingClientRect().left - 1
      );
    });
  });

  describe('MPProgressLinear', () => {
    /*
     * `value` usually arrives from a division somewhere, and a bar that renders
     * 140% wide because one request finished twice is a worse bug than a bar
     * that sits full.
     */
    it('holds a value above the range at the top of it', async () => {
      const screen = await render(<MPProgressLinear value={140} label="Uploading" />);

      expect(screen.getByRole('progressbar').element()).toHaveAttribute('aria-valuenow', '100');
    });

    it('holds a value below the range at the bottom of it', async () => {
      const screen = await render(<MPProgressLinear value={-20} label="Uploading" />);

      expect(screen.getByRole('progressbar').element()).toHaveAttribute('aria-valuenow', '0');
    });

    // A range with nothing in it cannot say how far along anything is, so it
    // says nothing rather than dividing by zero.
    it('reports itself as indeterminate when the range is empty', async () => {
      const screen = await render(<MPProgressLinear value={5} min={10} max={10} label="Working" />);

      expect(screen.getByRole('progressbar').element()).not.toHaveAttribute('aria-valuenow');
    });
  });

  describe('MPCarousel', () => {
    it('survives having nothing to show', async () => {
      const screen = await render(<MPCarousel label="Photographs">{[]}</MPCarousel>);

      expect(screen.getByRole('region', { name: 'Photographs' }).query()).not.toBeNull();
    });

    it('draws no arrows for a single slide', async () => {
      const screen = await render(
        <MPCarousel>
          <div>Only</div>
        </MPCarousel>
      );

      expect(screen.getByRole('button', { name: 'Next slide' }).query()).toBeNull();
    });

    it('holds a starting index outside the strip to the strip', async () => {
      const screen = await render(
        <MPCarousel defaultValue={99}>
          <div>One</div>
          <div>Two</div>
        </MPCarousel>
      );

      // The live region names where the reader is, and it cannot be slide 100.
      expect(screen.container.textContent).toContain('Slide 2 of 2');
    });
  });
});
