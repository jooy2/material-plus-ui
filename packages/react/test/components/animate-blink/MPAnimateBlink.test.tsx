import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateBlink } from 'material-plus-ui';

describe('MPAnimateBlink', () => {
  it('runs the blink keyframe', async () => {
    const screen = await render(<MPAnimateBlink data-testid="blink">Live</MPAnimateBlink>);
    const element = screen.getByTestId('blink').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-blink');
    expect(element).toHaveAttribute('data-mp-animation', 'blink');
  });

  /*
   * A single blink is a flicker, and nobody asks for a flicker.
   *
   * This is the one effect in the group whose `repeat` defaults to `infinite`,
   * which is also what makes it the one that stops when the pointer leaves
   * under `trigger="hover"`.
   */
  it('repeats forever unless told otherwise', async () => {
    const screen = await render(<MPAnimateBlink data-testid="blink">Live</MPAnimateBlink>);
    const element = screen.getByTestId('blink').element() as HTMLElement;

    expect(getComputedStyle(element).animationIterationCount).toBe('infinite');
  });

  it('takes a period rather than an arrival duration', async () => {
    // `extra-long4` — a second. The other five effects are journeys with a
    // destination; this one is a cycle, so its number is a period.
    const screen = await render(<MPAnimateBlink data-testid="blink">Live</MPAnimateBlink>);
    const element = screen.getByTestId('blink').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-duration')).toBe(
      'var(--mp-sys-motion-duration-extra-long4)'
    );
    expect(getComputedStyle(element).animationDuration).toBe('1s');
  });

  it('runs on `standard` rather than the emphasized curve', async () => {
    // A pulse has no destination to decelerate into, and easing into a frame it
    // immediately leaves reads as a stutter.
    const screen = await render(<MPAnimateBlink data-testid="blink">Live</MPAnimateBlink>);
    const element = screen.getByTestId('blink').element() as HTMLElement;

    expect(getComputedStyle(element).animationTimingFunction).toBe('cubic-bezier(0.2, 0, 0, 1)');
  });

  describe('min', () => {
    it('goes all the way to nothing by default', async () => {
      const screen = await render(<MPAnimateBlink data-testid="blink">Live</MPAnimateBlink>);
      const element = screen.getByTestId('blink').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0');
    });

    it('can stay readable while it pulses', async () => {
      const screen = await render(
        <MPAnimateBlink min={0.45} data-testid="blink">
          Recording
        </MPAnimateBlink>
      );
      const element = screen.getByTestId('blink').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0.45');
    });
  });

  it('can be held still without unwinding', async () => {
    const screen = await render(
      <MPAnimateBlink paused data-testid="blink">
        Held
      </MPAnimateBlink>
    );
    const element = screen.getByTestId('blink').element() as HTMLElement;

    expect(getComputedStyle(element).animationPlayState).toBe('paused');
    expect(element).toHaveAttribute('data-mp-state', 'paused');
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateBlink render={<span />} data-testid="blink">
        Live
      </MPAnimateBlink>
    );

    expect(screen.getByTestId('blink').element().tagName).toBe('SPAN');
  });
});
