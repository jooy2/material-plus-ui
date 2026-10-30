import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAreaChart } from 'material-plus-ui';

const CATEGORIES = ['Jan', 'Feb', 'Mar', 'Apr'];
const TWO = [
  { name: 'Storage', data: [10, 10, 10, 10] },
  { name: 'Backups', data: [5, 5, 5, 5] }
];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-chart svg');
const bands = () =>
  Array.from(document.querySelectorAll('.mp-area-chart__marks path')).filter(
    (path) => path.getAttribute('fill') !== 'none'
  );
const edges = () =>
  Array.from(document.querySelectorAll('.mp-area-chart__marks path')).filter(
    (path) => path.getAttribute('fill') === 'none'
  );

const drawn = () => expect.poll(() => svg() !== null).toBe(true);

/** Every y in a path's `d`, which is all these assertions need. */
const ys = (node: Element | undefined) =>
  [...(node?.getAttribute('d') ?? '').matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) =>
    Number(m[2])
  );

/** The highest point of a shape, which on a screen is the smallest y. */
const highest = (node: Element | undefined) => Math.min(...ys(node));

describe('MPAreaChart', () => {
  it('keeps zero on the axis, because a fill measures from a baseline', async () => {
    // A filled area's size encodes the quantity, so it is proportional to the
    // value only from zero. This is the one place this chart and the line chart
    // have to disagree.
    await render(
      <MPAreaChart categories={['a', 'b']} series={[{ data: [3200, 3400] }]} locale="en-US" />
    );
    await drawn();

    const ticks = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent
    );

    expect(ticks).toContain('0');
  });

  it('stands every band on the baseline when they are not stacked', async () => {
    await render(<MPAreaChart categories={CATEGORIES} series={TWO} locale="en-US" />);
    await drawn();

    await expect.poll(() => bands().length).toBe(2);
    // Storage is 10 and Backups is 5, so the larger series reaches higher —
    // which is only true because both are measured from the same floor.
    expect(highest(bands()[0])).toBeLessThan(highest(bands()[1]));
  });

  it('puts the second band on top of the first when they are stacked', async () => {
    // The top edge of a stack is the total, so 10 + 5 has to reach higher than
    // 10 alone — and higher than the 10-band's own top.
    await render(<MPAreaChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />);
    await drawn();

    await expect.poll(() => bands().length).toBe(2);
    expect(highest(bands()[1])).toBeLessThan(highest(bands()[0]));
  });

  it('takes the gap out of the band above the boundary', async () => {
    // The two pixels of surface between neighbours come from the upper band, so
    // the edge below it stays exactly where its total puts it. That edge is the
    // data, and moving it to make room would report a number nobody has.
    await render(
      <MPAreaChart
        categories={CATEGORIES}
        series={TWO}
        stacked
        yAxis={{ min: 0, max: 15 }}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => edges().length).toBe(2);

    // Storage's top line, and the underside of the band sitting on it.
    const boundary = highest(edges()[0]);
    const restsAt = Math.max(...ys(bands()[1]));

    expect(restsAt).toBeCloseTo(boundary - 2, 5);
  });

  it('re-stacks the survivors rather than leaving a hole', async () => {
    const screen = await render(
      <MPAreaChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />
    );
    await drawn();

    await screen.getByRole('button', { name: 'Storage', exact: true }).click();

    await expect.poll(() => bands().length).toBe(1);
    // Backups now stands on the axis rather than floating where Storage was.
    const floor = Math.max(...ys(bands()[0]));
    const top = highest(bands()[0]);

    expect(floor - top).toBeGreaterThan(0);
  });

  it('stacks negatives downward rather than folding them into the total', async () => {
    // A category holding +8 and −3 is two runs from the baseline, eleven units
    // apart. One band that had crossed itself would draw a total of five.
    await render(
      <MPAreaChart
        categories={['a', 'b']}
        series={[
          { name: 'Gained', data: [8, 8] },
          { name: 'Lost', data: [-3, -3] }
        ]}
        stacked
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => bands().length).toBe(2);
    // Lost sits entirely below where Gained starts, so its lowest point is
    // further down the screen than anything in Gained.
    expect(Math.max(...ys(bands()[1]))).toBeGreaterThan(Math.max(...ys(bands()[0])));
  });

  it('breaks the band at a gap rather than filling across it', async () => {
    // The same lie the bridged line tells, painted over more of the chart.
    await render(
      <MPAreaChart
        categories={CATEGORIES}
        series={[{ name: 'Storage', data: [10, 12, null, 14] }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => (bands()[0]?.getAttribute('d')?.match(/M/g) ?? []).length).toBe(2);
  });

  it('draws the top edge in full colour over a faint fill', async () => {
    // A band a reader can follow needs one line they can actually see, and an
    // overlapping fill has to stay faint enough for the bands behind it.
    await render(<MPAreaChart categories={CATEGORIES} series={TWO} locale="en-US" />);
    await drawn();

    await expect.poll(() => Number(bands()[0]?.getAttribute('fill-opacity'))).toBeLessThan(0.3);
    expect(edges()[0]?.getAttribute('stroke')).toBe('var(--_mp-chart-1)');
  });

  it('fills a stacked band nearly solid, having nothing behind it', async () => {
    await render(<MPAreaChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />);
    await drawn();

    await expect.poll(() => Number(bands()[0]?.getAttribute('fill-opacity'))).toBeGreaterThan(0.5);
  });

  it('leaves the markers off a stack, where a vertex belongs to a boundary', async () => {
    await render(<MPAreaChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />);
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-area-chart__marks circle').length)
      .toBe(0);
  });

  it('draws them on an unstacked chart with room for them', async () => {
    await render(<MPAreaChart categories={CATEGORIES} series={TWO} locale="en-US" />);
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-area-chart__marks circle').length)
      .toBe(8);
  });

  it('fills the plot when the stack is a percent one', async () => {
    // What a percent stack compares is the composition, so the top edge is flat
    // and the totals leave the picture entirely.
    await render(
      <MPAreaChart
        categories={CATEGORIES}
        series={[
          { name: 'Storage', data: [10, 100, 1, 50] },
          { name: 'Backups', data: [30, 300, 3, 50] }
        ]}
        stacked="percent"
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => bands().length).toBe(2);
    // The three columns whose two parts are in the same proportion put the
    // boundary between them at the same height.
    const boundary = ys(edges()[0]);

    expect(new Set(boundary.slice(0, 3).map(Math.round)).size).toBe(1);
  });

  it('writes the share rather than the value on a percent stack', async () => {
    await render(
      <MPAreaChart
        categories={['a', 'b']}
        series={[
          { name: 'Storage', data: [25, 25] },
          { name: 'Backups', data: [75, 75] }
        ]}
        stacked="percent"
        valueLabels="all"
        locale="en-US"
      />
    );
    await drawn();

    const written = () =>
      Array.from(document.querySelectorAll('.mp-area-chart__marks text')).map(
        (node) => node.textContent
      );

    // Each band writes its **own** share rather than the running total: a label
    // on the top band saying 100% would be the stack's number and not its own.
    await expect.poll(written).toContain('25%');
    expect(written()).toContain('75%');
    expect(written()).not.toContain('100%');
  });

  it('closes the fill across a gap when asked, and marks the joining edge', async () => {
    // The fill either side of a closed gap is one shape; the dashed edge is the
    // part of its outline the chart is guessing at.
    await render(
      <MPAreaChart
        categories={CATEGORIES}
        series={[{ name: 'Storage', data: [10, null, 10, 12] }]}
        gaps="connect"
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => bands().length).toBe(1);
    // One `M` is one unbroken ribbon. Broken, this is two.
    expect(bands()[0]?.getAttribute('d')?.match(/M/g)?.length).toBe(1);
    expect(edges().some((edge) => edge.getAttribute('stroke-dasharray'))).toBe(true);
  });

  it('leaves the fill broken by default', async () => {
    await render(
      <MPAreaChart
        categories={CATEGORIES}
        series={[{ name: 'Storage', data: [10, null, 10, 12] }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => bands()[0]?.getAttribute('d')?.match(/M/g)?.length).toBe(2);
  });

  it('draws a gap at the baseline when it is told the gap is a zero', async () => {
    await render(
      <MPAreaChart
        categories={CATEGORIES}
        series={[{ name: 'Storage', data: [10, null, 10, 12] }]}
        gaps="zero"
        locale="en-US"
      />
    );
    await drawn();

    // One unbroken band again, and the top edge itself now touches the
    // baseline the surrounding months stand well clear of.
    await expect.poll(() => bands()[0]?.getAttribute('d')?.match(/M/g)?.length).toBe(1);

    expect(Math.max(...ys(edges()[0]))).toBeCloseTo(Math.max(...ys(bands()[0])), 0);
  });

  it('carries the frame’s hover layer, keyboard and table', async () => {
    await render(
      <MPAreaChart categories={CATEGORIES} series={TWO} label="Disk use" locale="en-US" />
    );
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Jan');

    const table = document.getElementById(plot().getAttribute('aria-describedby') ?? '');

    expect(table?.querySelector('caption')?.textContent).toBe('Disk use');
  });
});
