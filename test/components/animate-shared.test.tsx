import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import {
  MPAnimateAppear,
  MPAnimateBlink,
  MPAnimateFade,
  MPAnimateGrow,
  MPAnimateRotate,
  MPAnimateSlide,
  MPAnimateZoom
} from 'material-plus-ui';

/**
 * The props that are on every effect which is a single `@keyframes` on the
 * element itself, and on nothing else: `stagger` and its two, and `timeline`.
 *
 * `MPAnimateFade`'s own suite is where the behaviour is argued — which element
 * carries the animation, what the delays come out as, what a negative
 * `durationStep` clamps to, which slots a `view()` timeline fills. This file
 * asks a different question, and it is the one a per-component suite cannot:
 * **do all six agree?** Six components got the same props by the same edit, and
 * the failure that edit invites is one of them being missed — which every
 * individual suite would still pass.
 *
 * The keyframe is the assertion rather than the class name, because that is
 * what a reader sees. `grow` and `zoom` share `mp-anim-scale`, deliberately:
 * they are the same arithmetic at two strengths.
 */
const EFFECTS = [
  ['MPAnimateFade', MPAnimateFade, 'mp-anim-fade'],
  ['MPAnimateGrow', MPAnimateGrow, 'mp-anim-scale'],
  ['MPAnimateZoom', MPAnimateZoom, 'mp-anim-scale'],
  ['MPAnimateSlide', MPAnimateSlide, 'mp-anim-slide'],
  ['MPAnimateRotate', MPAnimateRotate, 'mp-anim-rotate'],
  ['MPAnimateBlink', MPAnimateBlink, 'mp-anim-blink']
] as const;

describe('one effect across a set', () => {
  for (const [name, Effect, keyframe] of EFFECTS) {
    describe(name, () => {
      it('moves its keyframe onto the children and off the box', async () => {
        const screen = await render(
          <Effect stagger={50} data-testid="box">
            <p data-testid="one">One</p>
            <p data-testid="two">Two</p>
          </Effect>
        );
        const box = screen.getByTestId('box').element() as HTMLElement;
        const one = screen.getByTestId('one').element() as HTMLElement;
        const two = screen.getByTestId('two').element() as HTMLElement;

        expect(getComputedStyle(box).animationName).toBe('none');
        expect(getComputedStyle(one).animationName).toBe(keyframe);
        expect(getComputedStyle(two).animationName).toBe(keyframe);
        expect(getComputedStyle(two).animationDelay).toBe('0.05s');
      });

      it('hands the animation to the scrollport on `timeline="view"`', async () => {
        const screen = await render(
          <Effect timeline="view" trigger="manual" data-testid="box">
            <p>One</p>
          </Effect>
        );
        const box = screen.getByTestId('box').element() as HTMLElement;

        expect(box.style.getPropertyValue('--_mp-anim-timeline')).toBe('view()');
        // Held running: a paused scroll-driven animation shows nothing at all,
        // and `manual` with nothing pressing go is exactly that.
        expect(getComputedStyle(box).animationPlayState).toBe('running');
      });

      it('keeps the box as the subject when nobody asked for a set', async () => {
        const screen = await render(
          <Effect data-testid="box">
            <p data-testid="one">One</p>
          </Effect>
        );
        const box = screen.getByTestId('box').element() as HTMLElement;
        const one = screen.getByTestId('one').element() as HTMLElement;

        expect(getComputedStyle(box).animationName).toBe(keyframe);
        expect(getComputedStyle(one).animationName).toBe('none');
      });
    });
  }

  /*
   * And the stylesheet's half of it, which is where the two declarations become
   * an animation. Asserted in one place rather than per effect: it is one rule
   * on `.mp-anim`, and every keyframe gains the mode from it.
   */
  describe('the scroll-driven rule', () => {
    it('resolves to a real view timeline where the browser has one', async () => {
      const screen = await render(
        <MPAnimateFade timeline="view" data-testid="box">
          One
        </MPAnimateFade>
      );
      const box = screen.getByTestId('box').element() as HTMLElement;
      const supported = CSS.supports('animation-timeline: view()');
      const resolved = getComputedStyle(box).animationTimeline;

      // Degraded rather than blank is the contract. Where `view()` is there, the
      // animation is on it; where it is not, the `@supports` drops the pair and
      // the effect plays once on the clock the way it always did.
      expect(resolved).toBe(supported ? 'view()' : 'auto');
      expect(getComputedStyle(box).animationName).toBe('mp-anim-fade');
    });

    it('leaves an ordinary effect on the clock', async () => {
      const screen = await render(<MPAnimateFade data-testid="box">One</MPAnimateFade>);
      const box = screen.getByTestId('box').element() as HTMLElement;

      expect(getComputedStyle(box).animationTimeline).toBe('auto');
    });
  });

  /*
   * And the component the helper came from. `MPAnimateAppear` is this with
   * `stagger` already on and a default of 80ms, and the point of lifting the
   * implementation out of it was that there would not be two of them: two
   * copies would be two answers to which child is the third one, and the
   * disagreement would only show up on a set that was also reversed.
   */
  describe('MPAnimateAppear', () => {
    it('runs on the same code, at its own default', async () => {
      const screen = await render(
        <MPAnimateAppear data-testid="box">
          <p data-testid="one">One</p>
          <p data-testid="two">Two</p>
        </MPAnimateAppear>
      );
      const two = screen.getByTestId('two').element() as HTMLElement;

      expect(getComputedStyle(two).animationName).toBe('mp-anim-slide');
      expect(getComputedStyle(two).animationDelay).toBe('0.08s');
    });

    it('takes the scroll timeline too, onto each child', async () => {
      const screen = await render(
        <MPAnimateAppear timeline="view" trigger="manual" data-testid="box">
          <p data-testid="one">One</p>
        </MPAnimateAppear>
      );
      const box = screen.getByTestId('box').element() as HTMLElement;
      const one = screen.getByTestId('one').element() as HTMLElement;

      expect(one.style.getPropertyValue('--_mp-anim-timeline')).toBe('view()');
      expect(getComputedStyle(one).animationPlayState).toBe('running');
      expect(box.style.getPropertyValue('--_mp-anim-state')).toBe('running');
    });

    it('still arrives all at once at a stagger of nought, having no box to fall back to', async () => {
      const screen = await render(
        <MPAnimateAppear stagger={0} data-testid="box">
          <p data-testid="one">One</p>
          <p data-testid="two">Two</p>
        </MPAnimateAppear>
      );
      const box = screen.getByTestId('box').element() as HTMLElement;
      const two = screen.getByTestId('two').element() as HTMLElement;

      // Where the six differ from this one: there, nought means the box is the
      // subject. Here there is no box animation to fall back to, so nought is a
      // set that arrives together — which is a real thing to ask for.
      expect(getComputedStyle(box).animationName).toBe('none');
      expect(getComputedStyle(two).animationName).toBe('mp-anim-slide');
      expect(getComputedStyle(two).animationDelay).toBe('0s');
    });
  });
});
