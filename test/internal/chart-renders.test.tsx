import { Profiler } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPHeatmapChart, MPLineChart, MPScatterChart } from 'material-plus-ui';

/**
 * How often a chart renders while the pointer moves over it without changing
 * what is under it.
 *
 * A hover is a render of the whole chart — every path, the legend, and the
 * table behind the picture — so a pointer that stores a fresh value per pixel
 * makes every pixel cost that. These hold nineteen moves that say nothing new
 * to at most one render between them, where they used to cost eighteen.
 */
async function commitsWhileMoving(
  chart: ReactNode,
  moves: (box: DOMRect) => [number, number][],
  setup?: (plot: HTMLElement, box: DOMRect) => void
): Promise<number> {
  let commits = 0;
  const screen = await render(
    <Profiler id="chart" onRender={() => (commits += 1)}>
      <div style={{ width: 480 }}>{chart}</div>
    </Profiler>
  );
  const plot = screen.container.querySelector('.mp-chart__plot') as HTMLElement;
  // Measured, then let it settle: the first render after mount is the one that
  // knows how wide the plot is.
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

  const box = plot.getBoundingClientRect();

  setup?.(plot, box);

  const path = moves(box);
  const [x, y] = path[0];

  // The first move does change what is under the pointer, and it is let finish
  // — with whatever it schedules after a frame — before anything is counted.
  plot.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

  const before = commits;

  // One task each, as a real pointer delivers them. Dispatched back to back,
  // React would batch the lot into a single render and hide the cost per move.
  for (const [clientX, clientY] of path.slice(1)) {
    plot.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  await new Promise((resolve) => setTimeout(resolve, 50));

  return commits - before;
}

/** Twenty moves of one pixel each, starting at a point. */
function jiggle(x: number, y: number): [number, number][] {
  return Array.from({ length: 20 }, (_, step) => [x + (step % 2), y + (Math.floor(step / 2) % 2)]);
}

describe('a chart under a pointer that stays put', () => {
  it('does not re-render a scatter for a pointer resting on one point', async () => {
    const commits = await commitsWhileMoving(
      <MPScatterChart
        label="Points"
        series={[
          {
            name: 'A',
            data: [
              { x: 1, y: 1 },
              { x: 2, y: 2 },
              { x: 3, y: 3 }
            ]
          }
        ]}
        legend={false}
      />,
      (box) => jiggle(box.left + box.width / 2, box.top + box.height / 2)
    );

    expect(commits).toBeLessThanOrEqual(1);
  });

  it('does not re-render a heatmap for a pointer inside one cell', async () => {
    const commits = await commitsWhileMoving(
      <MPHeatmapChart
        label="Grid"
        categories={['x', 'y']}
        series={[
          { name: 'a', data: [1, 2] },
          { name: 'b', data: [3, 4] }
        ]}
      />,
      (box) => jiggle(box.left + box.width / 4, box.top + box.height / 4)
    );

    expect(commits).toBeLessThanOrEqual(1);
  });

  it('does not re-render a line chart for a pointer inside one column', async () => {
    const commits = await commitsWhileMoving(
      <MPLineChart
        label="Line"
        categories={['a', 'b', 'c']}
        series={[{ name: 'A', data: [1, 2, 3] }]}
      />,
      (box) => jiggle(box.left + box.width / 2, box.top + box.height / 2)
    );

    expect(commits).toBeLessThanOrEqual(1);
  });

  it('does not re-render a zoom selection that has not crossed a category', async () => {
    const commits = await commitsWhileMoving(
      <MPLineChart
        label="Line"
        categories={['a', 'b', 'c', 'd', 'e', 'f']}
        series={[{ name: 'A', data: [1, 2, 3, 4, 5, 6] }]}
        zoom
      />,
      (box) => jiggle(box.left + box.width / 2, box.top + box.height / 2),
      (plot, box) =>
        plot.dispatchEvent(
          new PointerEvent('pointerdown', {
            clientX: box.left + box.width / 2,
            clientY: box.top + box.height / 2,
            button: 0,
            isPrimary: true,
            bubbles: true
          })
        )
    );

    expect(commits).toBeLessThanOrEqual(1);
  });
});
