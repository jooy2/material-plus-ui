import type * as React from 'react';

/**
 * Holds a control open at the width of the widest thing it could ever say.
 *
 * A control that is not `fullWidth` is sized by what it is *currently* saying,
 * which for anything whose value changes means the box changes with it. A date
 * picker on the 1st is a dozen pixels narrower than the same picker on the 28th,
 * and `Sep` is wider than `May`. Either way the field moves under the pointer
 * that just used it, and the whole row of controls beside it shuffles along.
 *
 * So the alternatives are laid out too, stacked in a box clipped to no height.
 * The control's intrinsic width becomes the widest of them and stops depending
 * on the value.
 *
 * Three things it deliberately is not:
 *
 * - **Not `hidden`, and not `display: none`.** Both take the box out of layout,
 *   and a box that is not laid out reserves nothing.
 * - **Not read out.** `aria-hidden`, or a screen reader would announce every
 *   date the control might hold before the one it does.
 * - **Not text.** A sample is drawn as generated content off a data attribute
 *   rather than as a text node. `content: attr(…)` lays out exactly like text,
 *   so it reserves the same width — but it leaves nothing for `getByText` or a
 *   browser's find-in-page to trip over, so a caller's test asking for the date
 *   they chose keeps finding one element rather than two.
 */
export function MPWidthSizer({ samples }: { samples: readonly string[] }) {
  if (samples.length === 0) {
    return null;
  }

  return (
    <span aria-hidden="true" className="invisible h-0 min-h-0 overflow-hidden">
      {samples.map((sample, index) => (
        <span
          key={`${index}:${sample}`}
          data-sample={sample}
          className="block whitespace-nowrap before:content-[attr(data-sample)]"
        />
      ))}
    </span>
  );
}

/** The props a component hands over when it wants one of these. */
export type MPWidthSizerProps = React.ComponentProps<typeof MPWidthSizer>;
