import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { CHART_SLOTS, seriesColor } from '../../src/internal/chart';

/**
 * The eight slots as the browser resolves them, which is the only place the
 * `oklch()` and the per-scheme lightness actually meet.
 *
 * Read off a real element rather than off `:root`: the derivations are declared
 * on `*` so that a consumer's own `:root` wins over them, which means `:root` is
 * the one element whose computed value would not prove anything.
 */
function slots(element: Element): string[] {
  const styles = getComputedStyle(element);

  return Array.from({ length: CHART_SLOTS }, (_, i) =>
    styles.getPropertyValue(`--_mp-chart-${i + 1}`).trim()
  );
}

afterEach(() => {
  document.documentElement.removeAttribute('data-mp-scheme');
  document.documentElement.style.removeProperty('--mp-chart-3');
});

describe('the chart palette', () => {
  it('hands out eight colours, and eight different ones', async () => {
    const screen = await render(<div data-testid="box" />);
    const resolved = slots(screen.getByTestId('box').element());

    expect(resolved).toHaveLength(8);
    expect(resolved.every((colour) => colour !== '')).toBe(true);
    expect(new Set(resolved).size).toBe(8);
  });

  it('moves its lightness with the scheme and not its hue', async () => {
    // A series that changed hue when the page went dark would be a series a
    // reader has to learn twice.
    const light = slots((await render(<div data-testid="a" />)).getByTestId('a').element());

    document.documentElement.setAttribute('data-mp-scheme', 'dark');

    const dark = slots((await render(<div data-testid="b" />)).getByTestId('b').element());

    expect(dark).not.toEqual(light);

    // The hue is the third component of every `oklch()` and it is a literal in
    // the sheet, so it survives the scheme verbatim.
    const hue = (colour: string) => colour.split(/\s+/).at(-1);

    expect(light.map(hue)).toEqual(dark.map(hue));
  });

  it('lets a consumer take one slot over', async () => {
    document.documentElement.style.setProperty('--mp-chart-3', 'rgb(1, 2, 3)');

    const screen = await render(<div data-testid="box" />);

    expect(slots(screen.getByTestId('box').element())[2]).toBe('rgb(1, 2, 3)');
  });

  it('hands a series its slot by where it was given, not by what is visible', async () => {
    // A filter that hides the second series must not repaint the third: a reader
    // who learned that Europe is blue has learned something a re-render is not
    // allowed to take back.
    expect(seriesColor(0)).toBe('var(--_mp-chart-1)');
    expect(seriesColor(2)).toBe('var(--_mp-chart-3)');
    expect(seriesColor(8)).toBe('var(--_mp-chart-1)');
  });

  it('lets a series name a role or a colour of its own', async () => {
    expect(seriesColor(4, 'tertiary')).toBe('var(--_mp-color-tertiary)');
    expect(seriesColor(4, '#ff0000')).toBe('#ff0000');
  });
});
