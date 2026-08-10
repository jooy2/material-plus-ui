import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPProgressBox } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/** The segments: the direct children of the track. */
function segments() {
  return [...document.querySelectorAll('.mp-progress-box > div:last-of-type > span')];
}

/** How full each segment is drawn, as a percentage string. */
function fills() {
  return segments().map(
    (segment) => (segment.firstElementChild as HTMLElement | null)?.style.width
  );
}

describe('MPProgressBox', () => {
  describe('rendering', () => {
    it('renders a progressbar', async () => {
      const screen = await render(<MPProgressBox value={50} />);

      await expect.element(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('draws four segments by default', async () => {
      await render(<MPProgressBox value={50} />);

      expect(segments()).toHaveLength(4);
    });

    it('draws as many segments as it was asked for', async () => {
      await render(<MPProgressBox value={50} count={6} />);

      expect(segments()).toHaveLength(6);
    });

    it('lands on one segment rather than none for a count that is not a count', async () => {
      const screen = await render(<MPProgressBox value={50} count={0} />);

      expect(segments()).toHaveLength(1);

      await screen.rerender(<MPProgressBox value={50} count={2.7} />);

      expect(segments()).toHaveLength(2);
    });
  });

  describe('a value across the row', () => {
    it('fills the leading segment partially rather than rounding it away', async () => {
      // Without that, four segments could only ever show 0, 25, 50, 75 or 100.
      await render(<MPProgressBox value={30} count={4} />);

      expect(fills()).toEqual(['100%', '20%', '0%', '0%']);
    });

    it('fills every segment at the end of the range', async () => {
      await render(<MPProgressBox value={100} count={4} />);

      expect(fills()).toEqual(['100%', '100%', '100%', '100%']);
    });

    it('fills nothing at the start of it', async () => {
      await render(<MPProgressBox value={0} count={4} />);

      expect(fills()).toEqual(['0%', '0%', '0%', '0%']);
    });
  });

  describe('the indeterminate case', () => {
    it('is the default, and cycles rather than filling', async () => {
      const screen = await render(<MPProgressBox />);

      expect(screen.getByRole('progressbar').element()).not.toHaveAttribute('aria-valuenow');
      expect(document.querySelectorAll('.mp-progress-segment-wave')).toHaveLength(4);
    });

    it('holds each segment back by its own index', async () => {
      // One class and one custom property, rather than N generated keyframe
      // names.
      await render(<MPProgressBox count={3} />);

      expect(
        segments().map((segment) => (segment as HTMLElement).style.getPropertyValue('--_mp-index'))
      ).toEqual(['0', '1', '2']);
    });

    it('stops cycling once a value arrives', async () => {
      const screen = await render(<MPProgressBox />);

      await screen.rerender(<MPProgressBox value={50} />);

      expect(document.querySelectorAll('.mp-progress-segment-wave')).toHaveLength(0);
    });
  });

  describe('the value as text', () => {
    it('reads as a percentage of the range', async () => {
      const screen = await render(<MPProgressBox value={3} min={0} max={4} showValue />);

      await expect.element(screen.getByText('75%')).toBeInTheDocument();
    });

    it('sits beside the label when there is one', async () => {
      const screen = await render(<MPProgressBox value={50} label="Steps" showValue />);

      await expect.element(screen.getByText('Steps')).toBeInTheDocument();
      await expect.element(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('the size ladder', () => {
    it('grows monotonically', async () => {
      const screen = await render(<MPProgressBox value={50} size="xs" />);
      const widthOf = () => segments()[0].getBoundingClientRect().width;

      let previous = widthOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPProgressBox value={50} size={size} />);

        const next = widthOf();

        expect(next, `${size} should be larger than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });
  });
});
