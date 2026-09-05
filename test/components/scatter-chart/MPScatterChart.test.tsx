import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPScatterChart } from 'material-plus-ui';

const RUNS = [
  {
    name: 'Alpha',
    data: [
      { x: 10, y: 40 },
      { x: 20, y: 55 },
      { x: 30, y: 52 },
      { x: 40, y: 71 }
    ]
  },
  {
    name: 'Beta',
    data: [
      { x: 12, y: 31 },
      { x: 24, y: 44 },
      { x: 36, y: 39 }
    ]
  }
];

const plot = () => document.querySelector('.mp-chart__plot') as HTMLElement;
const svg = () => document.querySelector('.mp-chart svg');
const marks = () => Array.from(document.querySelectorAll('.mp-scatter-chart__marks path'));
const axisText = () =>
  Array.from(document.querySelectorAll('.mp-chart__axes text')).map((node) => node.textContent);
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

describe('MPScatterChart', () => {
  it('draws one mark per observation across every series', async () => {
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    await expect.poll(() => marks().length).toBe(7);
  });

  it('places a mark by its own x rather than by its index', async () => {
    // Two series have different x at the same index, which is the whole reason
    // the category axis here is a second value axis.
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    await expect.poll(() => marks().length).toBe(7);

    const box = (node: Element) => (node as SVGGraphicsElement).getBBox();

    // Alpha's first point is at x=10 and Beta's is at x=12, so Beta's sits to
    // the right — which an index-placed chart would draw on top of it.
    expect(box(marks()[4]).x).toBeGreaterThan(box(marks()[0]).x);
  });

  it('crops both scales rather than dragging either to zero', async () => {
    // A position claims nothing about proportion, so cropping moves every mark
    // by the same amount and the relationship survives. Forced to zero, two
    // measures living between 40 and 60 end up in one corner.
    await render(
      <MPScatterChart
        series={[
          {
            name: 'Runs',
            data: [
              { x: 40, y: 41 },
              { x: 60, y: 59 }
            ]
          }
        ]}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => axisText().length).toBeGreaterThan(0);
    expect(axisText()).not.toContain('0');
  });

  it('rules the plot both ways, which no other chart here does', async () => {
    // There is no column to be in, and reading a mark's x off the picture is
    // half of what the reader came for.
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    const lines = Array.from(document.querySelectorAll('.mp-chart__axes line'));
    const horizontal = lines.filter((l) => l.getAttribute('y1') === l.getAttribute('y2'));
    const vertical = lines.filter((l) => l.getAttribute('x1') === l.getAttribute('x2'));

    expect(horizontal.length).toBeGreaterThan(1);
    expect(vertical.length).toBeGreaterThan(1);
  });

  it('gives each series a shape as well as a colour', async () => {
    // Colour separates three series where any two marks can touch, and a
    // scatter is exactly that case. The shape carries the rest.
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    await expect.poll(() => marks().length).toBe(7);

    // A circle is drawn with arcs and a square is not.
    expect(marks()[0].getAttribute('d')).toContain('a');
    expect(marks()[4].getAttribute('d')).not.toContain('a');
  });

  it('drops back to circles when the shapes are turned off', async () => {
    await render(<MPScatterChart series={RUNS} shapes={false} locale="en-US" />);
    await drawn();

    await expect.poll(() => marks().length).toBe(7);
    expect(marks()[4].getAttribute('d')).toContain('a');
  });

  it('puts the shape in the legend rather than a dot', async () => {
    // A legend whose swatches are all circles carries only the colour, and the
    // shape is here precisely because the colour runs out.
    await render(<MPScatterChart series={RUNS} locale="en-US" />);

    const swatches = document.querySelectorAll('.mp-chart__legend svg path');

    expect(swatches.length).toBe(2);
    expect(swatches[1].getAttribute('d')).not.toContain('a');
  });

  it('sizes a bubble by area rather than by radius', async () => {
    // Area grows as the square of the radius, so a radius proportional to the
    // value shows four times the ink for twice the number.
    await render(
      <MPScatterChart
        series={[
          {
            name: 'Runs',
            data: [
              { x: 1, y: 1, z: 25 },
              { x: 2, y: 2, z: 100 }
            ]
          }
        ]}
        bubble
        maxRadius={40}
        locale="en-US"
      />
    );
    await drawn();

    await expect.poll(() => marks().length).toBe(2);

    const box = (node: Element) => (node as SVGGraphicsElement).getBBox();
    const small = box(marks()[0]).width;
    const big = box(marks()[1]).width;

    // Four times the value is twice the *radius*, not four times.
    expect(big / small).toBeLessThan(3);
    expect(big).toBeGreaterThan(small);
  });

  it('titles the panel with the mark’s own x', async () => {
    // On a plot with two value axes the x is data rather than a heading the
    // marks were filed under, and two marks at one index are unrelated.
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('10');
  });

  it('walks the marks rather than columns', async () => {
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    // The last mark belongs to the second series, so the panel names it.
    await expect
      .poll(() => document.querySelector('.mp-chart__tooltip')?.textContent)
      .toContain('Beta');
  });

  it('drops no crosshair, having no column to drop one through', async () => {
    // A crosshair says "these numbers all belong to this column", and where
    // there is no column it is a line through one dot.
    await render(<MPScatterChart series={RUNS} locale="en-US" />);
    await drawn();

    const before = document.querySelectorAll('.mp-chart svg > line').length;

    plot().focus();
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));

    await expect.poll(() => document.querySelector('.mp-chart__tooltip') !== null).toBe(true);
    expect(document.querySelectorAll('.mp-chart svg > line').length).toBe(before);
  });

  it('draws the empty state when no point has a place on the axis', async () => {
    // A string is not a position on a number line, so a chart placed entirely
    // by names has an x axis of nothing.
    await render(
      <MPScatterChart
        categories={['a', 'b']}
        series={[{ name: 'Runs', data: [1, 2] }]}
        locale="en-US"
      />
    );

    expect(document.querySelector('.mp-chart svg')).toBeNull();
    expect(plot().textContent).toBe('No data');
  });

  it('describes the picture with the numbers behind it', async () => {
    await render(<MPScatterChart series={RUNS} label="Duration against load" locale="en-US" />);
    await drawn();

    const table = document.getElementById(plot().getAttribute('aria-describedby') ?? '');

    expect(table?.querySelector('caption')?.textContent).toBe('Duration against load');
    expect(table?.querySelectorAll('thead th').length).toBe(3);
  });
});
