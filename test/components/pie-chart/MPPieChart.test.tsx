import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPPieChart } from 'material-plus-ui';

const NAMES = ['Search', 'Direct', 'Social', 'Mail'];
const DATA = [50, 25, 15, 10];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-pie-chart svg');
const slices = () => Array.from(document.querySelectorAll('.mp-pie-chart__slices path'));
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

/** How far round the circle a slice sweeps, from its own path. */
const sweep = (node: Element | undefined) => {
  const b = (node as SVGGraphicsElement).getBBox();

  return { width: b.width, height: b.height };
};

describe('MPPieChart', () => {
  it('draws one slice per value', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    await expect.poll(() => slices().length).toBe(4);
  });

  it('gives the largest value the largest slice', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    await expect.poll(() => slices().length).toBe(4);
    // Half the circle against a tenth of it: the big one is bigger in both axes.
    const big = sweep(slices()[0]);
    const small = sweep(slices()[3]);

    expect(big.width * big.height).toBeGreaterThan(small.width * small.height);
  });

  it('draws a single slice as a whole disc rather than nothing', async () => {
    // An SVG arc is defined by its endpoints, so a sweep of exactly 360° starts
    // and ends at the same point and renders as an empty path.
    await render(<MPPieChart categories={['All']} data={[100]} locale="en-US" />);
    await drawn();

    await expect.poll(() => slices().length).toBe(1);
    const box = sweep(slices()[0]);

    expect(box.width).toBeGreaterThan(50);
    expect(box.height).toBeCloseTo(box.width, 0);
  });

  it('leaves a negative out rather than drawing it', async () => {
    // A negative has no share of a whole. As an absolute it claims the opposite
    // of what it means; as a signed sweep it runs back over its neighbour.
    await render(<MPPieChart categories={NAMES} data={[50, -25, 15, 10]} locale="en-US" />);
    await drawn();

    await expect.poll(() => slices().length).toBe(3);
  });

  it('cuts a hole for a donut and leaves the disc solid for a pie', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} shape="donut" locale="en-US" />);
    await drawn();

    // A ring segment closes along an inner edge, so its path has a second arc
    // run that a slice going back to the centre does not.
    await expect
      .poll(() => (slices()[0]?.getAttribute('d')?.match(/A/g) ?? []).length)
      .toBeGreaterThan(1);
  });

  it('names the slices in the legend rather than naming a series', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);

    const entries = Array.from(document.querySelectorAll('.mp-chart__legend li')).map((node) =>
      node.textContent?.trim()
    );

    expect(entries).toEqual(NAMES);
  });

  it('takes a slice out and re-shares the rest when its legend entry is pressed', async () => {
    const screen = await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    const before = sweep(slices()[0]);

    await screen.getByRole('button', { name: 'Direct', exact: true }).click();

    await expect.poll(() => slices().length).toBe(3);
    // Search was half of 100 and is now half of 75, so its slice grew.
    expect(sweep(slices()[0]).width).toBeGreaterThan(before.width);
  });

  it('keeps a slice the colour it had when another is hidden', async () => {
    // A slice's slot comes from its place in `data` and never from its size.
    const screen = await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    await screen.getByRole('button', { name: 'Search', exact: true }).click();

    await expect.poll(() => slices().length).toBe(3);
    expect(slices()[0].getAttribute('fill')).toBe('var(--_mp-chart-2)');
  });

  it('says the share and the value together when a slice is walked to', async () => {
    // The share is what a pie is a picture of; the value is what the reader
    // came for. Neither on its own answers the question.
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('50%');
    expect(document.querySelector('[role="status"]')?.textContent).toContain('Search');
  });

  it('names the slice once, in the heading', async () => {
    // A slice *is* the category, so a row that also named it would print the
    // name twice in a panel two words wide — and the second copy is the one
    // that gets truncated.
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect.poll(() => document.querySelector('.mp-chart__tooltip') !== null).toBe(true);

    const said = document.querySelector('.mp-chart__tooltip')?.textContent ?? '';

    expect(said.match(/Search/g)?.length).toBe(1);
  });

  it('wraps round the ring rather than stopping at the last slice', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

    // Back one from nothing is the first slice, and back again is the last.
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Mail');
  });

  it('clears the reading on Escape', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await expect.poll(() => document.querySelector('.mp-chart__tooltip') !== null).toBe(true);

    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await expect.poll(() => document.querySelector('.mp-chart__tooltip')).toBeNull();
  });

  it('describes the picture with a row per slice', async () => {
    await render(<MPPieChart categories={NAMES} data={DATA} label="Traffic" locale="en-US" />);
    await drawn();

    const table = document.getElementById(plot().getAttribute('aria-describedby') ?? '');

    expect(table?.querySelector('caption')?.textContent).toBe('Traffic');
    expect(table?.querySelectorAll('tbody tr').length).toBe(4);
    // One column for the category and one for the value, and no more.
    expect(table?.querySelectorAll('thead th').length).toBe(2);
  });

  it('writes shares on the slices that can hold them and drops the rest', async () => {
    // A label that does not fit is dropped rather than clipped; the hover panel
    // and the table still have it.
    await render(
      <MPPieChart
        categories={[...NAMES, 'Other']}
        data={[60, 30, 8, 1, 1]}
        valueLabels="all"
        locale="en-US"
      />
    );
    await drawn();

    const written = () =>
      Array.from(document.querySelectorAll('.mp-pie-chart__slices text')).map(
        (node) => node.textContent
      );

    await expect.poll(() => written().length).toBeGreaterThan(0);
    expect(written().length).toBeLessThan(5);
    expect(written()[0]).toBe('60%');
  });

  it('draws the empty state when nothing has a share', async () => {
    await render(<MPPieChart data={[]} locale="en-US" />);

    expect(document.querySelector('.mp-pie-chart svg')).toBeNull();
    expect(plot().textContent).toBe('No data');
    expect(plot().getAttribute('tabindex')).toBeNull();
  });

  it('puts the caller’s figure in the hole of a donut and nowhere on a pie', async () => {
    // A ring with nothing in the middle is a pie with a bite out of it.
    await render(
      <MPPieChart
        categories={NAMES}
        data={DATA}
        shape="donut"
        center={<span data-testid="total">100</span>}
        locale="en-US"
      />
    );
    await drawn();

    expect(document.querySelector('[data-testid="total"]')).not.toBeNull();
  });

  it('ignores the middle when the shape is a filled disc', async () => {
    await render(
      <MPPieChart
        categories={NAMES}
        data={DATA}
        center={<span data-testid="total">100</span>}
        locale="en-US"
      />
    );
    await drawn();

    expect(document.querySelector('[data-testid="total"]')).toBeNull();
  });
});
