import type * as React from 'react';
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

  /*
   * An item that never asked for an offset used to get the declaration anyway,
   * resolving to `0px` — and a declaration of nought is still a declaration.
   * These rules are unlayered and a Tailwind utility is inside `@layer
   * utilities`, so unlayered wins whatever the source order was, and a caller's
   * own `m-6` lost its inline-start quarter and kept the other three. The
   * application that reported it found out when a thumbnail sat against the wall
   * of the panel it was padded away from.
   *
   * The rule is written into `@layer utilities` here rather than passed as a
   * class, because what is being tested is the layer and not the class: a plain
   * rule of the same specificity would beat the stylesheet on source order and
   * would have passed before the fix too.
   */
  describe('a margin the caller set', () => {
    async function withUtility(node: React.ReactElement) {
      const sheet = document.createElement('style');

      sheet.textContent = '@layer utilities { .mine { margin-inline-start: 24px } }';
      document.head.append(sheet);

      const screen = await render(node);

      return {
        margin: Number.parseFloat(
          getComputedStyle(screen.container.querySelector('.mine')!).marginInlineStart
        ),
        item: screen.container.querySelector('.mine')!,
        done: () => sheet.remove()
      };
    }

    it('survives on an item with no offset', async () => {
      const { margin, item, done } = await withUtility(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={6} className="mine">
              Mine
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(item).not.toHaveAttribute('data-mp-offset');
      expect(margin).toBeCloseTo(24, 0);

      done();
    });

    it('gives way on an item that asked for one', async () => {
      const { margin, item, done } = await withUtility(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={4} offset={4} className="mine">
              Mine
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(item).toHaveAttribute('data-mp-offset');
      expect(margin).toBeCloseTo(400, 0);

      done();
    });

    // Naming the property is asking for it, and nought is what the declaration
    // resolved to anyway — so this is the same answer it has always given.
    it('gives way on an explicit `offset={0}` too', async () => {
      const { margin, item, done } = await withUtility(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={6} offset={0} className="mine">
              Mine
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(item).toHaveAttribute('data-mp-offset');
      expect(margin).toBeCloseTo(0, 0);

      done();
    });
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

  describe('nesting', () => {
    it('does not let an inner item resolve the outer one’s span', async () => {
      // The slots are inherited custom properties, so an inner item that only
      // declares `compact` used to resolve the *outer* item's `large` at every
      // class above it: `span={12}` came out a sixth of the row it was in.
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={{ compact: 12, large: 2 }} className="outer">
              <MPGrid spacing={0}>
                <MPGridItem span={12} className="inner">
                  Inner
                </MPGridItem>
              </MPGrid>
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(width(screen.container.querySelector('.outer')!)).toBeCloseTo(200, 0);
      expect(width(screen.container.querySelector('.inner')!)).toBeCloseTo(200, 0);
    });

    it('does not let an inner grid resolve the outer one’s column count', async () => {
      // The same inheritance, one level up and missed for longer. `columns={4}`
      // is one slot, so above compact the inner grid was reading the *outer*
      // grid's — four columns on a phone and two on a laptop, from a grid that
      // was told four at every width.
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid columns={{ compact: 4, large: 2 }} spacing={0}>
            <MPGridItem span={1} className="outer">
              <MPGrid columns={4} spacing={0}>
                <MPGridItem span={1} className="inner">
                  Inner
                </MPGridItem>
              </MPGrid>
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(width(screen.container.querySelector('.outer')!)).toBeCloseTo(600, 0);
      expect(width(screen.container.querySelector('.inner')!)).toBeCloseTo(150, 0);
    });

    it('does not let an inner grid inherit the outer one’s gutter', async () => {
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={{ compact: 0, large: 8 }}>
            <MPGridItem span={12}>
              <MPGrid spacing={0} className="inner">
                <MPGridItem span={6}>Inner</MPGridItem>
              </MPGrid>
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(getComputedStyle(screen.container.querySelector('.inner')!).columnGap).toBe('0px');
    });

    it('clears the offsets at the boundary too', async () => {
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={6} offset={{ compact: 0, large: 6 }}>
              <MPGrid spacing={0}>
                <MPGridItem span={6} className="inner">
                  Inner
                </MPGridItem>
              </MPGrid>
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(getComputedStyle(screen.container.querySelector('.inner')!).marginInlineStart).toBe(
        '0px'
      );
    });
  });

  describe('span="grow"', () => {
    it('takes the width the row has left', async () => {
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={3} className="thumb">
              Thumb
            </MPGridItem>
            <MPGridItem span="grow" className="body">
              Body
            </MPGridItem>
          </MPGrid>
        </div>
      );

      expect(width(screen.container.querySelector('.thumb')!)).toBeCloseTo(300, 0);
      expect(width(screen.container.querySelector('.body')!)).toBeCloseTo(900, 0);
    });

    it('splits the remainder equally between two of them', async () => {
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            {/* Not `className="fixed"` — that is Tailwind's `position: fixed`,
                and an item taken out of the flow is not in the row whose
                remainder is being measured. */}
            <MPGridItem span={2} className="anchor">
              Anchor
            </MPGridItem>
            <MPGridItem span="grow" className="one">
              A much longer run of words than the other one has
            </MPGridItem>
            <MPGridItem span="grow" className="two">
              Short
            </MPGridItem>
          </MPGrid>
        </div>
      );

      // Equally, and not in proportion to what is inside them: both start from a
      // width of nought, which is what `flex-basis` would otherwise decide.
      expect(width(screen.container.querySelector('.one')!)).toBeCloseTo(500, 0);
      expect(width(screen.container.querySelector('.two')!)).toBeCloseTo(500, 0);
    });

    it('is responsive like any other span', async () => {
      // The suite runs in a `large` window, so the `large` entry is the live one
      // and the `compact` entry is the one it has to override.
      const screen = await render(
        <div style={{ width: 1200 }}>
          <MPGrid spacing={0}>
            <MPGridItem span={4} className="side">
              Side
            </MPGridItem>
            <MPGridItem span={{ compact: 'grow', large: 2 }} className="cell">
              Cell
            </MPGridItem>
          </MPGrid>
        </div>
      );

      // A number at `large` has to switch the growing back off, or the width
      // below would be multiplied by nought.
      expect(width(screen.container.querySelector('.cell')!)).toBeCloseTo(200, 0);
    });

    it('writes no growth slot for a span that never mentions it', async () => {
      const screen = await render(
        <MPGrid>
          <MPGridItem span={{ compact: 12, large: 6 }} className="plain">
            Plain
          </MPGridItem>
        </MPGrid>
      );
      const style = (screen.container.querySelector('.plain') as HTMLElement).getAttribute(
        'style'
      )!;

      expect(style).not.toContain('--_mp-grow');
    });
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
