import * as React from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { MPIcon } from '../icon/MPIcon';
import { ChevronDownIcon } from '../../constants/icons';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_ICON,
  hasContent,
  META_TEXT,
  PROSE_TEXT,
  SHEET_PAD_X,
  SHEET_PAD_Y,
  SHEET_TITLE
} from '../../internal/scale';
import { CONTAINER_SURFACE } from '../../internal/surface';
import type { MPSize, MPVariant } from '../../types';

export interface MPCollapsibleProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  // `title` is the tooltip attribute on every element; here it is the heading
  // written on the trigger, and a node rather than a string.
  'title' | 'onChange'
> {
  /** Whether the panel is showing. Use with `onOpenChange` for a controlled one. */
  open?: boolean;
  /**
   * Whether it starts open, for an uncontrolled one.
   * @default false
   */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The heading on the trigger. */
  title?: React.ReactNode;
  /** A second line under it, one step down the type scale and muted. */
  subtitle?: React.ReactNode;
  /** Content before the title — a glyph, a status dot, a count. */
  startIcon?: React.ReactNode;
  /**
   * A control pinned to the end of the header, **outside** the trigger.
   *
   * Deliberately outside it: a header that both folds and holds a switch has two
   * things to press, and a `<button>` inside a `<button>` is markup the browser
   * rewrites on parse. The same shape `MPListItem` and `MPAccordionItem` use.
   */
  action?: React.ReactNode;
  /**
   * Replaces the header entirely with a control of your own — an `MPButton`, an
   * `MPChip`, a line of text you made pressable.
   *
   * The element you pass *becomes* the trigger: Base UI hands it the click
   * handler, `aria-expanded` and the `aria-controls` pointing at the panel, so
   * there is nothing to wire up. `title` and the slots around it are for the far
   * commoner case of wanting the header that is already there.
   */
  trigger?: React.ReactElement;
  /**
   * The chevron at the end of the header, turned to report the state.
   * @default true
   */
  indicator?: boolean;
  /** Unavailable. The trigger stops answering and the panel stays as it is. */
  disabled?: boolean;
  /**
   * Inner padding around the panel's content. Turn it off for something that
   * should reach the edges — a table, a picture, a list of its own.
   * @default true
   */
  padded?: boolean;
  /**
   * How much surface the sheet paints.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The room inside, and the type scale of the header and the body.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Keeps a closed panel in the DOM so the browser's own page search can find
   * and open it. Overrides `keepMounted`.
   * @default false
   */
  hiddenUntilFound?: boolean;
  /**
   * Keeps a closed panel in the DOM. For content that is expensive to build, or
   * that holds form state which should survive being folded away.
   * @default false
   */
  keepMounted?: boolean;
  /** The body. */
  children?: React.ReactNode;
}

/**
 * The panel's own animation, and the one thing in this component that moves.
 *
 * Base UI measures the content and publishes it as `--collapsible-panel-height`;
 * the height travels from there to zero and `overflow-hidden` clips the body
 * rather than squashing it on the way. Nothing is transformed and no text is
 * resampled — the panel is a window opening onto content that never moves
 * relative to it, which is why this is not the thing `FADE` was written against.
 *
 * The duration and the curve are the specification's `short4` and `standard`,
 * the same pair a text field's outline settles on.
 */
const PANEL = [
  'h-(--collapsible-panel-height) overflow-hidden',
  'transition-[height] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
  'motion-reduce:transition-none',
  'data-starting-style:h-0 data-ending-style:h-0'
].join(' ');

/**
 * The space under the body: `SHEET_PAD_Y`'s track on one edge only.
 *
 * The header has already paid for the space *above* the body, so a body that
 * padded both edges would sit a full track lower than it looks. Written out
 * rather than derived, for the reason `SHEET_PAD_Y` gives — Tailwind finds
 * classes by scanning source text, so a `py-4` turned into a `pb-4` in
 * JavaScript generates no rule at all.
 */
const PANEL_PAD_BOTTOM: Record<MPSize, string> = {
  xs: 'pb-2.5',
  sm: 'pb-3',
  md: 'pb-4',
  lg: 'pb-5',
  xl: 'pb-6'
};

/**
 * One section that folds, standing on its own.
 *
 * An [MPAccordion](./accordion) is a *set* of these and owns which one of them
 * is open; this is the same fold with nothing else beside it, so what it needs
 * is an `open` of its own rather than a place in somebody's list. Reach for it
 * for a "Show more" on a form, an optional block of settings, the detail under
 * a row.
 *
 * Base UI owns the parts that are genuinely hard: the `<button>`/panel pairing
 * and the `aria-controls` / `aria-expanded` wiring between them,
 * `hidden="until-found"`, and measuring the panel so it has a height to animate
 * from. What is here is the surface, the ladders and the state layer.
 *
 * ## Why there is no `color`
 *
 * Because nothing would read it. The sheet stays neutral — a collapsible is a
 * box holding somebody else's content, and dyeing the box dyes their content's
 * background — and the focus ring is `secondary` on every control in the
 * library. A prop that reaches nothing is a prop that has to be supported
 * forever. For a fold that *is* the message rather than a container for one,
 * that is [MPAlert](../feedback/alert).
 */
export const MPCollapsible = React.forwardRef<HTMLDivElement, MPCollapsibleProps>(
  function MPCollapsible(
    {
      open,
      defaultOpen = false,
      onOpenChange,
      title,
      subtitle,
      startIcon,
      action,
      trigger,
      indicator = true,
      disabled = false,
      padded = true,
      variant = 'outlined',
      size = 'md',
      hiddenUntilFound = false,
      keepMounted = false,
      className,
      children,
      ...props
    },
    ref
  ) {
    const padX = SHEET_PAD_X[size];
    const padY = SHEET_PAD_Y[size];

    return (
      <Collapsible.Root
        ref={ref}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => onOpenChange?.(next)}
        disabled={disabled}
        data-mp-size={size}
        data-mp-variant={variant}
        className={[
          // `overflow-hidden` is what makes the panel a window rather than
          // something that spills past the sheet's own corners while it moves.
          'mp-collapsible rounded-mp-md flex w-full flex-col overflow-hidden',
          CONTAINER_SURFACE[variant],
          'text-mp-on-surface',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {trigger ? (
          <Collapsible.Trigger render={trigger} />
        ) : (
          <div className="flex w-full items-center">
            <Collapsible.Trigger
              className={[
                'group relative flex min-w-0 flex-1 cursor-pointer items-center text-start',
                'appearance-none border-0 bg-transparent font-[inherit] text-inherit',
                padX,
                padY,
                CONTROL_GAP[size],
                // Inset rather than offset. The sheet clips its children so the
                // panel can be a window, and `overflow: hidden` clips a
                // descendant's outline along with everything else — an offset
                // ring on a trigger that fills the top of the sheet would be
                // shaved off on three sides.
                'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
                'focus-visible:outline-solid outline-none',
                'disabled:text-mp-on-surface/38 disabled:cursor-default'
              ].join(' ')}
            >
              {/* Material's own hover, focus and press: a translucent wash of the
                  content colour over the container, rather than three more
                  backgrounds. */}
              <MPStateLayer />

              {hasContent(startIcon) ? (
                <span className="text-mp-on-surface-variant flex h-[1lh] shrink-0 items-center">
                  {startIcon}
                </span>
              ) : null}

              <span className="flex min-w-0 flex-1 flex-col">
                {hasContent(title) ? (
                  <span className={`truncate ${SHEET_TITLE[size]}`}>{title}</span>
                ) : null}
                {hasContent(subtitle) ? (
                  <span className={`text-mp-on-surface-variant truncate ${META_TEXT}`}>
                    {subtitle}
                  </span>
                ) : null}
              </span>

              {/* Turned, not moved. The chevron is a glyph, so rotating it
                  resamples nothing, and it is the only part of the header that
                  reports the state by moving — the header itself only takes the
                  state layer. */}
              {indicator ? (
                <span
                  className={[
                    'text-mp-on-surface-variant flex h-[1lh] shrink-0 items-center',
                    'transition-[rotate] duration-(--mp-sys-motion-duration-short4)',
                    'ease-mp-standard motion-reduce:transition-none',
                    'group-data-panel-open:rotate-180'
                  ].join(' ')}
                >
                  <MPIcon icon={ChevronDownIcon} size={CONTROL_ICON[size]} />
                </span>
              ) : null}
            </Collapsible.Trigger>

            {hasContent(action) ? (
              <span className={`flex shrink-0 items-center ${padX}`}>{action}</span>
            ) : null}
          </div>
        )}

        <Collapsible.Panel
          hiddenUntilFound={hiddenUntilFound}
          keepMounted={keepMounted}
          className={PANEL}
        >
          <div
            className={[
              'min-w-0',
              PROSE_TEXT[size],
              'text-mp-on-surface-variant',
              padded ? padX : '',
              // The default header already paid for the space above, so the body
              // owes only the space below it — otherwise a closed collapsible
              // would look padded along its bottom edge. A caller's own `trigger`
              // has paid for nothing, so there the panel owes both.
              padded ? (trigger ? padY : PANEL_PAD_BOTTOM[size]) : ''
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {children}
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    );
  }
);
