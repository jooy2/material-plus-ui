import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPGrid, MPGridItem } from 'material-plus-ui';

/**
 * A resolved width, in pixels.
 *
 * The suite runs at 1280×900 — see `vitest.config.ts` — which is MD3's `large`
 * window class, so every width below is the one a `large` window resolves to.
 *
 * A number compared with `toBeCloseTo` rather than a string compared exactly: a
 * column is a percentage divided by the column count, and a browser resolves that
 * against a sub-pixel layout unit — a third of 1200px comes back as `399.984px`
 * in Chromium and can differ again in Gecko and WebKit. What is being tested is
 * the arithmetic, not the engine's rounding.
 */
const width = (element: Element) => Number.parseFloat(getComputedStyle(element).width);

describe('MPGrid', () => {
  it('renders what it was handed', async () => {
    const screen = await render(
      <MPGrid>
        <MPGridItem>Cell</MPGridItem>
      </MPGrid>
    );

    await expect.element(screen.getByText('Cell')).toBeInTheDocument();
  });

  it('divides the row by the column count it was given', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={0}>
          <MPGridItem span={6} className="half">
            Half
          </MPGridItem>
          <MPGridItem span={3} className="quarter">
            Quarter
          </MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.half')!)).toBeCloseTo(600, 0);
    expect(width(screen.container.querySelector('.quarter')!)).toBeCloseTo(300, 0);
  });

  it('reads a span against the grid it is in, not against twelve', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid columns={24} spacing={0}>
          <MPGridItem span={12} className="cell">
            Half of twenty-four
          </MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.cell')!)).toBeCloseTo(600, 0);
  });

  it('fills the row when no span was asked for', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={0}>
          <MPGridItem className="cell">Everything</MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.cell')!)).toBeCloseTo(1200, 0);
  });

  it('clamps a span wider than the row instead of overflowing', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={0}>
          <MPGridItem span={99} className="cell">
            Too much
          </MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.cell')!)).toBeCloseTo(1200, 0);
  });

  it('takes the gutter out of the columns rather than out of the grid', async () => {
    // Two halves plus one 16px gutter has to come to the full width, or a grid
    // inside a container would be narrower than the container.
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={4}>
          <MPGridItem span={6} className="first">
            A
          </MPGridItem>
          <MPGridItem span={6} className="second">
            B
          </MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.first')!)).toBeCloseTo(592, 0);
    expect(width(screen.container.querySelector('.second')!)).toBeCloseTo(592, 0);
  });

  it('pushes an item along by its offset', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={0}>
          <MPGridItem span={4} offset={4} className="cell">
            The middle third
          </MPGridItem>
        </MPGrid>
      </div>
    );

    const cell = screen.container.querySelector('.cell')!;

    expect(width(cell)).toBeCloseTo(400, 0);
    expect(Number.parseFloat(getComputedStyle(cell).marginInlineStart)).toBeCloseTo(400, 0);
  });

  it('applies the entry for the window class it is being drawn at', async () => {
    // 1280px is `large`, so the `expanded` entry is the last one at or below the
    // current class and is what wins — which is the whole of the cascade rule.
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={0}>
          <MPGridItem span={{ compact: 12, expanded: 3 }} className="cell">
            Cell
          </MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.cell')!)).toBeCloseTo(300, 0);
  });

  it('writes a slot only for the classes it was given', async () => {
    const screen = await render(
      <MPGrid>
        <MPGridItem span={{ medium: 6 }} className="cell">
          Cell
        </MPGridItem>
      </MPGrid>
    );
    const style = screen.container.querySelector('.cell')!.getAttribute('style') ?? '';

    expect(style).toContain('--_mp-span-medium: 6');
    expect(style).not.toContain('--_mp-span-large');
  });

  it('keeps the documented gutter under a partial map', async () => {
    // A map says "from here up, this instead"; it does not say "and nothing
    // below", so the classes under the one that was named keep the default 4.
    const screen = await render(
      <MPGrid spacing={{ 'extra-large': 8 }} className="grid">
        <MPGridItem>Cell</MPGridItem>
      </MPGrid>
    );
    const style = screen.container.querySelector('.grid')!.getAttribute('style') ?? '';

    expect(style).toContain('--_mp-gap-x-compact: 1rem');
    expect(style).toContain('--_mp-gap-x-extra-large: 2rem');
  });

  it('lets one gutter be set without the other', async () => {
    const screen = await render(
      <MPGrid spacing={2} rowSpacing={8} className="grid">
        <MPGridItem>Cell</MPGridItem>
      </MPGrid>
    );
    const style = screen.container.querySelector('.grid')!.getAttribute('style') ?? '';

    expect(style).toContain('--_mp-gap-x-compact: 0.5rem');
    expect(style).toContain('--_mp-gap-y-compact: 2rem');
  });

  it('divides a nested grid by its own column count', async () => {
    const screen = await render(
      <div style={{ width: 1200 }}>
        <MPGrid spacing={0}>
          <MPGridItem span={6} className="outer">
            <MPGrid columns={2} spacing={0}>
              <MPGridItem span={1} className="inner">
                Half of a half
              </MPGridItem>
            </MPGrid>
          </MPGridItem>
        </MPGrid>
      </div>
    );

    expect(width(screen.container.querySelector('.outer')!)).toBeCloseTo(600, 0);
    expect(width(screen.container.querySelector('.inner')!)).toBeCloseTo(300, 0);
  });

  it('wraps by default and runs on when told not to', async () => {
    const screen = await render(
      <div>
        <MPGrid className="wrapping">
          <MPGridItem>A</MPGridItem>
        </MPGrid>
        <MPGrid wrap={false} className="running">
          <MPGridItem>B</MPGridItem>
        </MPGrid>
      </div>
    );

    expect(getComputedStyle(screen.container.querySelector('.wrapping')!).flexWrap).toBe('wrap');
    expect(getComputedStyle(screen.container.querySelector('.running')!).flexWrap).toBe('nowrap');
  });

  it('takes the alignment words CSS uses', async () => {
    const screen = await render(
      <MPGrid justifyContent="space-between" alignItems="center" className="grid">
        <MPGridItem alignSelf="end" className="cell">
          Cell
        </MPGridItem>
      </MPGrid>
    );
    const grid = getComputedStyle(screen.container.querySelector('.grid')!);

    expect(grid.justifyContent).toBe('space-between');
    expect(grid.alignItems).toBe('center');
    expect(getComputedStyle(screen.container.querySelector('.cell')!).alignSelf).toBe('flex-end');
  });

  it('paints no surface of its own', async () => {
    // A grid is the arrangement of the surfaces inside it, never one itself.
    const screen = await render(
      <MPGrid className="grid">
        <MPGridItem className="cell">Cell</MPGridItem>
      </MPGrid>
    );
    const transparent = 'rgba(0, 0, 0, 0)';

    for (const selector of ['.grid', '.cell']) {
      const styles = getComputedStyle(screen.container.querySelector(selector)!);

      expect(styles.backgroundColor, selector).toBe(transparent);
      expect(styles.padding, selector).toBe('0px');
    }
  });

  it('renders different elements when told to', async () => {
    const screen = await render(
      <MPGrid render={<ul />}>
        <MPGridItem render={<li />}>Cell</MPGridItem>
      </MPGrid>
    );

    expect(screen.container.querySelector('.mp-grid')!.tagName).toBe('UL');
    expect(screen.container.querySelector('.mp-grid-item')!.tagName).toBe('LI');
  });

  it('passes through the attributes a div takes', async () => {
    const screen = await render(
      <MPGrid id="layout" aria-label="Dashboard">
        <MPGridItem id="cell">Cell</MPGridItem>
      </MPGrid>
    );
    const grid = screen.container.querySelector('.mp-grid')!;

    expect(grid).toHaveAttribute('id', 'layout');
    expect(grid).toHaveAttribute('aria-label', 'Dashboard');
    expect(screen.container.querySelector('.mp-grid-item')).toHaveAttribute('id', 'cell');
  });
});
