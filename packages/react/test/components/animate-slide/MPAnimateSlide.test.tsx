import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAnimateSlide } from 'material-plus-ui';

describe('MPAnimateSlide', () => {
  it('runs the slide keyframe', async () => {
    const screen = await render(<MPAnimateSlide data-testid="slide">Arriving</MPAnimateSlide>);
    const element = screen.getByTestId('slide').element() as HTMLElement;

    expect(getComputedStyle(element).animationName).toBe('mp-anim-slide');
    expect(element).toHaveAttribute('data-mp-animation', 'slide');
  });

  describe('from', () => {
    it('comes up from below by default, its own height away', async () => {
      // `100%` is the element's own size, so it starts exactly out of frame and
      // is never half drawn somewhere it does not belong.
      const screen = await render(<MPAnimateSlide data-testid="slide">Arriving</MPAnimateSlide>);
      const element = screen.getByTestId('slide').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-x')).toBe('0px');
      expect(element.style.getPropertyValue('--_mp-anim-y')).toBe('100%');
    });

    it('negates the offset for the two edges it travels back from', async () => {
      const top = await render(
        <MPAnimateSlide from="top" data-testid="top">
          Down
        </MPAnimateSlide>
      );
      const element = top.getByTestId('top').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-y')).toBe('calc(-1 * 100%)');

      const left = await render(
        <MPAnimateSlide from="left" distance={40} data-testid="left">
          Right
        </MPAnimateSlide>
      );
      const other = left.getByTestId('left').element() as HTMLElement;

      // A number is pixels, and a pixel offset is negated as a number rather
      // than wrapped in a `calc()` nothing has to evaluate.
      expect(other.style.getPropertyValue('--_mp-anim-x')).toBe('-40px');
      expect(other.style.getPropertyValue('--_mp-anim-y')).toBe('0px');
    });

    /*
     * `MPSide` is physical here, as it is everywhere in this library.
     *
     * Something sliding down from the top of the window comes from the top in
     * every writing direction — there is no reading order to mirror, only a
     * screen edge.
     */
    it('stays physical rather than logical', async () => {
      const screen = await render(
        <MPAnimateSlide from="right" data-testid="slide">
          In
        </MPAnimateSlide>
      );
      const element = screen.getByTestId('slide').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-x')).toBe('100%');
    });
  });

  describe('distance', () => {
    it('takes a CSS length as written', async () => {
      const screen = await render(
        <MPAnimateSlide distance="3rem" data-testid="slide">
          Arriving
        </MPAnimateSlide>
      );
      const element = screen.getByTestId('slide').element() as HTMLElement;

      expect(element.style.getPropertyValue('--_mp-anim-y')).toBe('3rem');
    });
  });

  it('leaves by the same edge it would have come from', async () => {
    const screen = await render(
      <MPAnimateSlide mode="out" from="left" data-testid="slide">
        Leaving
      </MPAnimateSlide>
    );
    const element = screen.getByTestId('slide').element() as HTMLElement;
    const styles = getComputedStyle(element);

    expect(styles.animationDirection).toBe('reverse');
    expect(styles.animationDuration).toBe('0.2s');
  });

  it('holds full opacity when the fade is off', async () => {
    const screen = await render(
      <MPAnimateSlide fade={false} data-testid="slide">
        Arriving
      </MPAnimateSlide>
    );
    const element = screen.getByTestId('slide').element() as HTMLElement;

    expect(element.style.getPropertyValue('--_mp-anim-opacity')).toBe('1');
  });

  it('renders something other than a `div`', async () => {
    const screen = await render(
      <MPAnimateSlide render={<aside />} data-testid="slide">
        Arriving
      </MPAnimateSlide>
    );

    expect(screen.getByTestId('slide').element().tagName).toBe('ASIDE');
  });
});
