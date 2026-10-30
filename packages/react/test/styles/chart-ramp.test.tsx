import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { RAMP_STEPS, rampFill, rampInk, rampStep } from '../../src/internal/chart';

/**
 * The five steps as the browser resolves them.
 *
 * Read off a real element rather than off `:root`, for the reason the palette
 * test gives: the derivations are declared on `*` so a consumer's own `:root`
 * wins over them, which makes `:root` the one element whose computed value
 * proves nothing.
 */
function steps(element: Element): string[] {
  const styles = getComputedStyle(element);

  return Array.from({ length: RAMP_STEPS }, (_, i) =>
    styles.getPropertyValue(`--_mp-chart-scale-${i + 1}`).trim()
  );
}

/** The lightness out of an `oklch(L C H)`, which is what a ramp is ordered by. */
const lightness = (colour: string) => Number(/oklch\(\s*([\d.]+)/.exec(colour)?.[1] ?? NaN);

afterEach(() => {
  document.documentElement.removeAttribute('data-mp-scheme');
  document.documentElement.style.removeProperty('--mp-chart-scale-3');
});

describe('the sequential ramp', () => {
  it('has five steps, and five different ones', async () => {
    const screen = await render(<div data-testid="box" />);
    const resolved = steps(screen.getByTestId('box').element());

    expect(resolved).toHaveLength(5);
    expect(resolved.every((colour) => colour !== '')).toBe(true);
    expect(new Set(resolved).size).toBe(5);
  });

  it('runs pale to deep on a light page', async () => {
    // A ramp that was not monotone in lightness would be a ramp whose order a
    // reader cannot see, which is the only thing it is for.
    const screen = await render(<div data-testid="box" />);
    const levels = steps(screen.getByTestId('box').element()).map(lightness);

    expect(levels.every((value) => Number.isFinite(value))).toBe(true);

    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]).toBeLessThan(levels[i - 1]);
    }
  });

  it('runs deep to bright on a dark one', async () => {
    // The anchor flips rather than the hue: "more" has to be further from the
    // page in both schemes, and a ramp that ran the same way in the dark would
    // put its high end where the eye reads nothing.
    document.documentElement.setAttribute('data-mp-scheme', 'dark');

    const screen = await render(<div data-testid="box" />);
    const levels = steps(screen.getByTestId('box').element()).map(lightness);

    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]).toBeGreaterThan(levels[i - 1]);
    }
  });

  it('keeps one hue throughout, in both schemes', async () => {
    const hue = (colour: string) => colour.split(/\s+/).at(-1);
    const light = steps((await render(<div data-testid="a" />)).getByTestId('a').element());

    expect(new Set(light.map(hue)).size).toBe(1);

    document.documentElement.setAttribute('data-mp-scheme', 'dark');

    const dark = steps((await render(<div data-testid="b" />)).getByTestId('b').element());

    expect(new Set(dark.map(hue)).size).toBe(1);
    expect(hue(dark[0])).toBe(hue(light[0]));
  });

  it('takes the same hue as the palette’s first slot', async () => {
    // A chart using both an identity colour and a ramp should read as one
    // family rather than as two libraries.
    const screen = await render(<div data-testid="box" />);
    const styles = getComputedStyle(screen.getByTestId('box').element());
    const hue = (colour: string) => colour.split(/\s+/).at(-1);

    expect(hue(styles.getPropertyValue('--_mp-chart-scale-1').trim())).toBe(
      hue(styles.getPropertyValue('--_mp-chart-1').trim())
    );
  });

  it('lets one step be overridden the way a colour role is', async () => {
    document.documentElement.style.setProperty('--mp-chart-scale-3', 'rebeccapurple');

    const screen = await render(<div data-testid="box" />);

    expect(steps(screen.getByTestId('box').element())[2]).toBe('rebeccapurple');
  });
});

describe('rampStep', () => {
  it('spreads the range evenly over the five steps', () => {
    expect(rampStep(0)).toBe(0);
    expect(rampStep(0.5)).toBe(2);
    expect(rampStep(1)).toBe(4);
  });

  it('clamps rather than running off either end', () => {
    // A pinned scale lets a value sit outside it, and a step index past the
    // ramp would resolve to a custom property that does not exist.
    expect(rampStep(-3)).toBe(0);
    expect(rampStep(9)).toBe(4);
    expect(rampStep(Number.NaN)).toBe(0);
  });
});

describe('rampInk', () => {
  it('flips to the light ink on the two deepest steps', () => {
    // A threshold rather than a contrast calculation: the ramp is five fixed
    // colours, so the answer was settled when it was fitted.
    expect(rampInk(0)).toBe('var(--_mp-color-on-surface)');
    expect(rampInk(2)).toBe('var(--_mp-color-on-surface)');
    expect(rampInk(3)).toBe('var(--_mp-color-surface)');
    expect(rampInk(4)).toBe('var(--_mp-color-surface)');
  });
});

describe('rampFill', () => {
  it('names the step it was given', () => {
    expect(rampFill(0)).toBe('var(--_mp-chart-scale-1)');
    expect(rampFill(4)).toBe('var(--_mp-chart-scale-5)');
  });

  it('never names a step the sheet does not define', () => {
    expect(rampFill(-1)).toBe('var(--_mp-chart-scale-1)');
    expect(rampFill(99)).toBe('var(--_mp-chart-scale-5)');
  });
});
