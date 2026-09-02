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
 * `stagger` is on every effect that is a single `@keyframes` on the element
 * itself, and on nothing else.
 *
 * `MPAnimateFade`'s own suite is where the behaviour is argued — which element
 * carries the animation, what the delays come out as, what a negative
 * `durationStep` clamps to. This file asks a different question, and it is the
 * one a per-component suite cannot: **do all six agree?** Six components got
 * the same three props by the same edit, and the failure that edit invites is
 * one of them keeping the effect on its box while the other five moved it to
 * the children — which every individual suite would still pass.
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
