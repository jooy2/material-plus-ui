import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { BAR_SURFACE, MPPageLayoutContext } from '../../internal/page-layout';
import { MEASURE, SHEET_PAD_X, SHEET_PAD_Y } from '../../internal/scale';
import type { MPPosition, MPSize, MPVariant } from '../../types';

export interface MPFooterProps extends Omit<React.ComponentPropsWithoutRef<'footer'>, 'title'> {
  /**
   * How the sheet sits in the page's scroll.
   *
   * `static` — the default, and the opposite of [MPHeader](./header)'s — is what
   * a footer *is*: the thing at the end of the document, reached by scrolling to
   * it. `sticky` and `fixed` are for the bar that has to stay in reach — a
   * form's save row, a cookie notice — and an [MPPageLayout](./page-layout)
   * reserves the height a `fixed` one takes out of the flow.
   * @default 'static'
   */
  position?: MPPosition;
  /**
   * How much surface the sheet paints, on the **container** ladder — a footer is
   * never dyed, because what sits on it arrives with colours of its own.
   *
   * `outlined` is the default here and `tonal` is [MPHeader](./header)'s,
   * because the two sit against different things. A header is over content that
   * is passing underneath it and needs a tone of its own to stay legible; a
   * footer has the end of the document above it and nothing below, so the
   * hairline is the whole of what says the document ended.
   * @default 'outlined'
   */
  variant?: MPVariant;
  /**
   * The sheet's scale — its gutter and the air above and below its content. As
   * on [MPBox](./box), `size` here is the size of the *sheet*: it sets no height
   * and no type scale.
   * @default 'md'
   */
  size?: MPSize;
  /**
   * Holds the content to a measure and centres it while the sheet itself still
   * spans the window. The same ladder [MPContainer](./container)'s `maxWidth`
   * uses.
   * @default 'none'
   */
  maxWidth?: MPSize | 'none';
  /**
   * The gutter, and the air above and below.
   * @default true
   */
  padded?: boolean;
  /**
   * The name the region is announced by. Worth writing when a page has more than
   * one `<footer>` in it — an article's own and the site's.
   */
  label?: string;
  /**
   * Renders something other than a `<footer>`. Base UI's own escape hatch, and
   * rarely what you want: at the top level of a document that tag is the
   * `contentinfo` landmark, and it is what says "this is the site's own
   * information" rather than "this is more of the article".
   */
  render?: useRender.RenderProp;
  /**
   * Everything in it.
   *
   * A footer's content is four columns of links on one site and a single line on
   * the next, all of it the caller's — which is why this component has slots for
   * nothing and room for anything.
   */
  children?: React.ReactNode;
}

const POSITION: Record<MPPosition, string> = {
  static: '',
  absolute: 'absolute inset-x-0 bottom-0 z-30',
  sticky: 'sticky bottom-0 z-30',
  fixed: 'fixed inset-x-0 bottom-0 z-40'
};

/**
 * The sheet at the end of a page.
 *
 * A real `<footer>`, which is the whole reason it is a component rather than a
 * div: at the top level of a document that tag is the `contentinfo` landmark —
 * the region a screen reader offers as "the site's own information", and the one
 * a search engine reads the copyright, the address and the site map out of.
 *
 * ## Why it has no slots, and [MPHeader](./header) does
 *
 * Because a header's three regions are a fixed arrangement worth writing once,
 * and a footer's content is not an arrangement at all. Four columns of links on
 * one site, a copyright line on the next, a language picker and a row of logos
 * on the third. A component that guessed would be a component every second site
 * had to fight.
 *
 * What it decides instead is the **sheet**: the surface, the gutter, the measure,
 * and whether it stays in reach. Everything above that is an
 * [MPGrid](./grid) or an [MPContainer](./container) the caller puts inside it.
 *
 * ## Inside a layout, and outside one
 *
 * Inside an [MPPageLayout](./page-layout) it registers itself, so a `fixed`
 * footer's height is reserved rather than sitting on top of the last paragraph.
 * Outside one it is simply a sheet.
 */
export const MPFooter = React.forwardRef<HTMLElement, MPFooterProps>(function MPFooter(
  {
    position = 'static',
    variant = 'outlined',
    size = 'md',
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
  const { register } = React.useContext(MPPageLayoutContext);

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      register('footer', node);

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [register, ref]
  );

  return useRender({
    render: render ?? <footer />,
    ref: setRef,
    props: {
      'aria-label': label,
      'data-mp-size': size,
      'data-mp-variant': variant,
      className: [
        'mp-footer text-mp-on-surface box-border w-full min-w-0',
        BAR_SURFACE[variant],
        // The top edge, which is the only one with anything on the other side of
        // it — the same single-edge rule `MPHeader` draws along its bottom.
        variant === 'outlined' ? 'border-mp-outline-variant border-t' : '',
        POSITION[position],
        className ?? ''
      ]
        .filter(Boolean)
        .join(' '),
      children: (
        <div
          className={[
            'mp-footer__inner w-full',
            padded ? `${SHEET_PAD_X[size]} ${SHEET_PAD_Y[size]}` : '',
            maxWidth === 'none' ? '' : `${MEASURE[maxWidth]} mx-auto`
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      ),
      ...props
    }
  });
});
