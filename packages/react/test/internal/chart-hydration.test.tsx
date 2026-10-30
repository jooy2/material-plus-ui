import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MPGaugeChart, MPPieChart } from 'material-plus-ui';
import { cleanupHydrated, hydrateFromServer } from '../support/hydrate';

/**
 * Where a piece of a chart is in markup a server sent, and where it is once the
 * page has hydrated and the chart has measured its box.
 *
 * The two used to differ: the server knows no width, so everything placed from
 * the measured box started at the top-left corner and moved into place after
 * hydration — a layout shift on the text a reader came to the chart for.
 */
async function positions(node: ReactElement, selector: string) {
  const sketch = document.createElement('div');

  sketch.innerHTML = renderToString(node);
  document.body.append(sketch);

  const before = sketch.querySelector(selector)!.getBoundingClientRect();
  const origin = sketch.getBoundingClientRect();

  sketch.remove();

  const { container } = await hydrateFromServer(node);
  // The measurement lands in an effect after hydration, and the frame after.
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 30)));

  const after = container.querySelector(selector)!.getBoundingClientRect();
  const home = container.getBoundingClientRect();

  return {
    before: { x: before.left - origin.left, y: before.top - origin.top, width: before.width },
    after: { x: after.left - home.left, y: after.top - home.top, width: after.width }
  };
}

describe('a chart rendered on a server', () => {
  afterEach(cleanupHydrated);

  it('puts the gauge reading where it stays', async () => {
    const { before, after } = await positions(
      <div style={{ width: 600 }}>
        <MPGaugeChart value={64} label="Disk" />
      </div>,
      '.mp-gauge-chart__value'
    );

    expect(Math.abs(before.y - after.y)).toBeLessThan(1);
    expect(Math.abs(before.x - after.x)).toBeLessThan(1);
  });

  it('puts the content in the hole of a ring where it stays', async () => {
    const { before, after } = await positions(
      <div style={{ width: 600 }}>
        <MPPieChart
          label="Share"
          categories={['A', 'B']}
          data={[3, 5]}
          shape="donut"
          center={<span className="probe">8</span>}
        />
      </div>,
      '.probe'
    );

    expect(Math.abs(before.y - after.y)).toBeLessThan(1);
    expect(Math.abs(before.x - after.x)).toBeLessThan(1);
  });
});
