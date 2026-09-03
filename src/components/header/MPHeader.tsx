import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { BAR_SURFACE, MPPageLayoutContext } from '../../internal/page-layout';
import { hasContent, SHEET_PAD_X } from '../../internal/scale';
import { measureValue } from '../../internal/measure';
import { useWindowMins } from '../../internal/window-class';
import { responsiveSlots, withBaseline } from '../../internal/responsive';
import { useMPSize } from '../../internal/config';
import type { MPAlign, MPMeasure, MPPosition, MPResponsive, MPSize, MPVariant } from '../../types';

export interface MPHeaderProps extends Omit<React.ComponentPropsWithoutRef<'header'>, 'title'> {
  /**
   * The leading slot: the mark, the product's name, the thing that is the same
   * on every page — and, on a narrow window, the
   * [MPSidebarTrigger](./sidebar#mpsidebartrigger) that goes ahead of it.
   *
   * A slot rather than the first of `children` because the three regions of a
   * bar are laid out *against each other* — the middle can only be centred on
   * the bar if the two ends are the component's to measure — and a caller
   * writing three wrappers by hand is a caller whose header drifts from the next
   * one.
   */
  brand?: React.ReactNode;
  /**
   * The trailing slot: the account menu, the theme switch, the call to action.
   * Laid out end-aligned, so a row of icon buttons needs no wrapper of its own.
   */
  actions?: React.ReactNode;
  /**
   * Where the middle slot sits.
   *
   * `center` is MD3's own **center-aligned top app bar**, and it is centred on
   * the *bar* rather than in the space left over: both ends are given equal
   * shares, so the middle stays on the bar's midline however long the brand is.
   * @default 'start'
   */
  align?: MPAlign;
  /**
   * How the bar sits in the page's scroll, spelled the way CSS spells it.
   *
   * `sticky` — the default — holds it against the top of the window once the
   * page has scrolled to it, while leaving it in the flow so nothing has to be
   * padded out of its way. `fixed` takes it out of the flow entirely, which an
   * [MPPageLayout](./page-layout) answers by reserving its height. `static` lets
   * it scroll away.
   * @default 'sticky'
   */
  position?: MPPosition;
  /**
   * How much surface the bar paints, on the **container** ladder — the bar is
   * never dyed, because what sits on it arrives with colours of its own.
   *
   * `tonal` is the default and is MD3's own scrolled top app bar:
   * `surface-container` against the page's `surface`. `outlined` is the flat one
   * — the page's own surface with a hairline where it ends — and `text` paints
   * nothing at all, which is what a bar over a hero image wants.
   * @default 'tonal'
   */
  variant?: MPVariant;
  /**
   * The bar's height floor, its gutter and the air between its slots.
   *
   * `md` is 64px, which is MD3's own small top app bar. It is a floor rather
   * than a height: a bar whose middle slot wrapped onto a second line would
   * otherwise clip it.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Holds the row of slots to a measure and centres it while the sheet itself
   * still spans the window. The same prop [MPContainer](./container)'s
   * `maxWidth` is — a rung of the size ladder, a CSS length of your own, or a
   * map keyed by window size class — so a header and the container under it line
   * up on one edge by being given the same value.
   * @default 'none'
   */
  maxWidth?: MPResponsive<MPMeasure>;
  /**
   * The gutter down each side of the row.
   * @default true
   */
  padded?: boolean;
  /**
   * The name the bar is announced by. Worth writing when a page has more than
   * one `<header>` in it — an article's own and the site's — because "banner"
   * twice tells a reader which is which not at all.
   */
  label?: string;
  /**
   * Renders something other than a `<header>`. Base UI's own escape hatch, and
   * rarely what you want: at the top level of a document that tag *is* the
   * `banner` landmark, and it is what says so to a screen reader's landmark
   * list, to a reader mode and to a crawler.
   */
  render?: useRender.RenderProp;
  /** The middle slot: a row of navigation links, a search field, a headline. */
  children?: React.ReactNode;
}

/**
 * The bar's floor.
 *
 * Its own ladder rather than `CONTROL_HEIGHT`, because a bar is not a control:
 * it *holds* controls, and a bar the height of the button in it is a bar with no
 * air. `md` is MD3's own small top app bar at 64dp, and the rest keeps that
 * proportion. The specification's medium and large bars — 112 and 152dp — are
 * two-line bars with the headline underneath rather than taller versions of
 * this one, so they are not on the ladder.
 */
const BAR_HEIGHT: Record<MPSize, string> = {
  xs: 'min-h-12',
  sm: 'min-h-14',
  md: 'min-h-16',
  lg: 'min-h-20',
  xl: 'min-h-24'
};

/**
 * What the brand is set in.
 *
 * `title-large` at `md`, which is MD3's own top app bar headline. Only the
 * *brand* takes a type role: the middle slot is as likely to be a row of links
 * or a search field as a headline, and a scale imposed on it would be a scale
 * every one of those had to undo. Type sets nothing about a logo image either
 * way.
 */
const BAR_TITLE: Record<MPSize, string> = {
  xs: 'text-mp-title-small',
  sm: 'text-mp-title-medium',
  md: 'text-mp-title-large',
  lg: 'text-mp-headline-small',
  xl: 'text-mp-headline-medium'
};

/** Inside one slot — between a mark and the name beside it, or between two buttons. */
const SLOT_GAP: Record<MPSize, string> = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-5'
};

/**
 * Between the brand, the middle and the actions — about twice the gap *inside* a
 * slot, and a separate ladder for that reason.
 *
 * The three slots are three regions, and a region has to read as one. With a
 * single gap doing both jobs the first navigation link sits as far from the mark
 * as the mark sits from its own name, so the eye groups the wrong things and the
 * bar reads as one undifferentiated row.
 */
const BAR_GAP: Record<MPSize, string> = {
  xs: 'gap-3',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10'
};

const POSITION: Record<MPPosition, string> = {
  static: '',
  absolute: 'absolute inset-x-0 top-0 z-30',
  // `top-0` and nothing else: a header is what everything else starts below, so
  // it is the one thing in a layout with nothing above it to clear.
  sticky: 'sticky top-0 z-30',
  fixed: 'fixed inset-x-0 top-0 z-40'
};

/**
 * How the three slots divide the bar.
 *
 * `center` is the one that needs explaining. Centring the middle in the space
 * *left over* puts it wherever the brand happens to end, so a name one character
 * longer moves the navigation — which is exactly what a reader notices between
 * two pages of the same site. Giving both ends `flex-1 basis-0` makes them equal
 * by construction, and equal ends put the middle on the bar's own midline
 * whatever is in them.
 */
const END: Record<MPAlign, string> = {
  start: 'shrink-0',
  center: 'flex-1 basis-0',
  end: 'shrink-0'
};

const MIDDLE: Record<MPAlign, string> = {
  start: 'flex min-w-0 flex-1 items-center justify-start',
  center: 'flex min-w-0 shrink items-center justify-center',
  end: 'flex min-w-0 flex-1 items-center justify-end'
};

/**
 * The bar across the top of a page. **MD3's top app bar**, with the site's own
 * three regions on it.
 *
 * A real `<header>`, which is the whole reason it is a component rather than a
 * row of divs: at the top level of a document that tag is the `banner` landmark,
 * and it is what a screen reader's landmark list, a reader mode and a search
 * engine's understanding of the page are built out of.
 *
 * The slots are props rather than compound sub-components, for
 * [MPCard](./card)'s reason: the arrangement is fixed — brand, middle, actions —
 * and what a caller wants to decide is what goes in each. That the middle can be
 * centred on the bar's own midline is only possible *because* the ends are the
 * component's to measure.
 *
 * ## Why there is no `divider`
 *
 * [MPBottomNavigation](./bottom-navigation) has one and this does not, and the
 * difference is that this takes a `variant`. MD3 separates a bar from the
 * content by **tone** — `surface-container` against `surface` — and the case a
 * hairline exists for is the bar that paints the page's own surface. That bar is
 * `variant="outlined"`, and the rule is what `outlined` *means* here: a
 * container's outline is a hairline all the way round, and a bar has exactly one
 * edge with anything on the other side of it.
 *
 * ## Inside a layout, and outside one
 *
 * Inside an [MPPageLayout](./page-layout) the bar registers itself, so a column
 * that holds its place knows how far down the window to start and a `fixed` bar
 * has its height reserved. Outside one it is simply a bar, and everything above
 * still holds.
 */
export const MPHeader = React.forwardRef<HTMLElement, MPHeaderProps>(function MPHeader(
  {
    brand,
    actions,
    align = 'start',
    position = 'sticky',
    variant = 'tonal',
    size: sizeProp,
    maxWidth = 'none',
    padded = true,
    label,
    render,
    className,
    children,
    ...props
  },
  ref
) {
  const size = useMPSize(sizeProp);
  const mins = useWindowMins();
  const { register } = React.useContext(MPPageLayoutContext);

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      register('header', node);

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [register, ref]
  );

  return useRender({
    render: render ?? <header />,
    ref: setRef,
    props: {
      'aria-label': label,
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: [
        'mp-header text-mp-on-surface box-border w-full min-w-0',
        BAR_SURFACE[variant],
        variant === 'outlined' ? 'border-mp-outline-variant border-b' : '',
        POSITION[position],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      children: (
        <div
          className={[
            'flex w-full items-center',
            BAR_HEIGHT[size],
            BAR_GAP[size],
            padded ? SHEET_PAD_X[size] : '',
            maxWidth === 'none' ? '' : 'mp-measure mx-auto'
          ]
            .filter(Boolean)
            .join(' ')}
          style={
            maxWidth === 'none'
              ? undefined
              : responsiveSlots('measure', withBaseline(maxWidth, 'none'), (value) =>
                  measureValue(value, mins)
                )
          }
        >
          {hasContent(brand) ? (
            <div
              className={[
                'mp-header__brand flex min-w-0 items-center',
                END[align],
                SLOT_GAP[size],
                BAR_TITLE[size]
              ].join(' ')}
            >
              {brand}
            </div>
          ) : align === 'center' ? (
            // An empty leading end still takes its half, or the middle would be
            // centred on the space left over rather than on the bar.
            <div aria-hidden="true" className={END[align]} />
          ) : null}

          {hasContent(children) ? (
            <div className={`mp-header__middle ${MIDDLE[align]} ${SLOT_GAP[size]}`}>{children}</div>
          ) : null}

          {hasContent(actions) ? (
            <div
              className={[
                'mp-header__actions flex min-w-0 items-center justify-end',
                END[align],
                SLOT_GAP[size]
              ].join(' ')}
            >
              {actions}
            </div>
          ) : align === 'center' ? (
            <div aria-hidden="true" className={END[align]} />
          ) : null}
        </div>
      ),
      ...props
    }
  });
});
