import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPStatistic } from 'material-plus-ui';

const value = () => document.querySelector('.mp-statistic__value')?.textContent ?? '';
const delta = () => document.querySelector('.mp-statistic__delta');

describe('MPStatistic', () => {
  it('writes a number the way the locale writes it', async () => {
    await render(<MPStatistic label="Installs" value={1284} locale="en-US" />);

    expect(value()).toBe('1,284');
  });

  describe('compacting', () => {
    it('leaves a figure alone until a thousand', async () => {
      // `1,284` is read at a glance; `1.3K` threw away two digits to save two
      // characters. Compacting starts where the digits stop being read.
      const screen = await render(<MPStatistic value={999} locale="en-US" />);

      expect(value()).toBe('999');

      await screen.rerender(<MPStatistic value={12900} locale="en-US" />);
      expect(value()).toBe('12.9K');

      await screen.rerender(<MPStatistic value={4200000} locale="en-US" />);
      expect(value()).toBe('4.2M');
    });

    it('does not compact what a caller has already formatted', async () => {
      // Somebody who asked for a currency has said what they want.
      await render(
        <MPStatistic
          value={4200000}
          locale="en-US"
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        />
      );

      expect(value()).toContain('$4,200,000');
    });

    it('can be turned off', async () => {
      await render(<MPStatistic value={12900} compact={false} locale="en-US" />);

      expect(value()).toBe('12,900');
    });

    it('draws a value that is not a number exactly as it was given', async () => {
      await render(<MPStatistic value="2h 14m" locale="en-US" />);

      expect(value()).toBe('2h 14m');
    });
  });

  describe('the move', () => {
    it('is signed, so the direction survives without the arrow', async () => {
      // The glyph and the colour are for a reader who can see them; the sign is
      // what a screen reader hears, which is why there is no second sentence.
      await render(<MPStatistic value={128400} previousValue={119200} locale="en-US" />);

      expect(delta()?.textContent).toContain('+7.7%');
      expect(delta()).toHaveAttribute('data-mp-direction', 'up');
    });

    it('calls a fall good when the caller says falling is good', async () => {
      // Churn, latency, cost and error rate are all better when they drop, and a
      // component that painted every fall red would be wrong about half a
      // dashboard.
      const screen = await render(
        <MPStatistic value={4} previousValue={10} locale="en-US" betterWhen="down" />
      );

      expect(delta()?.className).toContain('text-mp-tertiary');

      await screen.rerender(<MPStatistic value={4} previousValue={10} locale="en-US" />);

      expect(delta()?.className).toContain('text-mp-error');
    });

    it('treats flat as a third state rather than a quiet rise', async () => {
      // A figure that has not moved has not done anything good either.
      await render(<MPStatistic value={10} previousValue={10} locale="en-US" />);

      expect(delta()).toHaveAttribute('data-mp-direction', 'flat');
      expect(delta()?.className).toContain('text-mp-on-surface-variant');
    });

    it('gives the absolute move rather than a percentage of nothing', async () => {
      // Something that was zero has not grown by an amount, it has started, and
      // every percentage that could be printed there is one a reader would
      // believe.
      await render(<MPStatistic value={40} previousValue={0} locale="en-US" />);

      expect(delta()?.textContent).toContain('+40');
      expect(delta()?.textContent).not.toContain('%');
    });

    it('writes it the way it is asked to', async () => {
      const screen = await render(
        <MPStatistic value={120} previousValue={100} locale="en-US" delta="absolute" />
      );

      expect(delta()?.textContent).toContain('+20');
      expect(delta()?.textContent).not.toContain('%');

      await screen.rerender(
        <MPStatistic value={120} previousValue={100} locale="en-US" delta="both" />
      );

      expect(delta()?.textContent).toContain('+20');
      expect(delta()?.textContent).toContain('+20%');

      await screen.rerender(
        <MPStatistic value={120} previousValue={100} locale="en-US" delta="none" />
      );

      expect(delta()).toBeNull();
    });

    it('says nothing at all without something to compare against', async () => {
      await render(<MPStatistic value={120} locale="en-US" />);

      expect(delta()).toBeNull();
    });
  });

  it('keeps the figure in the surface ink whichever way it went', async () => {
    // The number is the thing being reported. A reported value that changes
    // colour with its own trend is one the reader has to decode before reading.
    await render(<MPStatistic value={4} previousValue={10} locale="en-US" />);

    expect(document.querySelector('.mp-statistic__value')?.className).toContain(
      'text-mp-on-surface'
    );
  });

  it('holds a picture of itself without owning one', async () => {
    const screen = await render(
      <MPStatistic value={10} trend={<svg data-testid="spark" />} locale="en-US" />
    );

    await expect.element(screen.getByTestId('spark')).toBeInTheDocument();
  });
});
