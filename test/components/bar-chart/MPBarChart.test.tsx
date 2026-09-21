import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPBarChart } from 'material-plus-ui';

const CATEGORIES = ['Search', 'Direct', 'Social', 'Mail'];
const ONE = [{ name: 'Sessions', data: [4820, 3110, 1940, 860] }];
const TWO = [
  { name: 'Sessions', data: [40, 30, 20, 10] },
  { name: 'Signups', data: [20, 15, 10, 5] }
];
const LONG = ['Organic search', 'Paid social', 'Email campaign', 'Referral'];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-chart svg');
const bars = () => Array.from(document.querySelectorAll('.mp-bar-chart__marks path'));

/** Names rather than numbers: the ticks up the left are the other axis. */
const categoryLabels = () =>
  Array.from(document.querySelectorAll('.mp-chart__axes text')).filter((node) =>
    /[A-Za-z]/.test(node.textContent ?? '')
  );
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

/**
 * A bar's box, measured rather than parsed.
 *
 * `getBBox` and not the numbers in the `d`, because a rounded path opens on the
 * corner *after* the arc and its first `h` is the width less two radii — so
 * reading the commands would have every assertion here quietly comparing a
 * rounded bar against a square one.
 */
const box = (node: Element | undefined) => (node as SVGGraphicsElement).getBBox();

/** How many corners a bar has softened. */
const arcs = (node: Element | undefined) => (node?.getAttribute('d')?.match(/a/g) ?? []).length;

describe('MPBarChart', () => {
  it('keeps zero on the axis, because a bar’s length is its value', async () => {
    // Crop the axis and a bar twice the height of its neighbour stands for a
    // value five percent larger, in the shape a reader trusts most.
    await render(
      <MPBarChart categories={['a', 'b']} series={[{ data: [3200, 3400] }]} locale="en-US" />
    );
    await drawn();

    const ticks = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent
    );

    expect(ticks).toContain('0');
  });

  it('draws a bar per category and stands them all on the baseline', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    await expect.poll(() => bars().length).toBe(4);

    // Every bar's bottom is the same line, and the tallest is the largest value.
    const bottoms = bars().map((bar) => box(bar).y + box(bar).height);

    expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThan(0.01);
    expect(box(bars()[0]).height).toBeGreaterThan(box(bars()[3]).height);
  });

  it('rounds only the data end and leaves the baseline square', async () => {
    // A bar rounded where it meets the axis has lost the point it starts from,
    // and a row of them turns the baseline into a scalloped edge.
    await render(<MPBarChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    await expect.poll(() => arcs(bars()[0])).toBe(2);
  });

  it('rounds the bottom of a bar that hangs below zero', async () => {
    // The end furthest from zero is where the value is, whichever way it went.
    await render(
      <MPBarChart categories={['up', 'down']} series={[{ data: [10, -10] }]} locale="en-US" />
    );
    await drawn();

    await expect.poll(() => bars().length).toBe(2);

    // Both are softened at the end furthest from zero, and both start at it:
    // the positive bar's bottom and the negative bar's top are the same line.
    expect(arcs(bars()[0])).toBe(2);
    expect(arcs(bars()[1])).toBe(2);
    expect(box(bars()[0]).y + box(bars()[0]).height).toBeCloseTo(box(bars()[1]).y, 1);
  });

  it('stands two series side by side, each in its own share of the band', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={TWO} locale="en-US" />);
    await drawn();

    await expect.poll(() => bars().length).toBe(8);

    // Signups' first bar is to the right of Sessions' and does not overlap it.
    const first = box(bars()[0]);
    const second = box(bars()[4]);

    expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
  });

  it('centres one bar in the slot when the series are stacked', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />);
    await drawn();

    await expect.poll(() => bars().length).toBe(8);

    // Both segments of a category share one x and one width.
    expect(box(bars()[0]).x).toBeCloseTo(box(bars()[4]).x, 5);
    expect(box(bars()[0]).width).toBeCloseTo(box(bars()[4]).width, 5);
  });

  it('rounds only the outermost segment of a stack', async () => {
    // An inner segment's ends are boundaries between shares rather than the end
    // of anything, so both of its faces stay square.
    await render(<MPBarChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />);
    await drawn();

    await expect.poll(() => arcs(bars()[0])).toBe(0);
    expect(arcs(bars()[4])).toBe(2);
  });

  it('leaves a gap between two stacked segments', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={TWO} stacked locale="en-US" />);
    await drawn();

    await expect.poll(() => bars().length).toBe(8);

    const lower = box(bars()[0]).y;
    const upperBottom = box(bars()[4]).y + box(bars()[4]).height;

    // The upper segment stops two pixels short of the lower one's top edge,
    // and the lower one's edge has not moved to make the room.
    expect(lower - upperBottom).toBeCloseTo(2, 1);
  });

  it('widens the survivors when a series is hidden rather than leaving a hole', async () => {
    // Twelve categories, so the band is narrow enough that the thickness cap is
    // not what decides the width — otherwise both bars come out at the cap and
    // the assertion passes for the wrong reason.
    const many = Array.from({ length: 12 }, (_, i) => `c${i}`);
    const screen = await render(
      <MPBarChart
        categories={many}
        series={[
          { name: 'Sessions', data: many.map((_, i) => i + 1) },
          { name: 'Signups', data: many.map((_, i) => i) }
        ]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => bars().length).toBeGreaterThan(20);
    const grouped = box(bars()[1]).width;

    await screen.getByRole('button', { name: 'Signups', exact: true }).click();

    await expect.poll(() => box(bars()[1]).width).toBeGreaterThan(grouped);
  });

  it('runs the bars sideways when it is turned', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={ONE} horizontal locale="en-US" />);
    await drawn();

    await expect.poll(() => bars().length).toBe(4);
    // The longest bar is now the widest rather than the tallest.
    expect(box(bars()[0]).width).toBeGreaterThan(box(bars()[3]).width);
    expect(box(bars()[0]).height).toBeCloseTo(box(bars()[3]).height, 1);
  });

  it('keeps the axis props meaning the same thing when it is turned', async () => {
    // `xAxis` is the category axis in both orientations. Sending the value
    // format to whichever axis happens to be along the bottom is how a sideways
    // chart ends up printing "Search%".
    await render(
      <MPBarChart
        categories={CATEGORIES}
        series={ONE}
        horizontal
        yAxis={{ tickFormat: (value) => `${value}!` }}
        locale="en-US"
      />
    );
    await drawn();

    const labels = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent ?? ''
    );

    expect(labels.filter((text) => text.endsWith('!')).length).toBeGreaterThan(0);
    expect(labels).toContain('Search');
  });

  it('walks the categories with the arrow keys, sideways too', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={ONE} horizontal locale="en-US" />);
    await drawn();

    plot().focus();
    // Down rather than right: the category axis runs down the side now.
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Search');
  });

  it('steps the other bars back so the crosshair points at something', async () => {
    await render(<MPBarChart categories={CATEGORIES} series={ONE} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

    await expect.poll(() => bars()[0]?.getAttribute('opacity')).toBe('1');
    expect(bars()[1].getAttribute('opacity')).toBe('0.55');
  });

  it('writes values outside the bar rather than on the fill', async () => {
    // Inside, a label has to survive the fill's colour, and one that changes
    // ink with its own value is another thing between the reader and the number.
    await render(
      <MPBarChart categories={CATEGORIES} series={ONE} valueLabels="all" locale="en-US" />
    );
    await drawn();

    await expect.poll(() => document.querySelectorAll('.mp-bar-chart__marks text').length).toBe(4);

    const label = document.querySelector('.mp-bar-chart__marks text');

    expect(label?.getAttribute('fill')).toBe('var(--_mp-color-on-surface)');
    expect(Number(label?.getAttribute('y'))).toBeLessThan(box(bars()[0]).y);
  });

  it('keeps a sideways value label inside the plot', async () => {
    // `headroom` reserves room at the far end of the *value* axis, and which
    // edge that is turns with the chart. Reserved at the top on a horizontal
    // chart it is reserved on the wrong side, and the longest bar's number is
    // drawn past the right edge.
    await render(
      <MPBarChart
        categories={CATEGORIES}
        series={[{ name: 'Sessions', data: [482000, 3110, 1940, 860] }]}
        horizontal
        valueLabels="all"
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => document.querySelectorAll('.mp-bar-chart__marks text').length).toBe(4);

    const frame = svg()!.getBoundingClientRect();
    const widest = document.querySelector('.mp-bar-chart__marks text')!.getBoundingClientRect();

    expect(widest.right).toBeLessThanOrEqual(frame.right);
  });

  it('skips a gap rather than drawing a bar of nothing', async () => {
    await render(
      <MPBarChart categories={CATEGORIES} series={[{ data: [10, null, 20, 30] }]} locale="en-US" />
    );
    await drawn();

    await expect.poll(() => bars().length).toBe(3);
  });

  describe('stacked="percent"', () => {
    it('fills every column, whatever the totals were', async () => {
      // What a percent stack compares is the composition. Two columns of wildly
      // different size are drawn identically, which is the trade it makes.
      await render(
        <MPBarChart
          categories={CATEGORIES}
          series={[
            { name: 'New', data: [10, 100, 1, 50] },
            { name: 'Renewal', data: [30, 300, 3, 50] }
          ]}
          stacked="percent"
          locale="en-US"
        />
      );
      await drawn();

      await expect.poll(() => bars().length).toBe(8);
      // Every column reaches the same height, and the first series takes the
      // same quarter of three of them.
      const tops = bars().map((bar) => Math.round(box(bar).y));

      expect(new Set(tops.slice(4)).size).toBe(1);
      expect(Math.round(box(bars()[0]).height)).toBe(Math.round(box(bars()[1]).height));
    });

    it('runs the axis from nought to a hundred per cent', async () => {
      await render(
        <MPBarChart categories={CATEGORIES} series={TWO} stacked="percent" locale="en-US" />
      );
      await drawn();

      const ticks = () =>
        Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
          (node) => node.textContent
        );

      await expect.poll(ticks).toContain('100%');
      expect(ticks()).toContain('0%');
    });

    it('leaves a negative out, because it has no share of a whole', async () => {
      // The rule `MPPieChart` follows, for the same reason. The table behind
      // the chart still has the number.
      await render(
        <MPBarChart
          categories={CATEGORIES}
          series={[
            { name: 'New', data: [10, -10, 10, 10] },
            { name: 'Renewal', data: [30, 30, 30, 30] }
          ]}
          stacked="percent"
          locale="en-US"
        />
      );
      await drawn();

      // Seven bars for eight readings: the negative is not one of them.
      await expect.poll(() => bars().length).toBe(7);
    });

    it('says both the value and its share in the panel', async () => {
      // The share is what the picture shows and the value is what the reader
      // came for, and neither answers for the other.
      await render(
        <MPBarChart
          categories={CATEGORIES}
          series={[
            { name: 'New', data: [25, 25, 25, 25] },
            { name: 'Renewal', data: [75, 75, 75, 75] }
          ]}
          stacked="percent"
          locale="en-US"
        />
      );
      await drawn();

      plot().focus();
      plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

      await expect
        .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
        .toContain('25%');
      expect(document.querySelector('.mp-chart__tooltip')?.textContent).toContain('75%');
    });
  });

  it('turns a long category name rather than dropping every other one', async () => {
    // A name cut to "Onbo…" has lost the thing it was there to say, and an axis
    // that dropped half of them to make the rest fit is worse again.
    await render(
      <div style={{ width: 420 }}>
        <MPBarChart categories={LONG} series={[{ data: [10, 20, 30, 40] }]} locale="en-US" />
      </div>
    );
    await drawn();

    await expect.poll(() => categoryLabels().length).toBe(4);
    expect(
      categoryLabels().every((node) => node.getAttribute('transform')?.includes('rotate'))
    ).toBe(true);
    // The ones with room behind them print in full; only the first is anywhere
    // near the chart's own left edge.
    expect(
      categoryLabels()
        .slice(1)
        .map((node) => node.textContent)
    ).toEqual(LONG.slice(1));
  });

  it('leaves a short name flat however many of them there are', async () => {
    // An axis of "Q1", "Q2" is crowded by how many of them there are rather
    // than by how long any one is, and every nth is the answer to that.
    await render(
      <MPBarChart
        categories={Array.from({ length: 24 }, (_, at) => `W${at + 1}`)}
        series={[{ data: Array.from({ length: 24 }, (_, at) => at + 1) }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => bars().length).toBe(24);
    expect(categoryLabels().some((node) => node.getAttribute('transform'))).toBe(false);
  });

  it('cuts instead of turning when it is told to', async () => {
    await render(
      <div style={{ width: 420 }}>
        <MPBarChart
          categories={LONG}
          series={[{ data: [10, 20, 30, 40] }]}
          xAxis={{ tickLabels: 'truncate' }}
          locale="en-US"
        />
      </div>
    );
    await drawn();

    await expect.poll(() => categoryLabels().length).toBeGreaterThan(0);
    expect(categoryLabels().some((node) => node.getAttribute('transform'))).toBe(false);
    // Cut, or dropped by the stride — either way, less than the turn showed.
    expect(categoryLabels().map((node) => node.textContent)).not.toEqual(LONG);
  });
});
