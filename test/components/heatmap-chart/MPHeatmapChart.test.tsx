import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPHeatmapChart } from 'material-plus-ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu'];
const HOURS = [
  { name: '09:00', data: [1, 5, 9, 13] },
  { name: '10:00', data: [2, 6, 10, 14] },
  { name: '11:00', data: [3, 7, 11, 15] }
];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-heatmap-chart svg');
const cells = () => Array.from(document.querySelectorAll('.mp-heatmap-chart__cells rect'));
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

const fills = () => cells().map((cell) => cell.getAttribute('fill'));

describe('MPHeatmapChart', () => {
  it('draws a cell per row and column', async () => {
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    await expect.poll(() => cells().length).toBe(12);
  });

  it('colours by a sequential ramp rather than by the identity palette', async () => {
    // The eight chart slots say *which series*; nobody can tell whether slot 6
    // is more than slot 3. A cell has to say how much.
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    await expect.poll(() => fills()[0]).toBe('var(--_mp-chart-scale-1)');
    expect(fills()).not.toContain('var(--_mp-chart-1)');
  });

  it('walks the ramp from the lowest cell to the highest', async () => {
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    await expect.poll(() => cells().length).toBe(12);
    // 1 is the floor and 15 the ceiling, so they take the two ends of the ramp.
    expect(fills()[0]).toBe('var(--_mp-chart-scale-1)');
    expect(fills()[11]).toBe('var(--_mp-chart-scale-5)');
  });

  it('uses five steps and not a gradient', async () => {
    // Given a smooth fill a reader can say "darker" and nothing else; given
    // steps they can match a cell to a band in the legend.
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    await expect.poll(() => new Set(fills()).size).toBeLessThanOrEqual(5);
    expect(new Set(fills()).size).toBeGreaterThan(1);
  });

  it('scales to its own range unless the range is pinned', async () => {
    // Two heatmaps side by side say nothing to each other otherwise: the
    // darkest cell of a quiet week looks like the darkest cell of a bad one.
    await render(
      <MPHeatmapChart categories={DAYS} series={HOURS} min={0} max={100} locale="en-US" />
    );
    await drawn();

    // Every value is under 16 of a possible 100, so nothing reaches the top.
    await expect.poll(() => fills()).not.toContain('var(--_mp-chart-scale-5)');
  });

  it('leaves a missing cell as a hole rather than painting it the least', async () => {
    // The bottom of a ramp is a reading. Drawing "no data" as "the least" is
    // the same mistake a bridged line makes.
    await render(
      <MPHeatmapChart
        categories={DAYS}
        series={[{ name: '09:00', data: [1, null, 9, 13] }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => cells().length).toBe(4);
    expect(cells()[1].getAttribute('fill')).toBe('none');
    expect(cells()[1].getAttribute('stroke-dasharray')).toBe('2 2');
  });

  it('names both axes down the side and along the bottom', async () => {
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    const written = Array.from(document.querySelectorAll('.mp-heatmap-chart svg text')).map(
      (node) => node.textContent
    );

    expect(written).toContain('09:00');
    expect(written).toContain('Mon');
  });

  it('shows the ramp itself as the legend, with both ends written', async () => {
    // What a reader needs here is to match a cell against a band, which is a
    // picture rather than a key.
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);

    const legend = document.querySelector('.mp-chart__legend');

    expect(legend?.querySelectorAll('span[style]').length).toBe(5);
    expect(legend?.textContent).toContain('1');
    expect(legend?.textContent).toContain('15');
  });

  it('walks the grid in two dimensions', async () => {
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    plot().focus();
    // The first press lands on the top-left cell rather than moving from it.
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('09:00');

    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('10:00');
  });

  it('names the row and the column together in the panel', async () => {
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect
      .poll(() => document.querySelector('[role="status"]')?.textContent)
      .toContain('09:00 · Mon');
  });

  it('rings the active cell rather than recolouring it', async () => {
    // A cell that changed colour on hover would be a cell reporting a different
    // number while it is being read.
    await render(<MPHeatmapChart categories={DAYS} series={HOURS} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect.poll(() => cells()[0].getAttribute('stroke-width')).toBe('2');
    expect(cells()[0].getAttribute('fill')).toBe('var(--_mp-chart-scale-1)');
  });

  it('describes the grid with a row per series and a column per category', async () => {
    await render(
      <MPHeatmapChart categories={DAYS} series={HOURS} label="Load by hour" locale="en-US" />
    );
    await drawn();

    const table = document.getElementById(plot().getAttribute('aria-describedby') ?? '');

    expect(table?.querySelector('caption')?.textContent).toBe('Load by hour');
    expect(table?.querySelectorAll('tbody tr').length).toBe(3);
    // Four days plus the row's own heading.
    expect(table?.querySelectorAll('thead th').length).toBe(5);
  });

  it('writes a value in a cell only when the cell can hold it', async () => {
    await render(
      <MPHeatmapChart categories={DAYS} series={HOURS} valueLabels height={260} locale="en-US" />
    );
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-heatmap-chart__cells text').length)
      .toBe(12);
  });

  it('draws the empty state when there is nothing in the grid', async () => {
    await render(<MPHeatmapChart series={[]} locale="en-US" />);

    expect(document.querySelector('.mp-heatmap-chart svg')).toBeNull();
    expect(plot().textContent).toBe('No data');
    expect(plot().getAttribute('tabindex')).toBeNull();
  });
});
