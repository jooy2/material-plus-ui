import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { MPLineChart } from 'material-plus-ui';

const CATEGORIES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const ONE = [{ name: 'Signups', data: [120, 138, 131, 164, 190] }];
const TWO = [
  { name: 'Signups', data: [120, 138, 131, 164, 190] },
  { name: 'Trials', data: [60, 71, 88, 79, 104] }
];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-chart svg');
const lines = () =>
  Array.from(document.querySelectorAll('.mp-line-chart__marks path')).filter(
    (path) => path.getAttribute('fill') === 'none'
  );

/** The frame measures itself in an effect, so nothing is drawn on the first pass. */
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

/** Puts the pointer over a column, which is what the frame hit-tests against. */
async function hover(fraction: number) {
  const box = plot().getBoundingClientRect();

  plot().dispatchEvent(
    new PointerEvent('pointermove', {
      bubbles: true,
      clientX: box.left + box.width * fraction,
      clientY: box.top + box.height / 2
    })
  );
}

describe('MPLineChart', () => {
  it('draws one path per series', async () => {
    await render(<MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />);
    await drawn();

    await expect.poll(() => lines().length).toBe(2);
  });

  it('breaks the line at a gap rather than drawing through it', async () => {
    // A bridged gap draws a straight run through values nobody has, and it is
    // the one kind of invented data a reader never questions — it looks exactly
    // like the rest of the line.
    await render(
      <MPLineChart
        categories={CATEGORIES}
        series={[{ name: 'Signups', data: [120, 138, null, 164, 190] }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => (lines()[0]?.getAttribute('d')?.match(/M/g) ?? []).length).toBe(2);
  });

  it('leaves zero out of the scale, so a real change is not drawn as flat', async () => {
    // A line encodes position rather than length, so cropping the scale moves
    // every point by the same amount and the picture survives. Forcing zero
    // onto a series between 3,200 and 3,400 reports a change as nothing.
    await render(
      <MPLineChart categories={['a', 'b']} series={[{ data: [3200, 3400] }]} locale="en-US" />
    );
    await drawn();

    const ticks = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent
    );

    expect(ticks).not.toContain('0');
  });

  it('takes a zero baseline when the caller says the axis has one', async () => {
    await render(
      <MPLineChart
        categories={['a', 'b']}
        series={[{ data: [3200, 3400] }]}
        yAxis={{ min: 0 }}
        locale="en-US"
      />
    );
    await drawn();

    const ticks = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent
    );

    expect(ticks).toContain('0');
  });

  it('leaves the legend off a chart with one series', async () => {
    // A legend with one swatch in it restates the title.
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);

    expect(document.querySelector('.mp-chart__legend')).toBeNull();
  });

  it('draws one from two series up', async () => {
    await render(<MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />);

    expect(document.querySelectorAll('.mp-chart__legend li').length).toBe(2);
  });

  it('takes a series out of the plot when its legend entry is pressed', async () => {
    const screen = await render(
      <MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />
    );
    await drawn();

    await screen.getByRole('button', { name: 'Trials', exact: true }).click();

    await expect.poll(() => lines().length).toBe(1);
  });

  it('leaves the survivors the colour they already had', async () => {
    // A reader who learned that blue is Signups learned something a re-render
    // is not allowed to take back, so the palette slot comes from a series'
    // place in the array rather than from how many neighbours are visible.
    const screen = await render(
      <MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />
    );
    await drawn();

    const before = lines()[0]?.getAttribute('stroke');

    await screen.getByRole('button', { name: 'Signups', exact: true }).click();

    await expect.poll(() => lines().length).toBe(1);
    // Trials is the only line left, and it still wears slot two.
    expect(lines()[0]?.getAttribute('stroke')).not.toBe(before);
    expect(lines()[0]?.getAttribute('stroke')).toBe('var(--_mp-chart-2)');
  });

  it('marks the legend as a control rather than a picture of one', async () => {
    const screen = await render(
      <MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />
    );
    const entry = screen.getByRole('button', { name: 'Trials', exact: true });

    await expect.element(entry).toHaveAttribute('aria-pressed', 'true');
    await entry.click();
    await expect.element(entry).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the panel and drops a crosshair where the pointer is', async () => {
    await render(<MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />);
    await drawn();
    await hover(0.5);

    await expect.poll(() => document.querySelector('.mp-chart__tooltip') !== null).toBe(true);
    expect(document.querySelectorAll('.mp-chart__tooltip li').length).toBe(2);
  });

  it('closes it again when the pointer leaves', async () => {
    // Driven with a real pointer rather than a dispatched `pointerleave`:
    // React synthesises leave from `pointerout` and its `relatedTarget`, so a
    // hand-made leave event reaches no handler and would pass on nothing.
    const screen = await render(
      <>
        <MPLineChart categories={CATEGORIES} series={TWO} locale="en-US" />
        <button type="button">Elsewhere</button>
      </>
    );
    await drawn();

    await userEvent.hover(plot());
    await expect.poll(() => document.querySelector('.mp-chart__tooltip') !== null).toBe(true);

    await userEvent.hover(screen.getByRole('button', { name: 'Elsewhere', exact: true }));

    await expect.poll(() => document.querySelector('.mp-chart__tooltip')).toBeNull();
  });

  it('walks the columns with the arrow keys', async () => {
    // The keyboard route is not a convenience: it is the only way a reader who
    // is not using a pointer reaches the numbers the hover layer carries.
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Mon');
  });

  it('says the active column out loud, outside the picture', async () => {
    // `role="img"` is a leaf role, so a live region inside it announces to
    // nobody. This one is a sibling of the plot for exactly that reason.
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    const status = document.querySelector('[role="status"]');

    expect(plot().contains(status)).toBe(false);
    await expect.poll(() => status?.textContent).toContain('190');
  });

  it('clears the active column on Escape', async () => {
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await expect.poll(() => document.querySelector('.mp-chart__tooltip') !== null).toBe(true);

    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await expect.poll(() => document.querySelector('.mp-chart__tooltip')).toBeNull();
  });

  it('describes the picture with the numbers behind it', async () => {
    await render(
      <MPLineChart categories={CATEGORIES} series={TWO} label="Weekly funnel" locale="en-US" />
    );
    await drawn();

    const id = plot().getAttribute('aria-describedby');
    const table = document.getElementById(id ?? '');

    expect(table?.querySelector('caption')?.textContent).toBe('Weekly funnel');
    // One row per category, and one column per series beside the category's own.
    expect(table?.querySelectorAll('tbody tr').length).toBe(5);
    expect(table?.querySelectorAll('thead th').length).toBe(3);
  });

  it('is one tab stop, named even when the caller named nothing', async () => {
    // A focusable `role="img"` with nothing to be called by is a tab stop that
    // announces silence.
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);

    expect(plot().getAttribute('role')).toBe('img');
    expect(plot().getAttribute('tabindex')).toBe('0');
    expect(plot().getAttribute('aria-label')).toBe('Chart');
  });

  it('draws the empty state rather than an axis of nothing', async () => {
    await render(<MPLineChart series={[]} locale="en-US" />);

    expect(document.querySelector('.mp-chart svg')).toBeNull();
    expect(plot().textContent).toBe('No data');
    // Nothing to walk, so it is not a tab stop either.
    expect(plot().getAttribute('tabindex')).toBeNull();
  });

  it('drops the markers once the line is denser than they are', async () => {
    // A dot every three pixels is not a row of dots, it is a thicker line.
    await render(
      <MPLineChart
        series={[{ data: Array.from({ length: 200 }, (_, i) => i % 40) }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-line-chart__marks circle').length)
      .toBe(0);
  });

  it('draws them when they have room to be separate marks', async () => {
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-line-chart__marks circle').length)
      .toBe(5);
  });

  it('writes only the last value when asked for the last value', async () => {
    // A number beside every point is the most reliable way to make a chart
    // unreadable, so the labels are opt-in and selective by default.
    await render(
      <MPLineChart categories={CATEGORIES} series={ONE} valueLabels="last" locale="en-US" />
    );
    await drawn();

    const written = Array.from(document.querySelectorAll('.mp-line-chart__marks text')).map(
      (node) => node.textContent
    );

    expect(written).toEqual(['190']);
  });

  it('turns the last value label inward rather than letting it hang off the plot', async () => {
    // A label centred on the last point puts half of itself past the edge, and
    // the last value is usually the whole reason for writing any of them.
    await render(
      <MPLineChart categories={CATEGORIES} series={ONE} valueLabels="last" locale="en-US" />
    );
    await drawn();

    await expect
      .poll(() => document.querySelector('.mp-line-chart__marks text')?.getAttribute('text-anchor'))
      .toBe('end');
  });

  it('centres one that is nowhere near an edge', async () => {
    await render(
      <MPLineChart categories={CATEGORIES} series={ONE} valueLabels="all" locale="en-US" />
    );
    await drawn();

    const anchors = Array.from(document.querySelectorAll('.mp-line-chart__marks text')).map(
      (node) => node.getAttribute('text-anchor')
    );

    expect(anchors[0]).toBe('start');
    expect(anchors[2]).toBe('middle');
    expect(anchors[anchors.length - 1]).toBe('end');
  });

  it('reserves room above the plot for a value label to sit in', async () => {
    // The point at the top of the scale is already at the top of the plot, so
    // without headroom the highest number is the one drawn off the edge.
    await render(
      <MPLineChart categories={CATEGORIES} series={ONE} valueLabels="extremes" locale="en-US" />
    );
    await drawn();

    const label = document.querySelector('.mp-line-chart__marks text') as SVGGraphicsElement | null;

    await expect.poll(() => Number(label?.getAttribute('y'))).toBeGreaterThan(0);
  });

  it('keeps written values in ordinary ink rather than the series colour', async () => {
    // A number written in the mark's colour is a number the reader decodes
    // before they read it, and it fails outright in forced colours.
    await render(
      <MPLineChart categories={CATEGORIES} series={ONE} valueLabels="last" locale="en-US" />
    );
    await drawn();

    expect(document.querySelector('.mp-line-chart__marks text')?.getAttribute('fill')).toBe(
      'var(--_mp-color-on-surface)'
    );
  });

  it('labels both axes when neither is hidden', async () => {
    await render(<MPLineChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-chart__axes text').length)
      .toBeGreaterThan(0);
  });

  it('gives the room back to the plot when both axes are hidden', async () => {
    await render(
      <MPLineChart
        categories={CATEGORIES}
        series={ONE}
        xAxis={{ hidden: true }}
        yAxis={{ hidden: true }}
        locale="en-US"
      />
    );
    await drawn();

    expect(document.querySelectorAll('.mp-chart__axes text').length).toBe(0);
  });

  it('writes its words in the locale it was given', async () => {
    await render(<MPLineChart series={[]} locale="ko" />);

    expect(plot().getAttribute('aria-label')).toBe('차트');
  });
});
