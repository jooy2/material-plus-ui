import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, useAnimateElement } from '../../internal/animate';
import type { MPAnimateMode, MPAnimateProps } from '../../types';

export interface MPAnimateFadeProps extends MPAnimateProps, React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether the content arrives or leaves. An exit is quicker than an entrance
   * — MD3's `short4` against `medium2` — unless `duration` says otherwise.
   * @default 'in'
   */
  mode?: MPAnimateMode;
  /**
   * The opacity it starts from, between `0` and `1`. Raise it for content that
   * should never be completely gone.
   * @default 0
   */
  from?: number;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content arriving or leaving on opacity alone.
 *
 * The plainest effect in the set, and the one to reach for first: nothing
 * moves, so nothing reflows and nothing is resampled. A fade is the only
 * entrance that is safe on a block of text at any size — everything else in
 * this group either scales it or travels it, and both resample glyphs.
 *
 * It is also the effect MD3 names in two of its four standard patterns. **Fade
 * through** — one thing out, then the next in — is what this is when two of
 * them are sequenced with a `delay`; **fade** is what a thing entering or
 * leaving a screen does on its own, which is the default here.
 *
 * `mode="out"` is the same animation run backwards, and it is *held* at the
 * end: a faded-out element stays faded out rather than snapping back into view
 * the moment the animation finishes.
 */
export const MPAnimateFade = React.forwardRef<HTMLDivElement, MPAnimateFadeProps>(
  function MPAnimateFade(
    {
      duration,
      delay = 0,
      easing,
      repeat = 1,
      alternate,
      paused,
      trigger = 'mount',
      play,
      once = true,
      threshold = 0.2,
      mode = 'in',
      from = 0,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'fade',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      mode,
      opacity: from,
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat)
    });

    return useRender({
      render,
      ref: [ref, animate.ref],
      props: {
        ...props,
        className: [animate.className, className].filter(Boolean).join(' '),
        style: { ...animate.style, ...style },
        ...animate.props,
        children
      }
    });
  }
);
