import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPSparkline } from 'material-plus-ui';

const svg = () => document.querySelector('.mp-sparkline svg') as SVGElement;
const paths = () => Array.from(document.querySelectorAll('.mp-sparkline path'));
const line = () => paths().find((p) => p.getAttribute('fill') === 'none');

const DATA = [12, 15, 14, 19, 22, 21, 27];

describe('MPSparkline', () => {
  it('draws one unbroken path for a series with no gaps', async () => {
    await render(<MPSparkline data={DATA} locale="en-US" />);

    // One `M`, so one run.
    expect((line()?.getAttribute('d')?.match(/M/g) ?? []).length).toBe(1);
  });

  it('breaks at a gap rather than drawing through it', async () => {
    // A `null` is a month nothing was measured in, and a line joined across it
    // draws a value nobody has — which looks exactly like data.
    await render(<MPSparkline data={[1, 2, null, 4, 5]} locale="en-US" />);

    expect((line()?.getAttribute('d')?.match(/M/g) ?? []).length).toBe(2);
  });

  it('draws a lone point between two gaps as a dot', async () => {
    // A zero-length stroke, which a round cap renders as the dot it is.
    await render(<MPSparkline data={[null, 5, null]} locale="en-US" />);

    expect(line()?.getAttribute('d')).toContain('h0');
  });

  it('puts a flat series halfway up rather than dividing by nothing', async () => {
    await render(<MPSparkline data={[5, 5, 5]} height={40} locale="en-US" />);

    const d = line()?.getAttribute('d') ?? '';
    const ys = [...d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]));

    expect(ys.every((y) => Math.abs(y - 20) < 0.01)).toBe(true);
  });

  describe('the shapes', () => {
    it('fills under the line for an area, and closes it', async () => {
      await render(<MPSparkline data={DATA} shape="area" locale="en-US" />);

      const filled = paths().find((p) => p.getAttribute('fill') !== 'none');

      expect(filled?.getAttribute('d')).toContain('Z');
      // The line is still there over it.
      expect(line()).toBeTruthy();
    });

    it('draws one path per point for bars, and skips the gaps', async () => {
      await render(<MPSparkline data={[1, null, 3, 4]} shape="bar" locale="en-US" />);

      expect(paths()).toHaveLength(3);
    });

    it('rounds a bar at its data end and leaves the baseline square', async () => {
      // A bar rounded where it meets the axis has lost the point it starts from,
      // and a row of them turns the baseline into a scalloped edge.
      await render(<MPSparkline data={[10]} shape="bar" min={0} max={10} locale="en-US" />);

      const d = paths()[0].getAttribute('d') ?? '';

      expect((d.match(/a/g) ?? []).length).toBe(2);
    });
  });

  describe('the curves', () => {
    it('turns halfway between two points for a step', async () => {
      await render(<MPSparkline data={[1, 2]} curve="step" locale="en-US" />);

      expect(line()?.getAttribute('d')).toMatch(/H[\d.]+V/);
    });

    it('never dips on its way up when it is smoothed', async () => {
      // A plain spline overshoots, and a chart that invents a dip has reported
      // one. The monotone fit clamps the tangent wherever the slopes disagree.
      await render(<MPSparkline data={[0, 1, 2, 3]} curve="smooth" height={40} locale="en-US" />);

      const d = line()?.getAttribute('d') ?? '';
      const ys = [...d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => Number(m[2]));

      // Going up the screen means y falls, and it must never turn back.
      expect(ys.every((y, i) => i === 0 || y <= ys[i - 1] + 0.001)).toBe(true);
    });
  });

  describe('the end dot', () => {
    it('marks the newest point, because the shape is context for it', async () => {
      const screen = await render(<MPSparkline data={DATA} locale="en-US" />);

      // A zero-length round-capped stroke rather than a circle: the box is
      // stretched to fit, and a radius would come out an ellipse.
      const dot = paths().find((p) => p.getAttribute('d')?.endsWith('h0'));

      expect(dot?.getAttribute('vector-effect')).toBe('non-scaling-stroke');

      await screen.rerender(<MPSparkline data={DATA} endDot={false} locale="en-US" />);

      expect(paths().find((p) => p.getAttribute('d')?.endsWith('h0'))).toBeUndefined();
    });

    it('lands on the last point that is not a gap', async () => {
      await render(<MPSparkline data={[1, 9, null]} height={40} locale="en-US" />);

      const dot = paths().find((p) => p.getAttribute('d')?.endsWith('h0'));
      const lineEnd = [...(line()?.getAttribute('d') ?? '').matchAll(/L(-?[\d.]+) (-?[\d.]+)/g)].at(
        -1
      );

      expect(dot?.getAttribute('d')).toContain(`M${lineEnd?.[1]} ${lineEnd?.[2]}`);
    });
  });

  describe('what it says out loud', () => {
    it('gives the two ends, because that is the direction', async () => {
      // "120 to 400" says which way it went; "90 to 410" does not.
      await render(<MPSparkline data={[120, 90, 410, 400]} locale="en-US" />);

      expect(svg()).toHaveAttribute('aria-label', '4 points, from 120 to 400');
    });

    it('says so in the language it was given', async () => {
      await render(<MPSparkline data={[1, 2]} locale="ko" />);

      expect(svg().getAttribute('aria-label')).toBe('2개 지점, 1에서 2까지');
    });

    it('says there is nothing rather than nothing at all', async () => {
      await render(<MPSparkline data={[null, null]} locale="en-US" />);

      expect(svg()).toHaveAttribute('aria-label', 'No data');
    });

    it("takes the caller's sentence over its own", async () => {
      await render(<MPSparkline data={DATA} label="Weekly signups, rising" locale="en-US" />);

      expect(svg()).toHaveAttribute('aria-label', 'Weekly signups, rising');
    });
  });

  it('reads the first slot of the chart palette unless told otherwise', async () => {
    const screen = await render(<MPSparkline data={DATA} locale="en-US" />);

    expect(line()?.getAttribute('stroke')).toBe('var(--_mp-chart-1)');

    await screen.rerender(<MPSparkline data={DATA} color="tertiary" locale="en-US" />);

    expect(line()?.getAttribute('stroke')).toBe('var(--_mp-color-tertiary)');
  });
});
