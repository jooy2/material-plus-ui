import { afterEach, describe, expect, it } from 'vitest';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { MPLineChart } from 'material-plus-ui';

/**
 * The box a chart lays itself out against.
 *
 * Mounted straight into a root rather than through the suite's `render`, which
 * waits for every effect and would hide the frame being tested: the one between
 * the first commit and the measurement.
 */
let root: Root | null = null;
let host: HTMLElement | null = null;

afterEach(() => {
  root?.unmount();
  host?.remove();
  root = null;
  host = null;
});

function mount(node: React.ReactNode) {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  flushSync(() => root!.render(node));

  return host;
}

const CHART = (
  <MPLineChart
    label="Line"
    categories={['a', 'b', 'c']}
    series={[{ name: 'A', data: [1, 2, 3] }]}
  />
);

describe('a chart measuring its box', () => {
  it('has its picture in the first commit, so it never paints an empty box', () => {
    const container = mount(<div style={{ width: 600 }}>{CHART}</div>);

    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('lays out against the room it has, not the size a transform shows it at', () => {
    // A dialog enters from `scale(0.95)`. Finishing a transform is not a resize,
    // so a chart that measured the transformed box stayed that narrow.
    const container = mount(
      <div style={{ width: 600, transform: 'scale(0.5)', transformOrigin: '0 0' }}>{CHART}</div>
    );
    const plot = container.querySelector('.mp-chart__plot') as HTMLElement;
    const svg = container.querySelector('svg') as SVGSVGElement;

    expect(Number(svg.getAttribute('width'))).toBe(plot.offsetWidth);
  });

  it('draws no empty group for a category it neither rules nor labels', () => {
    // A year of days labelled every few weeks used to carry a `<g>` per day.
    const days = Array.from({ length: 365 }, (_, index) => `d${index}`);
    const container = mount(
      <div style={{ width: 600 }}>
        <MPLineChart
          label="Year"
          categories={days}
          series={[{ name: 'A', data: days.map((_, index) => index) }]}
        />
      </div>
    );
    const empty = [...container.querySelectorAll('svg g')].filter(
      (group) => group.childElementCount === 0
    );

    expect(empty).toHaveLength(0);
  });
});
