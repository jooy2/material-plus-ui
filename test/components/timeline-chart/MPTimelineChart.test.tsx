import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPTimelineChart } from 'material-plus-ui';

const day = (n: number) => new Date(2026, 2, n);

const PLAN = [
  { name: 'Design', data: [{ start: day(2), end: day(6), label: 'Wireframes' }] },
  { name: 'Build', data: [{ start: day(5), end: day(12), label: 'Implementation' }] },
  {
    name: 'Test',
    data: [
      { start: day(10), end: day(13), label: 'QA' },
      { start: day(15), end: day(16), label: 'Regression' }
    ]
  }
];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-chart svg');
const spans = () => Array.from(document.querySelectorAll('.mp-timeline-chart__spans path'));
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

const box = (node: Element) => (node as SVGGraphicsElement).getBBox();

describe('MPTimelineChart', () => {
  it('draws a bar per span across every row', async () => {
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    await expect.poll(() => spans().length).toBe(4);
  });

  it('makes a longer span a longer bar', async () => {
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    await expect.poll(() => spans().length).toBe(4);
    // Build runs seven days and Design four.
    expect(box(spans()[1]).width).toBeGreaterThan(box(spans()[0]).width);
  });

  it('puts each row on its own line', async () => {
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    await expect.poll(() => spans().length).toBe(4);
    // The two spans on the Test row share a y; Build's is above them.
    expect(box(spans()[2]).y).toBeCloseTo(box(spans()[3]).y, 1);
    expect(box(spans()[1]).y).toBeLessThan(box(spans()[2]).y);
  });

  it('rounds both ends, because neither is the value', async () => {
    // A bar grows from a baseline and has one data end. A span *is* two ends,
    // and a timeline's bar has no baseline at all.
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    await expect.poll(() => (spans()[0]?.getAttribute('d')?.match(/a/g) ?? []).length).toBe(4);
  });

  it('ticks on the calendar rather than on round numbers', async () => {
    // 1-2-5-10 on epoch milliseconds puts a tick every 200,000,000 ms, which
    // lands at 14:53:20 on an arbitrary Tuesday.
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    const labels = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent ?? ''
    );

    // Days over a fortnight, so the axis reads as dates.
    expect(labels.some((text) => /^Mar \d+$/.test(text))).toBe(true);
  });

  it('names the rows down the side', async () => {
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    const labels = Array.from(document.querySelectorAll('.mp-chart__axes text')).map(
      (node) => node.textContent
    );

    expect(labels).toContain('Design');
    expect(labels).toContain('Test');
  });

  it('draws no legend, the rows being the axis already', async () => {
    // A legend restating twenty row names is not a filter anybody wants, and it
    // would be the only legend here that identified nothing new.
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    expect(document.querySelector('.mp-chart__legend')).toBeNull();
  });

  it('says both ends of a span rather than its length', async () => {
    // What a reader wants from a span is when it ran; the duration is the
    // subtraction they can do themselves.
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('–');
    expect(document.querySelector('.mp-chart__tooltip')?.textContent).toContain('Design');
  });

  it('walks the spans rather than the rows', async () => {
    // Four spans over three rows, so the walk has to be over the marks.
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Regression');
  });

  it('is hit anywhere along a bar rather than only near its middle', async () => {
    // A span can be two hundred pixels of bar whose centre a pointer never goes
    // near, so measuring to the centre would hand a short bar on the next row a
    // hover the reader is plainly not making.
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();
    await expect.poll(() => spans().length).toBe(4);

    const target = spans()[1].getBoundingClientRect();

    plot().dispatchEvent(
      new PointerEvent('pointermove', {
        bubbles: true,
        // Near the left end of the Build bar, a long way from its centre.
        clientX: target.left + 6,
        clientY: target.top + target.height / 2
      })
    );

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Build');
  });

  it('writes a span’s label inside its bar', async () => {
    await render(<MPTimelineChart series={PLAN} locale="en-US" />);
    await drawn();

    const written = Array.from(document.querySelectorAll('.mp-timeline-chart__spans text')).map(
      (node) => node.textContent
    );

    expect(written).toContain('Wireframes');
  });

  it('drops a label the bar cannot hold rather than clipping it', async () => {
    // Measured, not clipped: `clip-path: inset()` on an SVG text resolves
    // against the *text's* box rather than the bar's, so every inset wider than
    // the label removed it entirely and the survivors showed two letters each.
    await render(
      <MPTimelineChart
        series={[
          {
            name: 'Row',
            data: [
              { start: day(2), end: day(3), label: 'A name far too long for one day' },
              { start: day(5), end: day(20), label: 'Roomy' }
            ]
          }
        ]}
        locale="en-US"
      />
    );
    await drawn();

    const written = () =>
      Array.from(document.querySelectorAll('.mp-timeline-chart__spans text')).map(
        (node) => node.textContent
      );

    await expect.poll(() => written()).toEqual(['Roomy']);
  });

  it('leaves the labels off when it is asked to', async () => {
    await render(<MPTimelineChart series={PLAN} spanLabels={false} locale="en-US" />);
    await drawn();

    await expect
      .poll(() => document.querySelectorAll('.mp-timeline-chart__spans text').length)
      .toBe(0);
  });

  it('draws a span the other way round when its ends are swapped', async () => {
    await render(
      <MPTimelineChart
        series={[{ name: 'Odd', data: [{ start: day(12), end: day(4) }] }]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => spans().length).toBe(1);
    expect(box(spans()[0]).width).toBeGreaterThan(1);
  });

  it('drops a span whose ends are not places on a number line', async () => {
    // A string is not an instant. Dropped here rather than reaching the scale
    // as a NaN, which draws nothing and says nothing about why.
    await render(
      <MPTimelineChart
        series={[
          { name: 'Good', data: [{ start: day(2), end: day(6) }] },
          { name: 'Bad', data: [{ start: 'soon', end: 'later' }] }
        ]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => spans().length).toBe(1);
  });

  it('describes the picture with a row per row and its spans written out', async () => {
    // A grid cannot hold a variable number of spans, and a column per span
    // would give the table as many columns as the busiest row.
    await render(<MPTimelineChart series={PLAN} label="Release plan" locale="en-US" />);
    await drawn();

    const table = document.getElementById(plot().getAttribute('aria-describedby') ?? '');

    expect(table?.querySelector('caption')?.textContent).toBe('Release plan');
    expect(table?.querySelectorAll('tbody tr').length).toBe(3);
    // The Test row's cell carries both of its spans.
    expect(table?.querySelectorAll('tbody tr')[2].textContent).toContain(';');
  });

  it('draws the empty state when nothing has two ends', async () => {
    await render(<MPTimelineChart series={[]} locale="en-US" />);

    expect(document.querySelector('.mp-chart svg')).toBeNull();
    expect(plot().textContent).toBe('No data');
  });
});
