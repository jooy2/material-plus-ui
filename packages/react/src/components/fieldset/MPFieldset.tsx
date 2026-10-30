import * as React from 'react';
import { Fieldset } from '@base-ui/react/fieldset';
import { useMPSize } from '../../internal/config';
import { hasContent, META_TEXT, SHEET_GAP, SHEET_TITLE, STACK_GAP } from '../../internal/scale';
import type { MPSize } from '../../types';

export interface MPFieldsetProps extends Omit<React.ComponentPropsWithoutRef<'fieldset'>, 'color'> {
  /**
   * What the group is called.
   *
   * It becomes part of the accessible name of every control inside, so it has to
   * be a phrase that still reads correctly in front of each of them — "Billing
   * address", not "Where should we send it?".
   */
  legend?: React.ReactNode;
  /** A line under the legend. */
  description?: React.ReactNode;
  /**
   * Disables every control inside at once, the way a `<fieldset>` always has.
   * @default false
   */
  disabled?: boolean;
  /**
   * The legend's type scale and the gap the controls stand at.
   * @default 'md'
   */
  size?: MPSize;
  children?: React.ReactNode;
}

/**
 * A group of controls that answer one question together, with a name on it.
 *
 * ## Why it draws no surface
 *
 * Because a group of fields is a **grouping** and not a sheet, and the sheet
 * already exists: put this inside an [MPCard](../layout/card) or an
 * [MPBox](../layout/box) when one is wanted. A fieldset that painted its own
 * would be a second sheet inside the first the moment anybody did.
 *
 * What it owns instead is the legend, the gap the controls stand at, and the one
 * thing only a real `<fieldset>` can do: **`disabled` reaches every control
 * inside it**, including ones a component three levels down rendered and never
 * heard of it. That is not something a context could promise.
 *
 * ## Why the legend is not a `<legend>`
 *
 * It is a `<div>` pointed at by `aria-labelledby` — Base UI's decision, and the
 * one that makes the group a normal flex container. A real rendered `<legend>`
 * is lifted out of its fieldset's content box by every browser, so a `gap` would
 * put no space at all under it and the first control would sit against the name
 * of the group.
 *
 * The accessible name is the same either way, which is the only part that had to
 * survive.
 */
export const MPFieldset = React.forwardRef<HTMLFieldSetElement, MPFieldsetProps>(
  function MPFieldset(
    { legend, description, disabled = false, size: sizeProp, className, children, ...props },
    ref
  ) {
    const size = useMPSize(sizeProp);
    const named = hasContent(legend) || hasContent(description);

    return (
      <Fieldset.Root
        ref={ref}
        disabled={disabled}
        data-mp-size={size}
        className={[
          'mp-fieldset flex min-w-0 flex-col',
          // A `<fieldset>` arrives with the browser's own border, padding and
          // margin, and none of the three is this library's — see `MPButton` for
          // the same argument about a `<button>`. `min-w-0` is the other half: a
          // fieldset is `min-width: min-content` by default, which is what makes
          // one holding a wide table refuse to shrink.
          'm-0 border-0 p-0',
          SHEET_GAP[size],
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {named ? (
          <Fieldset.Legend
            className={`mp-fieldset__legend flex min-w-0 flex-col p-0 ${STACK_GAP[size]}`}
          >
            {hasContent(legend) ? (
              <span className={`text-mp-on-surface ${SHEET_TITLE[size]}`}>{legend}</span>
            ) : null}
            {hasContent(description) ? (
              <span className={`text-mp-on-surface-variant ${META_TEXT}`}>{description}</span>
            ) : null}
          </Fieldset.Legend>
        ) : null}

        {children}
      </Fieldset.Root>
    );
  }
);
