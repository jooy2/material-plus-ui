import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateFade } from 'material-plus-ui';

describe('MPAnimateFade', () => {
  it('runs the fade keyframe on the element itself', async () => {
    const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
    const element = screen.getByTestId('fade').element() as HTMLElement;
    const styles = getComputedStyle(element);

    expect(styles.animationName).toBe('mp-anim-fade');
    // `both`, which is what lets an untriggered animation sit paused on its own
    // first frame instead of being fully drawn until it starts.
    expect(styles.animationFillMode).toBe('both');
  });

  describe('duration', () => {
    /*
     * The Material token, not a number.
     *
     * Both resolve to 300ms today. Only one of them moves when a page retunes
     * `--mp-sys-motion-duration-medium2`, which is the whole reason the default
     * is written as a `var()` rather than as the value it happens to carry.
     */
    it('takes the effect’s Material duration token when nobody said', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-duration')).toBe(
        'var(--mp-sys-motion-duration-medium2)'
      );
      expect(getComputedStyle(element).animationDuration).toBe('0.3s');
    });

    it('is quicker leaving than arriving', async () => {
      // MD3's asymmetry: an entrance is being introduced, an exit has already
      // said what it had to say.
      const screen = await render(
        <MPAnimateFade mode="out" data-testid="fade">
          Leaving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationDuration).toBe('0.2s');
    });

    it('lets a number win', async () => {
      const screen = await render(
        <MPAnimateFade duration={1200} data-testid="fade">
          Slow
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationDuration).toBe('1.2s');
    });
  });

  describe('easing', () => {
    it('decelerates into place by default', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationTimingFunction).toBe(
        'cubic-bezier(0.05, 0.7, 0.1, 1)'
      );
    });

    it('takes a Material curve by name', async () => {
      const screen = await render(
        <MPAnimateFade easing="linear" data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationTimingFunction).toBe('cubic-bezier(0, 0, 1, 1)');
    });
  });

  describe('mode', () => {
    /*
     * One keyframe, run the other way.
     *
     * A second `@keyframes` for the exit would be a second place to fix a bug,
     * and it would also lose the easing: CSS mirrors the timing function along
     * with the frames, so a reversed decelerate *is* the accelerate MD3 asks an
     * exit to use.
     */
    it('leaves by reversing the entrance rather than by a keyframe of its own', async () => {
      const screen = await render(
        <MPAnimateFade mode="out" data-testid="fade">
          Leaving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;
      const styles = getComputedStyle(element);

      expect(styles.animationName).toBe('mp-anim-fade');
      expect(styles.animationDirection).toBe('reverse');
    });
  });

  describe('from', () => {
    it('starts from nothing', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0');
    });

    it('can be floored, for content that should never be completely gone', async () => {
      const screen = await render(
        <MPAnimateFade from={0.3} data-testid="fade">
          Arriving
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('0.3');
    });
  });

  describe('trigger', () => {
    it('runs on mount', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Arriving</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element).toHaveAttribute('data-mp-state', 'running');
      expect(getComputedStyle(element).animationPlayState).toBe('running');
    });

    /*
     * Waiting is a paused animation rather than a second class.
     *
     * With `fill-mode: both` a paused animation shows exactly its own first
     * frame, so an element that has not been triggered yet already looks the
     * way it will when it starts. Two classes would be two states to keep in
     * step, and the moment they drifted a `visible` fade would be fully drawn
     * until it scrolled into view and then blink out to begin.
     */
    it('waits paused on its own first frame under manual control', async () => {
      const screen = await render(
        <MPAnimateFade trigger="manual" data-testid="fade">
          Waiting
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(element).toHaveAttribute('data-mp-state', 'paused');
      expect(getComputedStyle(element).animationPlayState).toBe('paused');
    });

    it('runs when `play` goes up', async () => {
      const screen = await render(
        <MPAnimateFade trigger="manual" play data-testid="fade">
          Playing
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      await expect.element(screen.getByTestId('fade')).toHaveAttribute('data-mp-state', 'running');
      expect(getComputedStyle(element).animationPlayState).toBe('running');
    });
  });

  describe('paused', () => {
    it('holds the animation where it is without unwinding it', async () => {
      const screen = await render(
        <MPAnimateFade paused data-testid="fade">
          Held
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationPlayState).toBe('paused');
      expect(getComputedStyle(element).animationName).toBe('mp-anim-fade');
    });
  });

  describe('repeat', () => {
    it('runs once', async () => {
      const screen = await render(<MPAnimateFade data-testid="fade">Once</MPAnimateFade>);
      const element = screen.getByTestId('fade').element() as HTMLElement;

      expect(getComputedStyle(element).animationIterationCount).toBe('1');
    });

    it('writes `infinite` as the word CSS wants', async () => {
      const screen = await render(
        <MPAnimateFade repeat="infinite" alternate data-testid="fade">
          Forever
        </MPAnimateFade>
      );
      const element = screen.getByTestId('fade').element() as HTMLElement;
      const styles = getComputedStyle(element);

      expect(styles.animationIterationCount).toBe('infinite');
      expect(styles.animationDirection).toBe('alternate');
    });
  });

  it('keeps the caller’s own class and style', async () => {
    const screen = await render(
      <MPAnimateFade className="custom" style={{ color: 'rgb(1, 2, 3)' }} data-testid="fade">
        Arriving
      </MPAnimateFade>
    );
    const element = screen.getByTestId('fade').element() as HTMLElement;

    expect(element).toHaveClass('custom');
    expect(element).toHaveClass('mp-anim');
    expect(element.style.color).toBe('rgb(1, 2, 3)');
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateFade render={<section />} data-testid="fade">
        Arriving
      </MPAnimateFade>
    );

    expect(screen.getByTestId('fade').element().tagName).toBe('SECTION');
  });
});
