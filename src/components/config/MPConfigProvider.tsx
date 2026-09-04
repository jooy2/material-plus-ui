import * as React from 'react';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { MPConfigContext, useMPConfig, type MPConfigValue } from '../../internal/config';
import { MPLocaleContext, useMPLocale } from '../../internal/locale';
import { WINDOW_CLASSES } from '../../internal/window-class';
import type { MPColor, MPDensity, MPSize, MPWindowClass } from '../../types';

export interface MPConfigProviderProps {
  /**
   * The size every control under this starts at.
   *
   * `md` is Material's own and is what a component takes when nobody says
   * anything — see `MPSize`. A design that runs at `sm` sets it here once
   * instead of at the several hundred call sites that would otherwise each have
   * to repeat it, and each be a place it can be forgotten.
   */
  size?: MPSize;
  /**
   * The accent family every control under this reads.
   *
   * `primary` unless set. A product themed on `secondary` or `tertiary` is one
   * line here rather than a prop on every button, chip, tab and slider.
   */
  color?: MPColor;
  /**
   * How tightly every component that holds things is packed under this.
   *
   * `0` unless set — the size that was asked for, with nothing taken out. A
   * product that runs dense sets it here, and only the containers read it: the
   * lists, tables and cards tighten and the controls keep the height a finger
   * needs. See `MPDensity`.
   */
  density?: MPDensity;
  /**
   * Where the window size classes begin, in CSS pixels, for everything the
   * library decides in **JavaScript** — `useMPWindowClass`, `MPSidebar`'s
   * collapse, and the rungs `maxWidth` resolves to.
   *
   * Partial and merged over MD3's own, so `{ medium: 700 }` moves one boundary
   * and leaves the other three. `compact` is always nought whatever it is given:
   * a first class whose floor is above zero leaves a band of windows in no class
   * at all.
   *
   * ## This does not move the stylesheet
   *
   * It cannot. A media query is resolved before any of this runs and cannot name
   * a custom property, so `MPGrid`'s reflow, `MPShow`'s hiding and every other
   * width-driven rule are decided by the CSS the build produced. This prop is
   * how you tell the JavaScript side what you already did on the CSS side — it
   * is not the source, and a page that sets it alone has moved half its layout.
   *
   * The CSS side is a project that runs its own Tailwind, redeclaring both
   * halves of the boundary after importing the library:
   *
   * ```css
   * @custom-variant mp-medium (@media (width >= 700px));
   * @custom-variant mp-below-medium (@media (width < 700px));
   * ```
   *
   * A project on the compiled `material-plus-ui/styles.css` cannot move the
   * stylesheet at all, and should not set this either. See
   * [Breakpoints](../../design/breakpoints).
   */
  breakpoints?: Partial<Record<MPWindowClass, number>>;
  /**
   * The language the components speak — the same value `MPLocaleProvider` takes,
   * carried here so an application needs one provider rather than two.
   */
  locale?: string;
  /**
   * Which way the text runs, for everything under it.
   *
   * This is the one prop here that reaches **two** systems, because the
   * direction is answered in two places and they have to agree:
   *
   * - **The stylesheet** reads the DOM's own `dir`. Every padding, margin and
   *   corner in this library is already a logical property, so the CSS half of
   *   RTL has always worked from a `dir` attribute anywhere above a component.
   * - **Base UI** reads a React context, and there was nothing putting one
   *   there. Seven of its parts consult it — the slider, menu, select, combobox,
   *   navigation menu, OTP field and scroll area — and without it they were all
   *   being told the page ran left to right. The visible one was the slider,
   *   whose handle sat exactly one handle-width off the value it was reporting,
   *   at every value, and hung off the end of the track at the extremes.
   *
   * Given here, both are set: the attribute goes on a `display: contents`
   * element, which takes part in no layout at all, and the same value goes into
   * Base UI's own `DirectionProvider`. Left out, nothing is rendered and nothing
   * is claimed — a page that sets `dir` on `<html>` and never mounts this still
   * gets the CSS half and not the other one.
   */
  dir?: 'ltr' | 'rtl';
  children?: React.ReactNode;
}

/**
 * The prop defaults for everything under it.
 *
 * Wrap the application. Every component in this library still takes `size` and
 * `color` of its own — and every container takes `density` — and this is where
 * those props get their default, so a design that runs at `size="sm"` is one
 * decision rather than one per call site.
 *
 * ```tsx
 * <MPConfigProvider size="sm" color="tertiary" locale="ko">
 *   <App />
 * </MPConfigProvider>
 * ```
 *
 * ## Why it carries these three and not a theme
 *
 * Everything a theme normally holds is already a CSS custom property here — the
 * colour roles, the type scale, the corners, the motion durations. Those reach a
 * component through the cascade, which means a *section* of a page can differ
 * from the rest of it without a provider at all and without a re-render. A JS
 * theme object would be a second place the same values live.
 *
 * `size` is the one thing that cannot travel that way. It resolves to literal
 * Tailwind class strings — `h-14`, `text-mp-body-large` — because Tailwind finds
 * classes by scanning source text and an interpolated `h-${n}` generates no rule
 * at all. A value that cannot be a custom property and has to reach every call
 * site is exactly what context is for. `color` and `density` join it because the
 * three are the axes a whole product is usually set on together — and because
 * `density` resolves to class strings for the same reason `size` does.
 *
 * ## Why `variant` is not here
 *
 * Because there is no such thing as *the* default variant. `MPAccordion` starts
 * `outlined`, `MPAlert` `tonal`, `MPBadge` `filled`, `MPButton` `filled`,
 * `MPChip` `outlined` — five answers to five different questions about emphasis.
 * One global value would overwrite all five with an arbitrary one, and the
 * component that looked wrong afterwards would give no clue why.
 *
 * ## What it does not override
 *
 * A component that had chosen its own default keeps it. `MPBadge` is `error`
 * because a badge is usually a count of something that wants attention;
 * `MPTooltip` is `sm` because a tooltip at a control's height is a slab;
 * `MPDialog`, `MPPill` and `MPShortcut` are `secondary`. Those are answers
 * rather than unfilled defaults, so the configuration passes them by — set the
 * prop to move them.
 *
 * ## Nesting
 *
 * Providers nest and **merge**, nearest wins per field. A section that only
 * changes the accent keeps the size the provider above it set:
 *
 * ```tsx
 * <MPConfigProvider size="sm">
 *   <App />
 *   <MPConfigProvider color="error">
 *     <DangerZone /> // size="sm" still, color="error" now
 *   </MPConfigProvider>
 * </MPConfigProvider>
 * ```
 */
export function MPConfigProvider({
  size,
  color,
  density,
  breakpoints,
  locale,
  dir,
  children
}: MPConfigProviderProps) {
  const outer = useMPConfig();
  const outerLocale = useMPLocale();

  /*
   * The boundaries as one string, so that the memo below can depend on what they
   * *are* rather than on the identity of the object holding them. `breakpoints`
   * is a map, and a map is written inline — `breakpoints={{ medium: 700 }}` is a
   * new object on every render of whatever holds this provider, and a memo keyed
   * on it would rebuild the context value every time and re-render every
   * consumer in the tree.
   */
  const ladder = WINDOW_CLASSES.map(
    (name) => breakpoints?.[name] ?? outer.breakpoints?.[name] ?? ''
  ).join(',');

  // Merged rather than replaced, so a nested provider that names one field does
  // not silently reset the others to the library's defaults — and memoised on
  // the values rather than on the objects, so a parent re-rendering with the
  // same configuration does not re-render every consumer below.
  const value = React.useMemo<MPConfigValue>(
    () => ({
      size: size ?? outer.size,
      color: color ?? outer.color,
      density: density ?? outer.density,
      // Merged a field at a time for the same reason: a nested provider that
      // moves `large` should not put `medium` back where the specification had
      // it. `undefined` rather than an empty object when nobody has set one, so
      // `useWindowMins` can return the shared ladder untouched.
      breakpoints:
        breakpoints || outer.breakpoints ? { ...outer.breakpoints, ...breakpoints } : undefined
    }),
    // `ladder` stands in for the two breakpoint maps, by value rather than by
    // identity — which is the whole of why it exists. See above.
    [size, color, density, outer.size, outer.color, outer.density, ladder]
  );

  const resolvedLocale = locale ?? outerLocale;

  const content = (
    <MPConfigContext.Provider value={value}>
      <MPLocaleContext.Provider value={resolvedLocale}>{children}</MPLocaleContext.Provider>
    </MPConfigContext.Provider>
  );

  if (!dir) {
    return content;
  }

  // `display: contents` rather than a plain wrapper, so that one prop can set
  // both halves of the direction without the provider becoming a box. The
  // element takes part in no layout: its children are laid out as though it were
  // not there, which is what lets this go around a flex or grid child without
  // becoming one.
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} style={{ display: 'contents' }}>
        {content}
      </div>
    </DirectionProvider>
  );
}

/**
 * The configuration in force at this point in the tree.
 *
 * Exported for the reason `useMPLocale` is: an application that has told this
 * library its size and its accent should not have to tell itself the same thing
 * twice. A wrapper component of your own around one of these can resolve a prop
 * the way the component underneath will.
 *
 * The fields are optional, and `undefined` means "nobody set one" rather than
 * `md` or `primary` — the library's own defaults are applied by the components,
 * not stored here, so that a future change of default is one place.
 */
export { useMPConfig };
export type { MPConfigValue };
