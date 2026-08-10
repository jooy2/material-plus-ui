import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPProgressCircular } from 'material-plus-ui';
import type { MPSize } from 'material-plus-ui';

/** The arc, which is the second circle — the first one is the track. */
function arc() {
  return document.querySelectorAll('.mp-progress-circular circle')[1] as SVGCircleElement;
}

describe('MPProgressCircular', () => {
  describe('rendering', () => {
    it('renders a progressbar with the value on it', async () => {
      const screen = await render(<MPProgressCircular value={25} />);

      expect(screen.getByRole('progressbar').element()).toHaveAttribute('aria-valuenow', '25');
    });

    it('hides the drawing from the accessibility tree', async () => {
      // The role and the value are on the root; the ring is the picture of them.
      await render(<MPProgressCircular value={25} />);

      expect(document.querySelector('.mp-progress-circular svg')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('names itself with the label it was given', async () => {
      const screen = await render(<MPProgressCircular value={25} label="Syncing" />);

      await expect
        .element(screen.getByRole('progressbar', { name: 'Syncing' }))
        .toBeInTheDocument();
    });
  });

  describe('the arc', () => {
    it('is measured in percent, so one keyframe rule serves every diameter', async () => {
      await render(<MPProgressCircular value={25} />);

      expect(arc()).toHaveAttribute('pathLength', '100');
    });

    it('closes the gap as the value rises', async () => {
      const screen = await render(<MPProgressCircular value={25} />);

      expect(Number(arc().getAttribute('stroke-dashoffset'))).toBeCloseTo(75, 6);

      await screen.rerender(<MPProgressCircular value={80} />);

      expect(Number(arc().getAttribute('stroke-dashoffset'))).toBeCloseTo(20, 6);
    });

    it('starts at twelve o’clock rather than at three', async () => {
      await render(<MPProgressCircular value={25} size="md" />);

      expect(arc().getAttribute('transform')).toBe('rotate(-90 24 24)');
    });
  });

  describe('the indeterminate case', () => {
    it('is the default, and turns instead of filling', async () => {
      const screen = await render(<MPProgressCircular />);

      expect(screen.getByRole('progressbar').element()).not.toHaveAttribute('aria-valuenow');
      expect(document.querySelector('.mp-progress-circular-turn')).not.toBeNull();
      expect(arc().className.baseVal).toContain('mp-progress-circular-arc');
    });

    it('holds still once a value arrives', async () => {
      const screen = await render(<MPProgressCircular />);

      await screen.rerender(<MPProgressCircular value={50} />);

      expect(document.querySelector('.mp-progress-circular-turn')).toBeNull();
      expect(arc()).toHaveAttribute('stroke-dasharray', '100');
    });
  });

  describe('the value as text', () => {
    it('is a percentage of the range rather than the raw number', async () => {
      const screen = await render(<MPProgressCircular value={1} min={0} max={4} showValue />);

      await expect.element(screen.getByText('25%')).toBeInTheDocument();
    });
  });

  describe('the size ladder', () => {
    it('grows monotonically', async () => {
      const screen = await render(<MPProgressCircular value={50} size="xs" />);
      const widthOf = () =>
        Number(document.querySelector('.mp-progress-circular svg')!.getAttribute('width'));

      let previous = widthOf();

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPProgressCircular value={50} size={size} />);

        const next = widthOf();

        expect(next, `${size} should be larger than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('draws md at the specification’s own 48dp', async () => {
      await render(<MPProgressCircular value={50} />);

      expect(document.querySelector('.mp-progress-circular svg')).toHaveAttribute('width', '48');
    });
  });
});
