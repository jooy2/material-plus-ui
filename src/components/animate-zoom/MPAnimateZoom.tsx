import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { isInfinite, useAnimateElement } from '../../internal/animate';
import type {
  MPAnimateMode,
  MPAnimateProps,
  MPAnimateStaggerProps,
  MPAnimateTimelineProps
} from '../../types';

export interface MPAnimateZoomProps
  extends
    MPAnimateProps,
    MPAnimateStaggerProps,
    MPAnimateTimelineProps,
    React.ComponentPropsWithoutRef<'div'> {
  /**
   * Whether the content comes forward or falls away. An exit is quicker than an
   * entrance — MD3's `short4` against `medium4` — unless `duration` says
   * otherwise.
   * @default 'in'
   */
  mode?: MPAnimateMode;
  /**
   * The scale it starts from, as a multiple of its final size. Above `1` it
   * arrives oversized and settles back, which reads as coming *towards* the
   * reader rather than up out of the page.
   * @default 0.4
   */
  from?: number;
  /**
   * Fades in as it zooms.
   * @default true
   */
  fade?: boolean;
  /** Renders something other than a `<div>`. Base UI's own escape hatch. */
  render?: useRender.RenderProp;
  children?: React.ReactNode;
}

/**
 * Content arriving from the middle of where it will end up.
 *
 * The same arithmetic as [MPAnimateGrow](../motion/animate-grow) at more than
 * twice the distance, and always about the centre — which is the whole
 * difference. A grow unfolds *from* somewhere; a zoom comes at the reader.
 *
 * Use it for the one thing on a screen that is meant to interrupt: a
 * confirmation, a result, a number that has just landed. Use it once. An
 * interruption that happens three times on one screen is a layout, and the
 * effect that belongs to a set of things rather than to one is
 * [MPAnimateAppear](../motion/animate-appear).
 *
 * There is no `origin`, on purpose. A zoom anchored to a corner is a grow, and
 * the library does not offer two spellings of one idea.
 */
export const MPAnimateZoom = React.forwardRef<HTMLDivElement, MPAnimateZoomProps>(
  function MPAnimateZoom(
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
      stagger = 0,
      durationStep,
      reverse,
      timeline,
      range,
      mode = 'in',
      from = 0.4,
      fade = true,
      render,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const animate = useAnimateElement({
      effect: 'zoom',
      duration,
      delay,
      easing,
      repeat,
      alternate,
      mode,
      scale: from,
      opacity: fade ? 0 : 1,
      trigger,
      play,
      once,
      threshold,
      paused,
      infinite: isInfinite(repeat),
      stagger,
      durationStep,
      reverse,
      timeline,
      range,
      children
    });

    return useRender({
      render,
      ref: [ref, animate.ref],
      props: {
        ...props,
        className: [animate.className, className].filter(Boolean).join(' '),
        // Written out rather than left to the sheet's default, so a
        // `transform-origin` inherited from a caller's own rule cannot quietly
        // turn this into a grow.
        style: { transformOrigin: 'center', ...animate.style, ...style },
        ...animate.props,
        children: animate.children
      }
    });
  }
);
