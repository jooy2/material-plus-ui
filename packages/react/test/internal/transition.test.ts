import { describe, expect, it } from 'vitest';
import { transitionParts, transitionProps } from '../../src/internal/transition';
import type { MPAnimation } from '../../src/types';

const EFFECTS: readonly MPAnimation[] = [
  'fade',
  'grow',
  'slide',
  'zoom',
  'rotate',
  'blink',
  'reveal'
];

/**
 * The reading, and the two things that would make `transition="zoom"` and
 * `<MPAnimateZoom>` quietly different animations.
 *
 * One is a default drifting apart from the wrapper's; the other is a slot the
 * short form forgets to fill, which shows up as an effect that runs from
 * wherever the element already was. Both look like a working animation, which is
 * why they are asserted rather than read.
 */
describe('transitionParts', () => {
  it('answers nothing for nothing, so a caller composes unconditionally', () => {
    expect(transitionParts(undefined)).toBeNull();
    expect(transitionProps(undefined)).toEqual({ className: '', style: {} });
  });

  it('reads a bare effect name as the effect', () => {
    for (const effect of EFFECTS) {
      expect(transitionParts(effect)?.effect).toBe(effect);
    }
  });

  it('starts every effect from somewhere', () => {
    // An effect whose slot was never filled runs from wherever the element
    // already is, which is an animation that plays and does nothing.
    expect(transitionParts('grow')?.scale).toBe(0.8);
    expect(transitionParts('zoom')?.scale).toBe(0.4);
    expect(transitionParts('rotate')?.angle).toBe('-180deg');
    expect(transitionParts('slide')?.y).toBeTruthy();
    expect(transitionParts('reveal')?.clip).toBeTruthy();
  });

  it('fades in by default, because an entrance that only moves reads as a jump', () => {
    expect(transitionParts('slide')?.opacity).toBe(0);
    expect(transitionParts({ effect: 'slide', fade: false })?.opacity).toBe(1);
  });

  it('leaves a reveal opaque, since the clip is what hides it', () => {
    expect(transitionParts('reveal')?.opacity).toBe(1);
  });

  it('takes the object form over every default it names', () => {
    const parts = transitionParts({
      effect: 'slide',
      from: 'left',
      distance: 40,
      duration: 300,
      delay: 120,
      easing: 'emphasized-decelerate'
    });

    expect(parts?.duration).toBe(300);
    expect(parts?.delay).toBe(120);
    expect(parts?.easing).toBe('emphasized-decelerate');
    expect(parts?.x).toBe('-40px');
    expect(parts?.y).toBe('0px');
  });
});

describe('transitionProps', () => {
  it('names the effect in a class and the numbers in slots', () => {
    const { className, style } = transitionProps('fade');

    expect(className).toContain('mp-anim');
    expect(style).toHaveProperty('--_mp-anim-opacity');
  });

  it('runs once, whatever it is', () => {
    // There is no `repeat` on the prop, and the absence is the design: anything
    // that has to run again is what the `MPAnimate*` components are.
    for (const effect of EFFECTS) {
      const style = transitionProps(effect).style as Record<string, string>;

      expect(style['--_mp-anim-repeat']).toBe('1');
    }
  });

  it('gives each effect a class, and lets grow and zoom share one', () => {
    // Six classes for seven effects: `grow` and `zoom` are the same keyframe on
    // the scale property and differ only in where they start, which is a slot
    // rather than a rule.
    const classes = EFFECTS.map((effect) => transitionProps(effect).className);

    expect(new Set(classes).size).toBe(6);
    expect(transitionProps('grow').className).toBe(transitionProps('zoom').className);
    expect(transitionProps('grow').style).not.toEqual(transitionProps('zoom').style);
  });
});
