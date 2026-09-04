import * as React from 'react';
import { Accordion } from '@base-ui/react/accordion';
import { MPIcon } from '../icon/MPIcon';
import { ChevronDownIcon } from '../../constants/icons';
import { MPStateLayer } from '../../internal/StateLayer';
import {
  CONTROL_GAP,
  CONTROL_ICON,
  hasContent,
  META_TEXT,
  PROSE_TEXT,
  SHEET_TITLE
} from '../../internal/scale';
import { sheetPadX, sheetPadY } from '../../internal/density';
import { containerSurface } from '../../internal/elevation';
import { useMPDensity, useMPSize } from '../../internal/config';
import type { MPDensity, MPSize, MPElevation, MPVariant } from '../../types';

/**
 * What an `MPAccordionItem` inherits from the `MPAccordion` around it.
 *
 * The same arrangement `MPList` uses, and for the same reason: a section is a
 * section *of* something, so the rung it is drawn at and whether the sections
 * are ruled belong to the stack rather than to any one fold in it. Passing them
 * per item would be two chances per item to get one wrong, with a silent
 * failure — an accordion whose fourth section is a size bigger than the three
 * above it.
 *
 * A context rather than `React.Children.map` with `cloneElement`, for the reason
 * `MPList` gives: the moment a caller `.map()`s their data or wraps a section in
 * a component of their own, cloning stops reaching the item.
 */
interface MPAccordionContextValue {
  size: MPSize;
  density: MPDensity;
  dividers: boolean;
}

const MPAccordionContext = React.createContext<MPAccordionContextValue>({
  size: 'md',
  density: 0,
  dividers: true
});

export interface MPAccordionProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'onChange'
> {
  /**
   * Whether more than one section may be open at once.
   *
   * `false` by default, which is the whole reason an accordion is not just a
   * stack of [collapsibles](./collapsible): closing the last one as the next
   * opens is what keeps the page from growing under the reader.
   * @default false
   */
  multiple?: boolean;
  /** Which sections are open. Use with `onValueChange` for a controlled accordion. */
  value?: (string | number)[];
  /** Which start open, for an uncontrolled one. */
  defaultValue?: (string | number)[];
  onValueChange?: (value: (string | number)[]) => void;
  /**
   * Separates the sections with a hairline rather than with space.
   *
   * On by default, which is the other way round from `MPList`. A list of tiles
   * is a list; an accordion of tiles is a stack of cards that happen to fold,
   * and the rule is what says the sections are parts of one thing.
   * @default true
   */
  dividers?: boolean;
  /** Unavailable. Every section stops answering. */
  disabled?: boolean;
  /**
   * How much surface the sheet paints.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * How far off the page the sheet is lifted, on MD3's own scale.
   *
   * It moves the **tone** as well as the shadow, because Material pairs the two:
   * a level-2 surface is `surface-container` under a level-2 shadow, and a prop
   * that only cast a shadow would raise this into a surface the specification
   * has no name for. Given a level, `variant` is left holding only its hairline.
   *
   * Left unset, `variant` decides — and `variant="elevated"` is this at `1`.
   */
  elevation?: MPElevation;
  /**
   * The room inside every section, and the type scale of its header and body.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Takes room out of every section's header and body.
   *
   * An accordion is a list of rows that happen to open, so it wants density for
   * the reason a list does: a panel of eight sections that fits on the screen is
   * a different component from one that has to be scrolled to be understood.
   * @default 0
   */
  density?: MPDensity;
  /**
   * Keeps closed panels in the DOM so the browser's own page search can find and
   * open them. Overrides `keepMounted`.
   * @default false
   */
  hiddenUntilFound?: boolean;
  /**
   * Keeps closed panels in the DOM. For content that is expensive to build, or
   * that holds form state which should survive being folded away.
   * @default false
   */
  keepMounted?: boolean;
  /** The `MPAccordionItem`s. */
  children?: React.ReactNode;
}

export interface MPAccordionItemProps extends Omit<
  React.ComponentPropsWithoutRef<'div'>,
  'title' | 'onChange'
> {
  /**
   * Identifies the section to `value` / `defaultValue`. Base UI generates one
   * when it is left out, which is enough for an accordion nobody drives from
   * code.
   */
  value?: string | number;
  /** The heading on the fold. */
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
   * rewrites on parse. The same shape `MPCollapsible` and `MPListItem` use.
   */
  action?: React.ReactNode;
  /** Unavailable. This section stops folding; the rest keep working. */
  disabled?: boolean;
  /** The body. */
  children?: React.ReactNode;
}

/**
 * The rule between two sections.
 *
 * Written as `>div+div` rather than as a class on each item so it holds however
 * the caller composed them — through a `.map()`, through fragments, through a
 * component of their own that renders an item. `outline-variant` is the quieter
 * of MD3's two outlines, and the one a divider takes.
 */
const DIVIDERS = '[&>div+div]:border-mp-outline-variant [&>div+div]:border-t';

/**
 * A section's corner when the sections are tiles rather than rows.
 *
 * One step down from the sheet's own `corner-medium`, which is the step
 * `MPListItem` takes for the same reason: a tile inside a sheet has to read as
 * being *in* it, and a corner equal to its container's makes it read as a second
 * sheet lying on top.
 */
const ITEM_RADIUS = 'rounded-mp-sm';

/**
 * The panel's animation, and the only thing in the component that moves.
 *
 * Base UI measures the content and publishes it as `--accordion-panel-height`;
 * `overflow-hidden` clips the body rather than squashing it on the way. Nothing
 * is transformed and no text is resampled — the panel is a window opening onto
 * content that never moves relative to it, which is why this is not the thing
 * `FADE` was written against.
 *
 * The clip is only true while the height is moving — see `PANEL_OPEN`.
 */
const PANEL = [
  'h-(--accordion-panel-height) overflow-hidden',
  'transition-[height] duration-(--mp-sys-motion-duration-short4) ease-mp-standard',
  'motion-reduce:transition-none',
  'data-starting-style:h-0 data-ending-style:h-0'
].join(' ');

/**
 * What a panel that has finished opening stops doing.
 *
 * `overflow: hidden` is the animation's, not the panel's. It exists so a body
 * mid-open is a window rather than a squashed copy of itself, and it has no
 * business surviving the animation: a settled panel that goes on clipping cuts
 * the top off the first thing in it that draws outside its own box. A text
 * field's floating label is exactly that — it sits *on* the field's top edge,
 * which is the panel's top edge — so a form in an accordion arrived with its
 * first label sliced in half, and nothing in the console said so.
 *
 * A select's popup, a tooltip and a focus ring are the same bug with different
 * pixels.
 *
 * Why it cannot be a `data-open:` variant: `data-open` is set for the whole of
 * the opening animation, which is the part that has to clip. The state this
 * needs is "open **and** no longer moving", and nothing in the DOM says that —
 * so `MPAccordionItem` below works it out from the transition itself.
 */
const PANEL_OPEN = 'data-open:overflow-visible';

/**
 * Whether a height transition is actually going to run on this panel.
 *
 * `data-starting-style` says the panel is about to grow from nothing, and a
 * duration says the growing will be animated. A section that started open has
 * neither, and a reader who asked for reduced motion has only the first — in
 * both cases no `transitionend` is coming, so a panel that waited for one would
 * stay clipped for good.
 */
function willMove(panel: HTMLElement): boolean {
  return (
    panel.hasAttribute('data-starting-style') &&
    parseFloat(getComputedStyle(panel).transitionDuration) > 0
  );
}

/** The space under a body: `SHEET_PAD_Y`'s track on one edge only. */
const PANEL_PAD_BOTTOM: Record<MPSize, string> = {
  xs: 'pb-2.5',
  sm: 'pb-3',
  md: 'pb-4',
  lg: 'pb-5',
  xl: 'pb-6'
};

/**
 * A stack of sections, one of which is open.
 *
 * Base UI owns the parts that are genuinely hard: the `<button>`/`region`
 * pairing and the `aria-controls` / `aria-expanded` wiring between them, the set
 * of open values, and measuring each panel so it has a height to animate from.
 * What is here is the surface, the ladders and Material's state layer.
 *
 * ## Why this is not a stack of collapsibles
 *
 * Because of `multiple`. A [collapsible](./collapsible) has an `open` of its
 * own and answers to nobody; an accordion owns the *set*, and closing the last
 * section as the next one opens is the whole reason the component exists — it is
 * what keeps the page from growing under the reader. Sections that are genuinely
 * unrelated should be collapsibles, and a component that closed one because the
 * other opened would be inventing a relationship the page does not have.
 *
 * ## The surface stays neutral
 *
 * Even on `filled`, which here is `surface-container-highest` — MD3's own filled
 * card — rather than the accent. An accordion is a box holding somebody else's
 * content, and dyeing the box dyes their content's background. That is also why
 * there is no `color`: nothing would read it.
 */
export const MPAccordion = React.forwardRef<HTMLDivElement, MPAccordionProps>(function MPAccordion(
  {
    multiple = false,
    value,
    defaultValue,
    onValueChange,
    dividers = true,
    disabled = false,
    variant = 'outlined',
    elevation,
    size: sizeProp,
    density: densityProp,
    hiddenUntilFound = false,
    keepMounted = false,
    className,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const density = useMPDensity(densityProp);
  const context = React.useMemo(() => ({ size, density, dividers }), [size, density, dividers]);

  return (
    <MPAccordionContext.Provider value={context}>
      <Accordion.Root
        ref={ref}
        multiple={multiple}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next as (string | number)[])}
        disabled={disabled}
        hiddenUntilFound={hiddenUntilFound}
        keepMounted={keepMounted}
        data-mp-size={size}
        data-mp-variant={variant}
        className={[
          'mp-accordion rounded-mp-md flex w-full flex-col',
          containerSurface(variant, elevation),
          'text-mp-on-surface',
          // Without dividers the sections are tiles and the sheet keeps a hair
          // of padding, so a hovered header's state layer does not run into the
          // edge. With them the rules have to reach the edge, so the padding
          // goes and the tiles square off.
          dividers ? `overflow-hidden ${DIVIDERS}` : 'p-1',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </Accordion.Root>
    </MPAccordionContext.Provider>
  );
});

/**
 * One section.
 *
 * The header is always a row, and what is inside it is a real `<button>`
 * covering the title and the chevron, with `action` sitting outside that button
 * as a control of its own. The same shape `MPChip` and `MPListItem` use, for the
 * same two reasons: a `<div>` carrying a click handler is invisible to a
 * keyboard, and a `<button>` inside a `<button>` is markup the browser rewrites
 * on parse.
 */
export const MPAccordionItem = React.forwardRef<HTMLDivElement, MPAccordionItemProps>(
  function MPAccordionItem(
    { value, title, subtitle, startIcon, action, disabled = false, className, children, ...props },
    ref
  ) {
    const { size, density, dividers } = React.useContext(MPAccordionContext);

    const padX = sheetPadX(size, density);
    const padY = sheetPadY(size, density);

    /*
     * Whether the panel has finished opening, which is what decides the clip —
     * see `PANEL_OPEN`.
     *
     * Three signals, because no one of them covers every way a panel arrives:
     *
     * - `onOpenChange` fires as the fold is asked to move, before anything has
     *   moved. That is where the clip goes back *on*, and it is the only one of
     *   the three early enough to.
     * - The height's `transitionend` takes it off again. Base UI's
     *   `transitionStatus` cannot: it marks the first frame and the last, and
     *   what is needed here is the stretch between them.
     * - The callback ref covers the two panels that never transition at all — a
     *   section that started open, and any section under reduced motion — both
     *   of which would otherwise wait for an end that is not coming. It runs
     *   during the commit, before the browser paints, so a panel opening the
     *   ordinary way is clipped by the time there is anything to see.
     */
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const [settled, setSettled] = React.useState(false);

    const attachPanel = React.useCallback((node: HTMLDivElement | null) => {
      panelRef.current = node;

      if (node) {
        setSettled(node.hasAttribute('data-open') && !willMove(node));
      }
    }, []);

    return (
      <Accordion.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={['mp-accordion__item flex flex-col', className ?? ''].filter(Boolean).join(' ')}
        {...props}
      >
        <Accordion.Header className="m-0 flex w-full items-center font-[inherit]">
          <Accordion.Trigger
            className={[
              'group relative flex min-w-0 flex-1 cursor-pointer items-center text-start',
              'appearance-none border-0 bg-transparent font-[inherit] text-inherit',
              padX,
              padY,
              CONTROL_GAP[size],
              dividers ? '' : ITEM_RADIUS,
              // Inset rather than offset. A ruled accordion clips its children so
              // the panels can be windows, and `overflow: hidden` clips a
              // descendant's outline along with everything else.
              'outline-mp-secondary focus-visible:outline-2 focus-visible:-outline-offset-2',
              'focus-visible:outline-solid outline-none',
              'disabled:text-mp-on-surface/38 disabled:cursor-default'
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <MPStateLayer />

            {hasContent(startIcon) ? (
              <span className="text-mp-on-surface-variant flex h-[1lh] shrink-0 items-center">
                {startIcon}
              </span>
            ) : null}

            <span className="mp-accordion__text flex min-w-0 flex-1 flex-col">
              {hasContent(title) ? (
                <span className={`mp-accordion__title truncate ${SHEET_TITLE[size]}`}>{title}</span>
              ) : null}
              {hasContent(subtitle) ? (
                <span
                  className={`mp-accordion__subtitle text-mp-on-surface-variant truncate ${META_TEXT}`}
                >
                  {subtitle}
                </span>
              ) : null}
            </span>

            {/* Turned, not moved. The chevron is a glyph, so rotating it
                resamples nothing, and it is the only part of the header that
                reports the open state by moving. */}
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
          </Accordion.Trigger>

          {hasContent(action) ? (
            <span className={`flex shrink-0 items-center ${padX}`}>{action}</span>
          ) : null}
        </Accordion.Header>

        <Accordion.Panel
          ref={attachPanel}
          className={[PANEL, settled ? PANEL_OPEN : ''].filter(Boolean).join(' ')}
          onTransitionEnd={(event) => {
            // The panel's own height and not a transition that bubbled up out of
            // the content: a button inside it changing colour would otherwise
            // unclip a panel that is still closing.
            if (event.target === panelRef.current && event.propertyName === 'height') {
              setSettled(panelRef.current.hasAttribute('data-open'));
            }
          }}
        >
          <div
            className={[
              'min-w-0',
              PROSE_TEXT[size],
              'text-mp-on-surface-variant',
              padX,
              // The header already paid for the space above, so the body owes
              // only the space below it, or every closed section would look
              // padded along its bottom edge.
              PANEL_PAD_BOTTOM[size]
            ].join(' ')}
          >
            {children}
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    );
  }
);
