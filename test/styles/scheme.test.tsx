import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';

/**
 * Which scheme an element ends up in, read off a tone stop rather than off a
 * finished colour.
 *
 * `--_mp-tone-surface` is 0.984 in the light scheme and 0.187 in the dark one,
 * and every surface role is derived from it — so it is the one number that says
 * which of the two ramps an element is reading, without the assertion having to
 * know what the source colour happens to be.
 */
const LIGHT = '0.984';
const DARK = '0.187';

function toneOf(element: Element): string {
  return getComputedStyle(element).getPropertyValue('--_mp-tone-surface').trim();
}

afterEach(() => {
  document.documentElement.removeAttribute('data-mp-scheme');
  document.documentElement.classList.remove('dark');
});

describe('the colour scheme switches', () => {
  it('paints light by default in a light page', async () => {
    const screen = await render(<div data-testid="box">Content</div>);

    expect(toneOf(screen.getByTestId('box').element())).toBe(LIGHT);
  });

  describe('the attribute on the root', () => {
    it('turns the whole page dark', async () => {
      document.documentElement.setAttribute('data-mp-scheme', 'dark');

      const screen = await render(<div data-testid="box">Content</div>);

      expect(toneOf(screen.getByTestId('box').element())).toBe(DARK);
    });

    it('is what `.dark` does too, for Tailwind', async () => {
      document.documentElement.classList.add('dark');

      const screen = await render(<div data-testid="box">Content</div>);

      expect(toneOf(screen.getByTestId('box').element())).toBe(DARK);
    });
  });

  describe('a region', () => {
    it('can be dark inside a light page', async () => {
      const screen = await render(
        <>
          <div data-testid="page">Page</div>
          <div data-mp-scheme="dark" data-testid="region">
            Region
          </div>
        </>
      );

      expect(toneOf(screen.getByTestId('page').element())).toBe(LIGHT);
      expect(toneOf(screen.getByTestId('region').element())).toBe(DARK);
    });

    it('can be light inside a dark page', async () => {
      // The half that did not work. The dark block applies to any element
      // carrying the attribute, so a dark region was always one attribute; the
      // light stops lived on `:root` alone, so the reverse matched no rule and
      // the region simply inherited the dark it was sitting in.
      document.documentElement.setAttribute('data-mp-scheme', 'dark');

      const screen = await render(
        <>
          <div data-testid="page">Page</div>
          <div data-mp-scheme="light" data-testid="region">
            Region
          </div>
        </>
      );

      expect(toneOf(screen.getByTestId('page').element())).toBe(DARK);
      expect(toneOf(screen.getByTestId('region').element())).toBe(LIGHT);
    });

    it('nests either way round', async () => {
      const screen = await render(
        <div data-mp-scheme="dark" data-testid="outer">
          <div data-mp-scheme="light" data-testid="middle">
            <div data-mp-scheme="dark" data-testid="inner">
              Deep
            </div>
          </div>
        </div>
      );

      expect(toneOf(screen.getByTestId('outer').element())).toBe(DARK);
      expect(toneOf(screen.getByTestId('middle').element())).toBe(LIGHT);
      expect(toneOf(screen.getByTestId('inner').element())).toBe(DARK);
    });

    it('inherits into the children of the region', async () => {
      document.documentElement.setAttribute('data-mp-scheme', 'dark');

      const screen = await render(
        <div data-mp-scheme="light">
          <p>
            <span data-testid="deep">Deep inside the light region</span>
          </p>
        </div>
      );

      expect(toneOf(screen.getByTestId('deep').element())).toBe(LIGHT);
    });
  });

  it('leaves the source colour scoped rather than freezing it', async () => {
    // `--mp-source-color` stays on `:root` alone. Repeated on the light block it
    // would override a consumer's own, scoped one on any element that also asked
    // for light.
    const screen = await render(
      <div style={{ ['--mp-source-color' as string]: '#aa3311' }}>
        <div data-mp-scheme="light" data-testid="region">
          Region
        </div>
      </div>
    );

    expect(
      getComputedStyle(screen.getByTestId('region').element())
        .getPropertyValue('--mp-source-color')
        .trim()
    ).toBe('#aa3311');
  });
});
