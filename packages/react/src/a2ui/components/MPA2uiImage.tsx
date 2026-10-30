/**
 * `Image` — a picture from a URL, drawn as `MPImage`.
 *
 * `MPImage` rather than an `<img>` because the two things an agent cannot
 * anticipate are exactly what it handles: a URL that loads slowly, and a URL
 * that does not load at all. A payload arriving over a stream has neither a
 * `width` nor a `height` to reserve room with, so a plain `<img>` reflows the
 * surface as each picture arrives, and shows the browser's broken-image glyph
 * when one 404s.
 *
 * The protocol's `variant` is a size hint rather than a size, so it is read as
 * one: a box, and a fit where the box has a shape of its own to fill.
 */
import type * as React from 'react';
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ImageApi } from '@a2ui/web_core/v0_9';
import { MPImage, type MPImageFit } from '../../components/image/MPImage';
import { accessibilityAttributes, weightStyle } from '../internal/common';

/** The protocol's five fits, one of which is spelled differently in CSS. */
const FIT: Record<string, MPImageFit> = {
  contain: 'contain',
  cover: 'cover',
  fill: 'fill',
  none: 'none',
  scaleDown: 'scale-down'
};

/**
 * What each size hint draws as.
 *
 * `avatar` is round and `header` is a band, and the other three are widths and
 * heights that leave the picture its own proportions. `mediumFeature` is the
 * protocol's default and takes the room it is given, which is why it is empty.
 *
 * Declarations rather than utility classes, and that is the rule for the whole
 * of this directory — see `a2ui/index.ts`. The corner is the shape token, so a
 * page that set `data-mp-shape` has an avatar that follows it.
 */
const VARIANT: Record<string, React.CSSProperties> = {
  icon: { width: 24, height: 24 },
  avatar: { width: 40, height: 40, borderRadius: 'var(--mp-sys-shape-corner-full, 9999px)' },
  smallFeature: { maxWidth: 100 },
  mediumFeature: {},
  largeFeature: { maxHeight: 400 },
  header: { width: '100%', height: 200 }
};

export const MPA2uiImage = createComponentImplementation(ImageApi, ({ props }) => {
  const variant = props.variant ?? 'mediumFeature';

  return (
    <MPImage
      src={props.url}
      // The protocol's `description` is the picture's accessible name, and an
      // empty string is the right answer for one that has none: it marks the
      // picture decorative rather than leaving a screen reader to read the URL.
      alt={props.description ?? ''}
      // A band cropped to its width is the one place the hint outranks `fit`,
      // since a header letterboxed inside 200px is not a header.
      fit={variant === 'header' ? 'cover' : (FIT[props.fit ?? 'fill'] ?? 'fill')}
      style={{ ...VARIANT[variant], ...weightStyle(props.weight) }}
      {...accessibilityAttributes(props.accessibility)}
    />
  );
});
