import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateRotate } from 'material-plus-ui';

describe('MPAnimateRotate', () => {
  it('runs the rotate keyframe', async () => {
    const screen = await render(<MPAnimateRotate data-testid="rotate">Turning</MPAnimateRotate>);
    const element = screen.getByTestId('rotate').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-rotate');
    expect(element).toHaveAttribute('data-mp-animation', 'rotate');
  });

  it('takes `long2`, which is longer than the other arrivals', async () => {
    // Half a turn is a longer journey than a fade's one axis of opacity, and
    // reads as rushed at the same duration.
    const screen = await render(<MPAnimateRotate data-testid="rotate">Turning</MPAnimateRotate>);
    const element = screen.getByTestId('rotate').element() as HTMLElement;

    expect(getComputedStyle(element).animationDuration).toBe('0.5s');
  });

  describe('from and to', () => {
    it('swings into place from half a turn back', async () => {
      const screen = await render(<MPAnimateRotate data-testid="rotate">Turning</MPAnimateRotate>);
      const element = screen.getByTestId('rotate').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-angle')).toBe('-180deg');
      expect(element.style.getPropertyValue('--_mp-anim-angle-to')).toBe('0deg');
    });

    /*
     * Two angles rather than one is what makes this one component cover both
     * effects a rotation is used for: an arrival that stops, and a spin that
     * never lands.
     */
    it('becomes an endless spin when both angles are given', async () => {
      const screen = await render(
        <MPAnimateRotate
          from={0}
          to={360}
          repeat="infinite"
          easing="linear"
          fade={false}
          data-testid="rotate"
        >
          Spinning
        </MPAnimateRotate>
      );
      const element = screen.getByTestId('rotate').element() as HTMLElement;
      const styles = getComputedStyle(element);

      expect(element.style.getPropertyValue('--_mp-anim-angle')).toBe('0deg');
      expect(element.style.getPropertyValue('--_mp-anim-angle-to')).toBe('360deg');
      expect(styles.animationIterationCount).toBe('infinite');
      expect(styles.animationTimingFunction).toBe('cubic-bezier(0, 0, 1, 1)');
      // A repeating fade over a continuous spin reads as flickering.
      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('1');
    });
  });

  it('turns about a point', async () => {
    const screen = await render(
      <MPAnimateRotate origin="bottom right" data-testid="rotate">
        Turning
      </MPAnimateRotate>
    );
    const element = screen.getByTestId('rotate').element() as HTMLElement;

    expect(element.style.transformOrigin).toBe('right bottom');
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateRotate render={<span />} data-testid="rotate">
        Turning
      </MPAnimateRotate>
    );

    expect(screen.getByTestId('rotate').element().tagName).toBe('SPAN');
  });
});
