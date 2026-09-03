import { useWindowClass } from '../internal/window-class';
import type { MPWindowClass } from '../types';

/**
 * Which of Material's five window size classes the window is in.
 *
 * The library has always had this axis — `MPGrid` reflows along it, `MPResponsive`
 * is written in terms of it, `MPSidebar` collapses at it — and a consumer could
 * name the classes in a prop without ever being able to *ask* which one they
 * were in. So a page that wanted one more decision than a prop covers had to
 * write the four breakpoints out again, in numbers that had to match the
 * library's or the layout would disagree with itself at one width.
 *
 * ```tsx
 * const size = useMPWindowClass();
 *
 * return size === 'compact' ? <MPDrawer>{nav}</MPDrawer> : <MPSidebar>{nav}</MPSidebar>;
 * ```
 *
 * ## It reads the media queries, not the width
 *
 * Which is what keeps it agreeing with the stylesheet. `innerWidth` counts a
 * classic scrollbar and a media query does not, so a 615px window with a 15px
 * scrollbar is `medium` to CSS and `compact` to arithmetic — a layout whose
 * JavaScript and whose CSS part company at exactly one width, which is the
 * hardest kind of bug to be shown.
 *
 * It also subscribes to the four boundaries rather than to `resize`. A window
 * dragged from 500 to 1900 wakes this four times; a `resize` listener wakes
 * several hundred, for the same four answers.
 *
 * ## On a server
 *
 * There is no window, so there is no true answer — and this returns `onServer`,
 * which is `'expanded'` unless you say otherwise. That is a **guess**, and the
 * argument is there because an application usually knows better than the library
 * does: a marketing site's first paint is mostly phones and `'compact'` is the
 * closer bet, an internal dashboard's is not.
 *
 * The client corrects it on hydration. `useSyncExternalStore` is what makes that
 * correction legitimate rather than a mismatch React warns about — but the
 * correction is a second render, so a component that swaps a whole navigation
 * pattern on this will do so visibly on a first load. Where that matters, the
 * CSS answer is the one that has no first render to be wrong: `MPGrid`'s
 * responsive props and Tailwind's own variants are resolved by the browser
 * before anything paints.
 *
 * ## Where the boundaries come from
 *
 * MD3's own, unless an `MPConfigProvider` above this moved them — its
 * `breakpoints` prop is the JavaScript half of a page that has moved the
 * stylesheet's too. See the provider for why moving one without the other is
 * worse than moving neither.
 *
 * @param onServer what to answer where there is no window. @default 'expanded'
 */
export function useMPWindowClass(onServer: MPWindowClass = 'expanded'): MPWindowClass {
  return useWindowClass(onServer);
}
